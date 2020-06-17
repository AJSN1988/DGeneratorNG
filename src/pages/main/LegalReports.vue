<template>
	<q-layout
		v-if="clientsList && !showClientsQueryDialog"
		view="hHh lpR fFf"
		class="legal-reports-layout"
	>
		<app-header />
		<side-menu />
		<q-page-container class="legal-reports-container">
			<top-info
				:crumb="{ 
        prev: {
          icon: 'person_outline',
          route: '/'
        },
        current: {
          label: 'Отчетные документы (юридические лица)', icon: 'monetization_on'
        }
       }"
			/>
			<div class="q-pa-md bg-orange text-white accordion">
				<q-list dark bordered class="rounded-borders bg-primary">
					<q-expansion-item
						icon="report"
						label="Сформировать отчет по МГ/МН соединениям (для выставления счетов)"
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
						default-opened
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									Для того, чтобы сформировать отчет по МГ/МН соединениям для клиентов - юридических лиц
									необходимо указать (либо убедиться в корректности сгенерированного) номер (идентификатор)
									платежного документа (счета-фактуры) и нажать кнопку "Сформировать отчет по МГ/МН соединениям". Дополнительно
									присутсвует возможность экспорта данного отчета в CSV файл (не рекомендуется использовать данный
									экспорт как основной отчет). Для этого установите соответствующий перключатель. Также не забывайте
									проверять активный расчетный период.
								</p>
								<p>
									<q-toggle :label="'Экспортировать отчет в CSV'" color="orange" v-model="exportToCSV" />
								</p>
								<p style="max-width: 250px">
									<q-input
										outlined
										v-model="getBillnumber"
										type="number"
										label="Номер последней счет-фактуры"
										dark
										color="white"
										:disable="true"
									/>
								</p>
								<button @click="createReportForBills">Сформировать отчет по МГ/МН соединениям</button>
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
					<q-expansion-item
						icon="face"
						label="Информация о МГ/МН трафике клиентов - юридических лиц"
						default-opened
						header-class="text-white"
						group="clientsGroup"
						class="accordion__item"
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									Данный раздел предназначен для получения информации по оказанным услугам связи
									автоматическим методом. Допустимо использовать для получения информации по услугам
									связи, оказанным клиенту - юридическому лицу.
								</p>
								<p></p>
								<p>
									<q-markup-table dark class="bg-grey-8">
										<tbody>
											<tr>
												<td>Итого юридические лица без НДС</td>
												<td>{{ getTotal.legalNoTax }}</td>
											</tr>
											<tr>
												<td>Итого юридические лица с НДС</td>
												<td>{{ getTotal.legalWithTax }}</td>
											</tr>
										</tbody>
									</q-markup-table>
								</p>
								<p>
									<q-markup-table dark class="bg-grey-8">
										<tbody>
											<tr>
												<td>Итого физические лица без НДС</td>
												<td>{{ getTotal.civilNoTax }}</td>
											</tr>
											<tr>
												<td>Итого физические лица с НДС</td>
												<td>{{ getTotal.civilWithTax }}</td>
											</tr>
										</tbody>
									</q-markup-table>
								</p>
								<clients-list
									:clients="clientsList"
									:columns="columns"
									:paginationOptions="paginationProps"
									:filterPlaceholder="'Поиск (Счет, Логин, ФИО, Адрес)'"
								/>
							</q-card-section>
						</q-card>
					</q-expansion-item>
				</q-list>
			</div>
			<!-- Create reports dialog -->
			<q-dialog v-model="showCreateReportsDialog" ref="createReportsDialog" :persistent="true">
				<q-card style="max-width: 700px">
					<q-card-section class="bg-orange">
						<waiting-component
							:options="{
              title: 'Формирование отчетных документов',
              annotation: 'Дождитесь окончания выполнения запроса. В случае возникновения ошибки, нажмите кнопку Закрыть и обратитесь к log-файл для получения информации об ошибке',
              progress: false,
              waitingLabel: 'Формирую отчет по оказанным услугам связи'
            }"
						/>
					</q-card-section>
					<q-card-actions align="center" class="bg-orange" v-if="progressWorkGetter === -1">
						<q-btn flat :label="'Закрыть'" @click="closeCreateReportsDialog" />
					</q-card-actions>
				</q-card>
			</q-dialog>
			<!-- End create reports dialog -->
			<!-- Reconnection dialog -->
			<connection-modal />
			<!-- End reconnection dialog -->
		</q-page-container>
		<app-footer />
	</q-layout>
	<q-layout v-else>
		<!-- Get clients dialog -->
		<q-dialog v-model="showClientsQueryDialog" ref="clientsQueryDialog" :persistent="true">
			<q-card style="max-width: 700px">
				<q-card-section class="bg-orange">
					<waiting-component
						:options="{
              title: 'Получение списка клиентов',
              annotation: 'Дождитесь окончания выполнения запроса. В случае возникновения ошибки, нажмите кнопку Закрыть и обратитесь к log-файл для получения информации об ошибке',
              progress: false,
              waitingLabel: 'Выполняется запрос к серверу'
            }"
					/>
				</q-card-section>
				<q-card-actions align="center" class="bg-orange" v-if="progressWorkGetter === -1">
					<q-btn flat :label="'Закрыть'" @click="closeGetClientsQueryDialog" />
				</q-card-actions>
			</q-card>
		</q-dialog>
		<!-- End clients dialog -->
	</q-layout>
