<template>
	<q-card class="bg-grey-9 collect-details">
		<q-card-section>
			<p>{{ description }}</p>
			<button @click="createAllClientDetails">Сформировать все детализации</button>
			<show-dir docType="details" />
		</q-card-section>
		<!-- Create all details dialog -->
		<q-dialog v-model="showCreateAllDetailDialog" ref="CreateAllDetailDialog" :persistent="true">
			<q-card style="max-width: 750px">
				<q-card-section class="bg-orange">
					<waiting-component
						:options="{
              title: 'Формирование детализация для всех клиентов',
              annotation: 'Если вы хотите прервать процесс формирования детализаций, нажмите кнопку Отмена. Это прервет формирование детализаций и очистит рабочий каталог.',
              progress: true
            }"
					/>
				</q-card-section>
				<q-card-actions align="center" class="bg-orange">
					<q-btn
						flat
						:label="progressWorkGetter === -1 ? 'Закрыть' : 'Отмена'"
						@click="cancelCreateAllDetails"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<!-- End create all details dialog -->
	</q-card>
</template>

<script>
import WaitingComponent from "./WaitingEndWorkComponent.vue";
import ShowDir from "./ShowDirBtnComponent.vue";

import { openDocsLocation, sendMail } from "../utils/commonUtils";
import DetailGenerator from "../utils/docs/detailGenerator";
import { mapGetters, mapActions } from "vuex";

export default {
	name: "CollectDetailsComponent",
	props: {
		clientsList: {
			type: Array,
			required: true
		},
		clientsGroup: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: true
		}
	},
	components: {
		WaitingComponent,
		ShowDir
	},
	data() {
		return {
			showCreateAllDetailDialog: false,
			cancelCreateAllDetailsFlag: false
		};
	},
	methods: {
		async getClientCalls(client) {
			// Get all clients MG/MN calls
			try {
				const firstPeriodDay = this.periodGetter.firstDay;
				const lastPeriodDay = this.periodGetter.lastDay;
				const accountID = client["account_id"];
				return await this.$Mysql.doQuery(
					"getMgMnCalls",
					accountID,
					firstPeriodDay,
					lastPeriodDay
				);
			} catch (err) {
				this.setAppStatus({
					level: "ERROR",
					message: `Подключение к базе данных UTM : [ERR MSG] Запрос \"getMgMnCalls\" не может быть выполнен по причине : ${err}`
				});
				throw err;
			}
		},
		async createAllClientDetails() {
			this.showCreateAllDetailDialog = true;
			this.cancelCreateAllDetailsFlag = false;
			// Set prepare status
			this.setAppStatus({
				level: "INFO",
				message:
					"Формирование детализаций : [INFO MSG] Приступаю к формированию детализаций МГ/МН соединений для клиентов - физических лиц"
			});
			const clientsWithMgCalls = this.$props.clientsList.filter(
				client => client["mg_summ"]
			);
			try {
				// Create docs generator
				const generator = new DetailGenerator(
					this.periodGetter,
					this.appConfigGetter.details,
					this.$props.clientsGroup
				);
				let detailNumber = 1;
				this.setProgressWork(0.0); // Reset progress
				const progressStep = 1 / clientsWithMgCalls.length;
				let detailPath = "";
				for (let client of clientsWithMgCalls) {
					// Cancel this operation
					if (this.cancelCreateAllDetailsFlag) {
						// User cancel creating all details. Need empty current details directory
						await generator.emptyDetailCollectionDirectory();
						// Set cancel collect bills status
						this.setAppStatus({
							level: "INFO",
							message: `Формирование детализаций : [INFO MSG] Формирование детализаций МГ/МН соединений для всех клиентов - физических было отменено пользователем`
						});
						// Hide create all details dialog
						this.showCreateAllDetailDialog = false;
						return false;
					}
					// Need client's call list
					const calls = await this.getClientCalls(client);
					// Create detail
					detailPath = await generator.generateSingleDetail(
						client,
						calls,
						detailNumber,
						"collect",
						this.appConfigGetter.reports.ndsvalue
					);
					detailNumber++;
					// Set progress
					this.setProgressWork(this.progressWorkGetter + progressStep);
					// Set current work status
					this.setAppStatus({
						level: "INFO",
						message: `Формирование детализаций : [INFO MSG] Детализация для ${client["full_name"]} успешно сформирована`
					});
				}
				// All details was comlited
				this.showCreateAllDetailDialog = false;
				this.setAppStatus({
					level: "INFO",
					message: `Формирование детализаций : [INFO MSG] Детализации для клиентов - физических лиц успешно сформированы`
				});
				// Show actions notification
				this.showActionsNotify(
					"Все детализаци МГ/МН вызовов для клиентов-физических лиц были успешно сформированы. Опционально выберите доступные действия с этими документами.",
					detailPath
				);
			} catch (err) {
				// Set error status
				this.setAppStatus({
					level: "ERROR",
					message: `Формирование детализаций : [ERR MSG] Произошла ошибка во время формирования детализаций для физических лиц - причина : ${err}`
				});
				this.setProgressWork(0.0); // -1 means error in converting cdr
				this.showCreateAllDetailDialog = false;
				return false;
			}
		},
		cancelCreateAllDetails() {
			// Hide working status dialog
			if (this.progressWorkGetter === -1) {
				this.setProgressWork(0.0);
			} else {
				this.cancelCreateAllDetailsFlag = true;
			}
			this.showCreateAllDetailDialog = false;
		},
		showActionsNotify(msg, attachPath) {
			this.$q.notify({
				message: msg,
				color: "orange",
				icon: "question_answer",
				timeout: 25000,
				multiLine: true,
				textColor: "primary",
				badgeStyle: "max-width: 700px;",
				actions: [
					{
						label: "Открыть в проводнике",
						color: "primary",
						handler: () => {
							// Open file explorer
							openDocsLocation(attachPath);
						}
					},
					{
						icon: "close",
						color: "primary",
						handler: () => {}
					}
				]
			});
		},
		...mapActions("AppState", ["setAppStatus"]),
		...mapActions("AppState", ["setProgressWork"])
	},
	computed: {
		...mapGetters("AppState", ["progressWorkGetter"]),
		...mapGetters("AppState", ["appConfigGetter"]),
		...mapGetters("AppState", ["periodGetter"])
	}
};
</script>

<style lang="scss" scoped>
@import "../css/app.scss";

.collect-details {
	button {
		@include coloredButton($primary, $orange, $orange, none, 10px 15px);
	}
}
</style>