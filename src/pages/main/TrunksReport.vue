<template>
	<q-layout view="hHh lpR fFf" class="trunks-layout">
		<app-header />
		<side-menu />
		<q-page-container class="trunks-container">
			<top-info
				:crumb="{ 
        prev: {
          icon: 'home',
          route: 'main'
        },
        current: {
          label: 'Статистика по пропуску трафика (отчет по транкам)', icon: 'settings_input_component'
        }
       }"
			/>
			<div class="q-pa-md bg-orange text-white accordion">
				<q-list dark bordered class="rounded-borders bg-primary">
					<q-expansion-item
						icon="dashboard"
						label="Статистика по пропуску трафика (местное присоединение + МГ/МН)"
						default-opened
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									Иногда возникает необходимость сформировать статистику по пропуску трафика операторов - партнеров
									данный раздел приложения поможет вам сформировать все необходимые документы для взаиморасчетов
									по телефонному трафику с присодеиняющими операторами связи. Для того, чтобы сформировать отчеты по транкам
									нажмите кнопку "Сформировать отчеты по транкам". Не забудьте убедится в корректности отчетного периода.
								</p>
								<p>
									<button @click="createTrunksReports">Сформировать отчеты по транкам</button>
								</p>
								<show-dir docType="reports" />
							</q-card-section>
						</q-card>
					</q-expansion-item>
					<q-expansion-item
						icon="insert_drive_file"
						label="Работа с CDR файлами"
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
					>
						<convert-cdr />
					</q-expansion-item>
				</q-list>
			</div>
			<!-- Create trunks reports dialog -->
			<q-dialog v-model="showCreateTrunksReportsDialog" ref="createTrunksReports" :persistent="true">
				<q-card style="max-width: 700px">
					<q-card-section class="bg-orange">
						<waiting-component
							:options="{
              title: 'Статистика по транкам',
              annotation: 'Дождитесь выполнения процесса формирования отчетов. После успешного завершения процесса, во всплывающей подсказке можно выбрать доступные действия с сформированными документами. В случае возникновения ошибки, нажмите кнопку Закрыть и обратитесь к log-файл для получения информации об ошибке',
              progress: true,
              waitingLabel: 'Формирование отчета по транкам'
            }"
						/>
					</q-card-section>
					<q-card-actions align="center" class="bg-orange" v-if="progressWorkGetter === -1">
						<q-btn flat :label="'Закрыть'" @click="closeDialog('showCreateTrunksReportsDialog')" />
					</q-card-actions>
				</q-card>
			</q-dialog>
			<!-- End create trunks reports dialog -->
			<!-- Reconnection dialog -->
			<connection-modal />
			<!-- End reconnection dialog -->
		</q-page-container>
		<app-footer />
	</q-layout>
</template>

<script>
import AppHeader from "../../components/Header.vue";
import ShowDir from "../../components/ShowDirBtnComponent.vue";
import SideMenu from "../../components/SideMenu.vue";
import TopInfo from "../../components/ContainerTopInfo.vue";
import AppFooter from "../../components/Footer.vue";
import ConvertCdr from "../../components/ConvertCdrsComponent.vue";
import WaitingComponent from "../../components/WaitingEndWorkComponent.vue";
import ConnectionModal from "../../components/ConnectionModal.vue";

import { openDocsLocation, sendMail } from "../../utils/commonUtils";
import TrunkReportGenerator from "../../utils/docs/trunksReportGenerator";
import { mapGetters, mapActions } from "vuex";