</template>

<script>
import AppLoading from "../../components/LoadingAppComponent.vue";
import AppHeader from "../../components/Header.vue";
import SideMenu from "../../components/SideMenu.vue";
import TopInfo from "../../components/ContainerTopInfo.vue";
import ShowDir from "../../components/ShowDirBtnComponent.vue";
import ConvertCdr from "../../components/ConvertCdrsComponent.vue";
import ClientsList from "../../components/ClientsList.vue";
import WaitingComponent from "../../components/WaitingEndWorkComponent.vue";
import AppFooter from "../../components/Footer.vue";
import ConnectionModal from "../../components/ConnectionModal.vue";

import { openDocsLocation, sendMail } from "../../utils/commonUtils";
import ReportGenerator from "../../utils/docs/reportGenerator";
import DocGenerator from "../../utils/docs/docsGenerator";
import { mapGetters, mapActions } from "vuex";

export default {
	name: "LegalReportsPage",
	components: {
		AppHeader,
		SideMenu,
		TopInfo,
		AppLoading,
		ShowDir,
		ConvertCdr,
		ClientsList,
		WaitingComponent,
		AppFooter,
		ConnectionModal
	},
	created() {
		this.getClients();
	},
	data() {
		return {
			clientsList: [],
			showClientsQueryDialog: false,
			showCreateReportsDialog: false,
			exportToCSV: false,
			legalTotalSummNoTax: 0,
			legalTotalSummWithTax: 0,
			civilTotalSummWithTax: 0,
			civilTotalSummNoTax: 0,
			paginationProps: {
				sortBy: "account_id",
				descending: false,
				rowsPerPage: 50
			},
			columns: [
				{
					name: "account_id",
					required: true,
					label: "Счет",
					align: "left",
					field: "account_id",
					format: val => `${val}`,
					sortable: true
				},
				{
					name: "full_name",
					align: "left",
					label: "Наименование",
					field: "full_name",
					sortable: true
				},
				{
					name: "zone_summ",
					align: "center",
					label: "ВНЗ без НДС",
					field: "zone_summ",
					sortable: true,
					sort: (a, b) => parseFloat(a) - parseFloat(b)
				},
				{
					name: "zone_summ_with_tax",
					align: "center",
					label: "ВНЗ с НДС",
					field: "zone_summ_with_tax",
					sortable: true,
					sort: (a, b) => parseFloat(a) - parseFloat(b)
				},
				{
					name: "mg_summ",
					align: "center",
					label: "МГ без НДС",
					field: "mg_summ",
					sortable: true,
					sort: (a, b) => parseFloat(a) - parseFloat(b)
				},
				{
					name: "mg_summ_with_tax",
					align: "center",
					label: "МГ с НДС",
					field: "mg_summ_with_tax",
					sortable: true,
					sort: (a, b) => parseFloat(a) - parseFloat(b)
				},
				{
					name: "mn_summ",
					align: "center",
					label: "МН без НДС",
					field: "mn_summ",
					sortable: true,
					sort: (a, b) => parseFloat(a) - parseFloat(b)
				},
				{
					name: "mn_summ_with_tax",
					align: "center",
					label: "МН c НДС",
					field: "mn_summ_with_tax",
					sortable: true,
					sort: (a, b) => parseFloat(a) - parseFloat(b)
				},
				{
					name: "total_summ",
					align: "center",
					label: "Итого без НДС",
					field: "total_summ",
					sortable: true,
					sort: (a, b) => parseFloat(a) - parseFloat(b)
				},
				{
					name: "total_summ_with_tax",
					align: "center",
					label: "Итого с НДС",
					field: "total_summ_with_tax",
					sortable: true,
					sort: (a, b) => parseFloat(a) - parseFloat(b)
				}
			]
		};
	},
	watch: {
		periodGetter(newValue, prevValue) {
			if (newValue) {
				this.getClients();
			}
		}
	},
	methods: {
		async createReportForBills() {
			// Show create reports dialog
			this.showCreateReportsDialog = true;
			try {
				// Change report number
				let currentReportNumber = this.appConfigGetter.reports.reportnumber;
				this.setReportNumber(++currentReportNumber);
				// Create report for bills
				const generator = new ReportGenerator(
					this.periodGetter,
					this.appConfigGetter.reports,
					this.currentUserGetter.fullname
				);
				const result = await generator.generateReport(
					this.clientsList,
					this.getTotal,
					this.exportToCSV
				);
				// Change bill number
				this.setBillNumber(result.billNumber);
				// Save changed config
				await this.saveConfg();
				// Set properly status
				this.setAppStatus({
					level: "INFO",
					message: `Формирование отчетных документов : [INFO MSG] Отчет по оказанным услугам связи успешно сформирован.`
				});
				this.showCreateReportsDialog = false;
				// Show notifiaction
				this.showActionsNotify(
					`Отчет по оказанным услугам связи был успешно сформирован. Вы можете выбрать любое доступное действие для сгенерированной квитанции, нажав соотвествующую кнопку ниже`,
					result.path
				);
			} catch (err) {
				// Set progress work in -1 value. It set waiting component in error state
				this.setProgressWork(-1);
				this.setAppStatus({
					level: "ERROR",
					message: `Формирование отчетных документов : [ERR MSG] Невозможно сформировать отчетные документы по причине : ${err}`
				});
			}
		},
		async getClients() {
			// Clear total summ
			this.legalTotalSummNoTax = this.legalTotalSummWithTax = this.civilTotalSummWithTax = this.civilTotalSummNoTax = 0;
			// Clear clients list
			this.clientsList = [];
			this.showClientsQueryDialog = true;
			const legalTarifID = this.appConfigGetter.reports.legalid;
			const civilTarifID = this.appConfigGetter.reports.civilid;
			const firstPeriodDay = this.periodGetter.firstDay;
			const lastPeriodDay = this.periodGetter.lastDay;
			const tax = parseFloat(this.appConfigGetter.reports.ndsvalue);
			this.setAppStatus({
				level: "INFO",
				message:
					"Подключение к базе данных UTM : [INFO MSG] Подключение к базе данных UTM активно. Приступаю к получению списка клиентов"
			});
			try {
				// Get legal clients from DB
				const legalClientsFromQuery = await this.$Mysql.doQuery(
					"getAllLegalCallStat",
					firstPeriodDay,
					lastPeriodDay,
					tax,
					legalTarifID
				);
				this.setAppStatus({
					level: "INFO",
					message:
						'Подключение к базе данных UTM : [INFO MSG] Запрос "getAllLegalCallStat" успешно выполнен. Приступаю к форматирванию списка клиентов - юридических лиц'
				});

				for (let client of legalClientsFromQuery) {
					// Add only non-zero traffic clients
					if (client["zone_summ"] || client["mg_summ"] || client["mn_summ"]) {
						// Compile summ
						client["zone_summ"] = client["zone_summ"].toFixed(2);
						client["zone_summ_with_tax"] = (
							parseFloat(client["zone_summ"]) * tax
						).toFixed(2);
						client["mg_summ"] = client["mg_summ"].toFixed(2);
						client["mg_summ_with_tax"] = (
							parseFloat(client["mg_summ"]) * tax
						).toFixed(2);
						client["mn_summ"] = client["mn_summ"].toFixed(2);
						client["mn_summ_with_tax"] = (
							parseFloat(client["mn_summ"]) * tax
						).toFixed(2);
						//Compile total
						client["total_summ"] = (
							parseFloat(client["zone_summ"]) +
							parseFloat(client["mg_summ"]) +
							parseFloat(client["mn_summ"])
						).toFixed(2);
						client["total_summ_with_tax"] = (
							parseFloat(client["zone_summ_with_tax"]) +
							parseFloat(client["mg_summ_with_tax"]) +
							parseFloat(client["mn_summ_with_tax"])
						).toFixed(2);
						// Add to total
						this.legalTotalSummNoTax += parseFloat(client["total_summ"]);
						this.legalTotalSummWithTax += parseFloat(
							client["total_summ_with_tax"]
						);
						// Add client into list
						this.clientsList.push(client);
					}
				}
				this.setAppStatus({
					level: "INFO",
					message:
						'Подключение к базе данных UTM : [INFO MSG] Запрос "getAllLegalCallStat" успешно выполнен. Приступаю к форматирванию списка клиентов - физических лиц'
				});

				const civilClient = await this.compileCivilClientsObject();
				// Add in clients list
				this.clientsList.push(civilClient);
				// Add total labels
				this.civilTotalSummWithTax = civilClient["total_summ_with_tax"];
				this.civilTotalSummNoTax = civilClient["total_summ"];
				// Set status
				this.setAppStatus({
					level: "INFO",
					message:
						"Подключение к базе данных UTM : [INFO MSG] Список услуг связи для всех клиентов успешно сформирован"
				});
				// Close dialog
				this.showClientsQueryDialog = false;
			} catch (err) {
				// Set progress work in -1 value. It set waiting component in error state
				this.setProgressWork(-1);
				this.setAppStatus({
					level: "ERROR",
					message: `Подключение к базе данных UTM : [ERR MSG] Запрос \"getClientsWithZones\" не может быть выполнен по причине : ${err}`
				});
			}
		},
		async compileCivilClientsObject() {
			const legalTarifID = this.appConfigGetter.reports.legalid;
			const civilTarifID = this.appConfigGetter.reports.civilid;
			const firstPeriodDay = this.periodGetter.firstDay;
			const lastPeriodDay = this.periodGetter.lastDay;
			const tax = parseFloat(this.appConfigGetter.reports.ndsvalue);

			const civilClient = {
				account_id: this.appConfigGetter.reports.allcivilsaccountid,
				login: `net${this.appConfigGetter.reports.allcivilsaccountid}`,
				full_name: "Клиенты-физические лица",
				contract_number: this.appConfigGetter.reports.allcivilscontract,
				tariff_id: this.appConfigGetter.reports.civilid,
				total_summ: 0,
				total_summ_with_tax: 0,
				total_duration: 0,
				zone_summ: 0,
				zone_summ_with_tax: 0,
				zone_duration: 0,
				mg_summ: 0,
				mg_summ_with_tax: 0,
				mg_duration: 0,
				mn_summ: 0,
				mn_summ_with_tax: 0,
				mn_duration: 0
			};
			// Get civil clients from DB
			const civilClientsFromQuery = await this.$Mysql.doQuery(
				"getAllCivilCallStat",
				firstPeriodDay,
				lastPeriodDay,
				tax,
				civilTarifID
			);
			// Get data
			let zoneWT = [],
				mgWT = [],
				mnWT = [],
				totalWT = [];
			civilClientsFromQuery.forEach(client => {
				zoneWT.push(client["zone_summ_with_tax"]);
				mgWT.push(client["mg_summ_with_tax"]);
				mnWT.push(client["mn_summ_with_tax"]);
				totalWT.push(client["total_summ_with_tax"]);
				civilClient["zone_duration"] += +client["zone_duration"];
				civilClient["mg_duration"] += +client["mg_duration"];
				civilClient["mn_duration"] += +client["mn_duration"];
			});
			// With tax
			civilClient["zone_summ_with_tax"] = (
				zoneWT.reduce((prev, val) => prev + val) / 100
			).toFixed(2);
			civilClient["mg_summ_with_tax"] =
				mgWT.reduce((prev, val) => prev + val) / (100).toFixed(2);
			civilClient["mn_summ_with_tax"] =
				mnWT.reduce((prev, val) => prev + val) / (100).toFixed(2);
			// No tax (divide on NDS value)
			civilClient["zone_summ"] = (
				+civilClient["zone_summ_with_tax"] / tax
			).toFixed(2);
			civilClient["mn_summ"] = (+civilClient["mn_summ_with_tax"] / tax).toFixed(
				2
			);
			civilClient["mg_summ"] = (+civilClient["mg_summ_with_tax"] / tax).toFixed(
				2
			);
			// Total
			civilClient["total_summ"] = (
				+civilClient["zone_summ"] +
				+civilClient["mg_summ"] +
				+civilClient["mn_summ"]
			).toFixed(2);
			civilClient["total_summ_with_tax"] = (
				+civilClient["zone_summ_with_tax"] +
				+civilClient["mg_summ_with_tax"] +
				+civilClient["mn_summ_with_tax"]
			).toFixed(2);
			// Return civils stat
			return civilClient;
		},
		closeGetClientsQueryDialog() {
			// We have error in getClients query. Disconnect from Server UTM and go to login page
			this.$UtmServer
				.disconnect()
				.then(() => {
					this.resetError();
				})
				.catch(err => {
					this.setAppStatus({
						level: "ERROR",
						message: `Подключение к базе данных UTM : [ERR MSG] Ошибка при попытке закрыть соединение с базой данных : ${err}`
					});
					this.resetError();
				});
		},
		closeCreateReportsDialog() {
			// Clear creation report's work progress and close dialog
			this.setProgressWork(0.0);
			this.showCreateReportsDialog = false;
		},
		resetError() {
			// Clear work progress and go to start screen
			this.showClientsQueryDialog = false;
			this.setProgressWork(0.0);
			this.setServerConnection(false);
			this.$router.push({ path: "/" });
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
		async saveConfg() {
			// Write bill and report numbers in config
			this.config = JSON.parse(
				JSON.stringify(this.$store.state.AppState.appConfig)
			);
			try {
				await this.$ConfigDispatcher.updateConfig(this.config);
				this.setAppStatus({
					level: "INFO",
					message:
						'Обновление конфигурации : [INFO MSG] Обновление параметров "billnumber" и "reportnumber" произведено успешно. Конфигурация обновлена'
				});
			} catch (err) {
				this.setAppStatus({
					level: "ERROR",
					message: `Ошибка обновление конфигурации : [ERR MSG] Невозможно обновить конфигурцаию по причине - ${err.message}`
				});
			}
		},
		...mapActions("AppState", ["setAppStatus"]),
		...mapActions("AppState", ["setProgressWork"]),
		...mapActions("AppState", ["setServerConnection"]),
		...mapActions("AppState", ["setReportNumber"]),
		...mapActions("AppState", ["setBillNumber"])
	},
	computed: {
		getBillnumber() {
			return this.appConfigGetter.reports.billnumber;
		},
		getTotal() {
			return {
				legalNoTax: this.legalTotalSummNoTax.toFixed(2),
				legalWithTax: this.legalTotalSummWithTax.toFixed(2),
				civilNoTax: this.civilTotalSummNoTax,
				civilWithTax: this.civilTotalSummWithTax
			};
		},
		...mapGetters("AppState", ["periodGetter"]),
		...mapGetters("AppState", ["appConfigGetter"]),
		...mapGetters("AppState", ["progressWorkGetter"]),
		...mapGetters("AppState", ["currentUserGetter"])
	}
};
</script>

<style lang="scss" scoped>
@import "../../css/app.scss";

.legal-reports-layout {
	min-width: 1024px;
	overflow-y: hidden;
	.legal-reports-container {
		height: 100vh;
		background-color: $background;
		overflow-y: auto;
		.accordion {
			&__item {
				button {
					@include coloredButton($primary, $orange, $orange, none, 10px 15px);
				}
				.q-file {
					margin-bottom: 18px;
				}
				.q-markup-table tr td {
					&:nth-child(odd) {
						min-width: 300px;
					}
				}
			}
		}
	}
}
</style>