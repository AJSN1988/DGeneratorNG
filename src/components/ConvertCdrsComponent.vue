<template>
	<q-card class="bg-grey-9 cdr-convert-file-picker">
		<q-card-section>
			<p>
				Если вы до сих пор используете отложенный сбор статистики телефонных вызовов через CDR файлы,
				то для того, чтобы биллинговая система UTM5 обработала стастистику вызывов клиентов, необходимо сформировать
				и передать на сервер UTM CDR файлы статистики с медиа-шлюза. Для этого выберите необходимые файлы и нажмите кнопку
				"Обработать CDR файлы"
			</p>
			<q-file
				filled
				bottom-slots
				v-model="loadedCdr"
				label="Выберите CDR файлы для обработки"
				label-color="white"
				counter
				multiple
				clearable
				max-files="31"
				color="white"
				bg-color="none"
				:dark="true"
			>
				<template v-slot:before>
					<q-icon name="folder_open" color="white" />
				</template>

				<template v-slot:hint>
					При выборе файлов обращайте внимание на их дату. Ни данное приложение, ни сервер UTM5 не
					проверяют дату в файлах на соответсвие отчетному периоду
				</template>
			</q-file>
			<button @click="startConvertCdrs" :disabled="!loadedCdr">Обработать CDR файлы</button>
		</q-card-section>
		<q-dialog v-model="showConvertingCdrDialog" ref="showConvertingCdrDialog" :persistent="true">
			<q-card style="max-width: 700px">
				<q-card-section class="bg-orange">
					<waiting-component
						:options="{
              title: 'Обработка CDR файлов',
              annotation: 'Если вы хотите прервать обработку CDR файлов, нажмите кнопку Отмена. Это прервет конвертирование CDR файлов и остановит передачу на сервер UTM.',
              progress: true
            }"
					/>
				</q-card-section>
				<q-card-actions align="center" class="bg-orange">
					<q-btn
						flat
						:label="progressWorkGetter === -1 ? 'Закрыть' : 'Отмена'"
						@click="cancelConvertingCdr"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
	</q-card>
</template>

<script>
import WaitingComponent from "./WaitingEndWorkComponent.vue";

import CdrDispatcher from "../utils/cdrDispatcher.js";
import { mapGetters, mapActions } from "vuex";

export default {
	name: "ConvertCdrsComponent",
	data() {
		return {
			loadedCdr: null,
			showConvertingCdrDialog: false,
			cancelConvertFlag: false
		};
	},
	components: {
		WaitingComponent
	},
	computed: {
		...mapGetters("AppState", ["progressWorkGetter"]),
		...mapGetters("AppState", ["appConfigGetter"]),
		...mapGetters("AppState", ["periodGetter"]),
		...mapGetters("AppState", ["serverConnectionGetter"])
	},
	methods: {
		startConvertCdrs() {
			// Open working status dialog
			this.showConvertingCdrDialog = true;
			// Get active conversion pattern
			const pattern = this.appConfigGetter.cdr.pattern;
			// Set current status
			this.setAppStatus({
				level: "INFO",
				message:
					"Обработка CDR файлов : [INFO MSG] Приступаю к обработке CDR файлов"
			});
			// Start converting CDR
			this.convertCdrs(this.loadedCdr, pattern).then(response => {
				this.setProgressWork(0.0);
				if (response === "complite") {
					this.setAppStatus({
						level: "INFO",
						message:
							"Обработка CDR файлов : [INFO MSG] Все CDR файлы успешно обработаны и переданы на сервер UTM5"
					});
					this.loadedCdr = null;
				} else if (response === "cancel") {
					this.setAppStatus({
						level: "INFO",
						message: `Обработка CDR файлов : [INFO MSG] Отмена обработки CDR файлов текущим пользователем`
					});
					this.cancelConvertFlag = false;
				} else {
					if (response.type === "transfer") {
						// Error in transfer into server
						this.setAppStatus({
							level: "ERROR",
							message: `Передача CDR файлов на сервер : [ERR MSG] Невозможно завершить передачу CDR файлов по причине : ${response.err.message}`
						});
					} else {
						// Error in convert function. Set error status and show error in dialog
						this.setAppStatus({
							level: "ERROR",
							message: `Обработка CDR файлов : [ERR MSG] Ошибка обработки файла ${response.cdr} : ${response.err.message}`
						});
					}
					this.setProgressWork(-1); // -1 means error in converting cdr
					return false;
				}
				this.showConvertingCdrDialog = false;
			});
		},
		async convertCdrs(files, pattern) {
			const cdrDispatcher = new CdrDispatcher(this.periodGetter.short);
			const progressStep = 1 / this.loadedCdr.length;
			const remoteCdrsLocation = `${this.appConfigGetter.server.cdrlocation}/${this.periodGetter.short}/`;
			try {
				// Init SFTP connection
				await this.$UtmServer.initSFTP(
					this.appConfigGetter.server,
					remoteCdrsLocation
				);
			} catch (err) {
				return {
					err: err,
					type: "transfer"
				};
			}

			for await (let cdr of this.filesGenerator(files)) {
				if (this.cancelConvertFlag) {
					// Cancel convert CDRs
					try {
						await cdrDispatcher.cancelPrevConverting();
						this.setAppStatus({
							level: "INFO",
							message: `Обработка CDR файлов : [INFO MSG] Все ранее обработанные файлы были успешно удалены, всвязи с отменой операции`
						});
						return "cancel";
					} catch (err) {
						return {
							cdr: cdr.name,
							err: err
						};
					}
				}
				try {
					// Convert CDR and get converted filename
					const cdrName = await cdrDispatcher.convertCdr(
						cdr,
						pattern
					);
					await this.$UtmServer.transferCDR(
						cdrName,
						cdrDispatcher.getPathToCDR(),
						remoteCdrsLocation
					);
					this.setProgressWork(
						this.progressWorkGetter + progressStep
					);
					this.setAppStatus({
						level: "INFO",
						message: `Обработка CDR файлов : [INFO MSG] Файл ${cdr.name} успешно обработан`
					});
				} catch (err) {
					return {
						cdr: cdr.name,
						type: "convert",
						err: err
					};
				}
			}
			// Close SFTP connection
			this.$UtmServer.closeSFTPConnection();
			return "complite";
		},
		async *filesGenerator(files) {
			for (let file of files) {
				yield file;
			}
		},
		cancelConvertingCdr() {
			// Hide working status dialog
			if (this.progressWorkGetter === -1) {
				this.setProgressWork(0.0);
				this.loadedCdr = null;
			} else {
				this.cancelConvertFlag = true;
			}
			this.showConvertingCdrDialog = false;
		},
		...mapActions("AppState", ["setAppStatus"]),
		...mapActions("AppState", ["setProgressWork"])
	}
};
</script>

<style lang="scss" scoped>
@import "../css/app.scss";

.cdr-convert-file-picker {
	button {
		@include coloredButton($primary, $orange, $orange, none, 10px 15px);
	}
	.q-file {
		margin-bottom: 18px;
	}
}
</style>