export default {
	name: "TrunksReportPage",
	components: {
		AppHeader,
		SideMenu,
		TopInfo,
		ShowDir,
		ConvertCdr,
		WaitingComponent,
		AppFooter,
		ConnectionModal
	},
	mounted() {
		for (let operator of this.appConfigGetter.operators) {
			this.stat[operator.operatorname] = {
				operatorName: operator.operatorname,
				type: operator.type,
				period: this.periodGetter.label,
				trunksid: operator.trunksid,
				regex: new RegExp(`^(${operator.prefixes})\\d+`),
				duration: 0,
				callsCount: 0
			};
		}
	},
	data() {
		return {
			showCreateTrunksReportsDialog: false,
			stat: {},
			operators: []
		};
	},
	methods: {
		async createTrunksReports() {
			this.showCreateTrunksReportsDialog = true;
			this.setAppStatus({
				level: "INFO",
				message: `Формирование отчета по пропуску трафика : [INFO MSG] Получение CDR - файлов в сервера UTM5`
			});
			this.setProgressWork(0.0); // Reset progress
			try {
				await this.createStat();
				// Generate report
				const generator = new TrunkReportGenerator(
					this.periodGetter,
					this.appConfigGetter.reports
				);
				const reportPath = await generator.createTrunksReport(this.stat);
				this.setAppStatus({
					level: "INFO",
					message: `Формирование отчета по пропуску трафика : [INFO MSG] Отчет по пропуску трафика успешно сформирован`
				});
				this.showCreateTrunksReportsDialog = false;
				// Show notifiaction
				this.showActionsNotify(
					`Статистика по присоединяющим операторам успешно сгенерирована. Вы можете выбрать любое доступное действие для сгенерированного отчета, нажав соотвествующую кнопку ниже`,
					reportPath,
					`Статистика по присоединяющим операторам за  ${this.periodGetter.label}`,
					"Статистика по присоединяющим операторам. Используется для подсчета трафика через транки присоединяющих операторов",
					`Файл отчета успешно отправлен на почту, указанную в настройках вашего пользователя`
				);
			} catch (err) {
				// Set progress work in -1 value. It set waiting component in error state
				this.setProgressWork(-1);
				this.setAppStatus({
					level: "ERROR",
					message: `Формирование отчета по пропуску трафика : [ERR MSG] Невозможно сформировтаь отчет по пропуску трафика по причине - ${err}`
				});
			}
		},
		async createStat() {
			// Get remote CDR lines and compile stat
			// Init SFTP connection
			const remoteCdrsLocation = `${this.appConfigGetter.server.cdrlocation}/${this.periodGetter.short}/`;
			await this.$UtmServer.initSFTP(
				this.appConfigGetter.server,
				remoteCdrsLocation
			);
			const CDRNames = await this.$UtmServer.getRemoteCDRsNames(
				remoteCdrsLocation
			);
			if (!CDRNames.length) {
				throw new Error(
					`CDR файлы в директории ${remoteCdrsLocation} повреждены либо отсутствуют. Убедитесь в наличии и целостности файлов в каталоге.`
				);
			}
			// Set progress step
			const progressStep = 1 / CDRNames.length;
			// Read all remote CDRS
			for (let name of CDRNames) {
				const cdr = await this.$UtmServer.readRemoteCDR(
					remoteCdrsLocation,
					name.filename
				);
				// Set properly status
				this.setAppStatus({
					level: "INFO",
					message: `Формирование отчета по пропуску трафика : [INFO MSG] Обрабатываю статистику из файла - ${name.filename}`
				});
				// Collect statistics
				await this.collectOperatorsStats(cdr);
				// Change progress bar
				this.setProgressWork(this.progressWorkGetter + progressStep);
			}
		},
		async collectOperatorsStats(cdr) {
			for (let line of cdr.split("\n")) {
				const splitedLine = line.split(";");
				const numberB = splitedLine[1];
				const duration = splitedLine[2];
				for (let key of Object.keys(this.stat)) {
					if (this.stat[key].regex.test(numberB)) {
						// Add duration
						this.stat[key].duration += Number(duration);
						// Increment calls count
						this.stat[key].callsCount += 1;
					}
				}
			}
		},
		closeDialog(modelName) {
			this[modelName] = false;
			this.setProgressWork(0.0);
		},
		showActionsNotify(msg, attachPath, mailSubject, mailBody, compliteMessage) {
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
						label: "Отправить на почту",
						color: "primary",
						handler: async () => {
							// Send data to email
							try {
								await sendMail(
									attachPath,
									mailSubject,
									mailBody,
									this.appConfigGetter.mail,
									this.currentUserGetter
								);
								// Show complite notification
								this.$q.notify({
									timeout: 2000,
									color: "orange",
									textColor: "primary",
									icon: "info",
									message: compliteMessage
								});
							} catch (err) {
								this.setAppStatus({
									level: "ERROR",
									message: `Отправка email : [ERR MSG] Невозможно отправить письмо со вложенным документом по причине : ${err}`
								});
								// Show error notification
								this.$q.notify({
									timeout: 2000,
									color: "orange",
									textColor: "primary",
									icon: "error",
									message:
										"Произошла ошибка при отправке письмо со вложенным документом. Для информации обратитесь к log-файлу"
								});
							}
						}
					},
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
		...mapActions("AppState", ["setProgressWork"]),
		...mapActions("AppState", ["setServerConnection"])
	},
	computed: {
		...mapGetters("AppState", ["periodGetter"]),
		...mapGetters("AppState", ["appConfigGetter"]),
		...mapGetters("AppState", ["progressWorkGetter"]),
		...mapGetters("AppState", ["currentUserGetter"])
	}
};
</script>

<style lang="scss" scoped>
@import "../../css/app.scss";
.trunks-layout {
	min-width: 1024px;
	width: 100%;
	height: 100vh;
	background-color: $background;
	overflow-y: hidden;
	.trunks-container {
		overflow-y: auto;
	}
	.accordion {
		.accordion__item {
			button {
				@include coloredButton($primary, $orange, $orange, none, 10px 15px);
			}
			.q-file {
				margin-bottom: 18px;
			}
		}
	}
}
</style>