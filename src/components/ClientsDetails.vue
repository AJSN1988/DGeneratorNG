<template>
	<q-layout
		view="hHh lpR fFf"
		class="clients-details-layout"
		v-if="clientsList && !showClientsQueryDialog"
	>
		<app-header />
		<side-menu />
		<q-page-container class="clients-details-container">
			<top-info
				:crumb="{ 
        prev: {
          icon: 'home',
          route: 'main'
        },
        current: {
          label: topInfoLabel, icon: 'home'
        }
       }"
			/>
			<div class="q-pa-md bg-orange text-white accordion">
				<q-list dark bordered class="rounded-borders bg-primary">
					<q-expansion-item
						icon="dashboard"
						label="Сформировать все детализации"
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
						default-opened
					>
						<collect-details
							:clientsList="clientsList"
							:clientsGroup="clientsGroup"
							:description="description"
						/>
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
						label="Сформировать детализацию для клиента"
						default-opened
						header-class="text-white"
						group="clientsGroup"
						class="accordion__item"
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									Каждому клиенту из списка возможно сформировать детализацию исходящего МГ\МН трафика за выбранный отчетный период.
									Для того, чтобы сформировать детализацию, найдите клиента в списке и в разделе "Действия" нажмите на соответствующую кнопку.
									Не забудьте Убедитесься в корректности в правильности отчетного периода.
								</p>
								<div v-if="enableExportSection">
									<p>
										В случае, необходимости экспортировать список клиентов в другую информационную систему, можно
										воспользоваться экспортном списка клиентов в csv файл. Для этого нажмите кнопку "Экспортировать в csv"
									</p>
									<p>
										<button @click="exportClientsList">Экспортировать в csv</button>
									</p>
								</div>
								<clients-list
									:clients="clientsList"
									:actions="[{
                    func: createDetail,
                    lockFieldName: 'mg_summ',
                    icon: 'event_note',
                    color: 'amber',
                    label: 'Сгенерировать детализацию',
                    disableLabel: 'Отсутствует МГ/МН трафик'
                  }]"
									:columns="columns"
									:paginationOptions="paginationProps"
									:filterPlaceholder="'Поиск (Счет, Логин, ФИО, Адрес)'"
								/>
							</q-card-section>
						</q-card>
					</q-expansion-item>
				</q-list>
			</div>
			<!-- Get single calls detail for a client dialog -->
			<q-dialog v-model="showSingleDetailDialog" ref="singleDetailDialog" :persistent="true">
				<q-card style="max-width: 700px">
					<q-card-section class="bg-orange">
						<waiting-component
							:options="{
              title: `Формирую детализацию для ${clientNameForSingleDetail}`,
              annotation: 'Дождитесь выполнения процесса создания детализации. После успешного завершения процесса, во всплывающей подсказке можно выбрать доступные действия с сформированными документами. В случае возникновения ошибки, нажмите кнопку Закрыть и обратитесь к log-файл для получения информации об ошибке',
              progress: false,
              waitingLabel: 'Создаю стандартную квитанцию на оплату услуг связи'
            }"
						/>
					</q-card-section>
					<q-card-actions align="center" class="bg-orange" v-if="progressWorkGetter === -1">
						<q-btn flat :label="'Закрыть'" @click="closeDialog('showSingleDetailDialog')" />
						<!-- Maybe need refactoring it -->
					</q-card-actions>
				</q-card>
			</q-dialog>
			<!-- End single calls detail for a client dialog -->
			<!-- Export clients to CSV dialog -->
			<q-dialog v-model="showExportClientsListToCSV" ref="exportClientsListToCSV" :persistent="true">
				<q-card style="max-width: 700px">
					<q-card-section class="bg-orange">
						<waiting-component
							:options="{
              title: 'Экспорт списка клиентов в CSV файл',
              annotation: 'Дождитесь выполнения процесса экспорта списка клиентов. После успешного завершения процесса, во всплывающей подсказке можно выбрать доступные действия с сформированными документами. В случае возникновения ошибки, нажмите кнопку Закрыть и обратитесь к log-файл для получения информации об ошибке',
              progress: false,
              waitingLabel: 'Экспортирую список клиентов в CSV файл'
            }"
						/>
					</q-card-section>
					<q-card-actions align="center" class="bg-orange" v-if="progressWorkGetter === -1">
						<q-btn flat :label="'Закрыть'" @click="closeDialog('showExportClientsListToCSV')" />
					</q-card-actions>
				</q-card>
			</q-dialog>
			<!-- End export clients to CSV dialog -->
			<!-- Reconnection dialog -->
			<connection-modal />
			<!-- End reconnection dialog -->
		</q-page-container>
		<app-footer />
	</q-layout>
	<q-layout v-else>
		<!-- Get clients list dialog -->
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
		<!-- End get clients list dialog -->
	</q-layout>
</template>

<script>
import AppLoading from "../components/LoadingAppComponent.vue";
import AppHeader from "../components/Header.vue";
import SideMenu from "../components/SideMenu.vue";
import TopInfo from "../components/ContainerTopInfo.vue";
import ConvertCdr from "../components/ConvertCdrsComponent.vue";
import ClientsList from "../components/ClientsList.vue";
import CollectDetails from "../components/CollectDetails.vue";
import WaitingComponent from "../components/WaitingEndWorkComponent.vue";
import AppFooter from "../components/Footer.vue";
import ConnectionModal from "../components/ConnectionModal.vue";

import { openDocsLocation, sendMail } from "../utils/commonUtils";
import { mapGetters, mapActions } from "vuex";
import DetailGenerator from "../utils/docs/detailGenerator";
import DocsGenerator from "../utils/docs/docsGenerator";
import ClientsListCSVConverter from "../utils/docs/clientsListCSVConverter";

export default {
	name: "ClientsDetailsPage",
	components: {
		AppHeader,
		SideMenu,
		TopInfo,
		AppLoading,
		ConvertCdr,
		ClientsList,
		CollectDetails,
		WaitingComponent,
		AppFooter,
		ConnectionModal
	},
	props: {
		clientsGroup: {
			type: String,
			required: true
		},
		paginationProps: {
			type: Object,
			required: true
		},
		columns: {
			type: Array,
			required: true
		},
		topInfoLabel: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: true
		},
		enableExportSection: {
			type: Boolean,
			required: true
		}
	},
	created() {
		this.getClients();
	},
	data() {
		return {
			clientsList: null,
			showClientsQueryDialog: false,
			clientNameForSingleDetail: "",
			showSingleDetailDialog: false,
			showExportClientsListToCSV: false
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
		getClients() {
			this.showClientsQueryDialog = true;
			const tarifID =
				this.$props.clientsGroup === "civil"
					? this.appConfigGetter.reports.civilid
					: this.appConfigGetter.reports.legalid;
			const firstPeriodDay = this.periodGetter.firstDay;
			const lastPeriodDay = this.periodGetter.lastDay;
			this.setAppStatus({
				level: "INFO",
				message:
					"Подключение к базе данных UTM : [INFO MSG] Подключение к базе данных UTM активно. Приступаю к получению списка клиентов"
			});
			this.$Mysql
				.doQuery("getClientsWithSumm", firstPeriodDay, lastPeriodDay, tarifID)
				.then(result => {
					// Fill clients model
					this.clientsList = result;
					// Compile MG/MN summ for a clients list
					const generator = new DocsGenerator(this.periodGetter);
					for (let client of this.clientsList) {
						// client["mg_summ_label"] = generator.compileSumm(client["mg_summ"]);
						client["mg_summ_label"] = (client["mg_summ"] / 100).toFixed(2);
					}
					this.setAppStatus({
						level: "INFO",
						message:
							'Подключение к базе данных UTM : [INFO MSG] Запрос "getClientsWithSumm" успешно выполнен'
					});

					this.showClientsQueryDialog = false;
				})
				.catch(err => {
					// Set progress work in -1 value. It set waiting component in error state
					this.setProgressWork(-1);
					this.setAppStatus({
						level: "ERROR",
						message: `Подключение к базе данных UTM : [ERR MSG] Запрос "getClientsWithSumm" не может быть выполнен по причине : ${err}`
					});
				});
		},
		async createDetail(client) {
			this.showSingleDetailDialog = true;
			this.clientNameForSingleDetail = client["full_name"];
			try {
				// Need client's call list
				const calls = await this.getClientCalls(client);
				// Create docs generator
				const generator = new DetailGenerator(
					this.periodGetter,
					this.appConfigGetter.details,
					this.$props.clientsGroup
				);
				const detailNumber = 1;
				const detailPath = await generator.generateSingleDetail(
					client,
					calls,
					detailNumber,
					"single",
					this.appConfigGetter.reports.ndsvalue
				);
				// Hide dialog
				this.showSingleDetailDialog = false;
				// Show sucsess notification
				this.showActionsNotify(
					`Детализация МГ/МН соединений для ${this.clientNameForSingleDetail} сгенерирована. Вы можете выбрать любое доступное действие для сгенерированной квитанции, нажав соотвествующую кнопку ниже`,
					detailPath,
					`Детализация МГ/МН соединений для ${this.clientNameForSingleDetail}`,
					"Детализация МГ/МН соединений для физичекого лица. Файл с детализацией прикреплен ниже. Перед печатью убедитесь в корректности отчетного периода.",
					`Детализация для ${this.clientNameForSingleDetail} успешно отправлена на почту, указанную в настройках вашего пользователя`
				);
			} catch (err) {
				// Set progress work in -1 value. It set waiting component in error state
				this.setProgressWork(-1);
				this.setAppStatus({
					level: "ERROR",
					message: `Формирование детализации вызывов : [ERR MSG] Детализация для ${client["full_name"]} не может быть сформирована по причине : ${err}`
				});
			}
		},
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
		closeDialog(modelName) {
			this[modelName] = false;
			this.setProgressWork(0.0);
		},
		resetError() {
			// Clear work progress and go to start screen
			this.showClientsQueryDialog = false;
			this.setProgressWork(0.0);
			this.setServerConnection(false);
			this.$router.push({ path: "/" });
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
		async exportClientsList() {
			// Export clients list to csv file
			this.showExportClientsListToCSV = true;
			const titles =
				this.clientsGroup === "civil"
					? [
							{ name: "account_id", title: "Лицевой счет" },
							{ name: "login", title: "Логин" },
							{ name: "full_name", title: "ФИО клиента" },
							{ name: "mg_summ_label", title: "Сумма МГ/МН (c учетом НДС)" }
					  ]
					: [
							{ name: "account_id", title: "Лицевой счет" },
							{ name: "login", title: "Логин" },
							{ name: "comments", title: "Номер договора МГ/МН" },
							{ name: "full_name", title: "Наименование клиента" },
							{ name: "mg_summ_label", title: "Сумма МГ/МН" }
					  ];
			try {
				const converter = new ClientsListCSVConverter(
					this.periodGetter,
					titles,
					this.appConfigGetter.reports
				);
				const exportedFilePath = await converter.createClientsCSVFile(
					this.clientsList,
					this.$props.clientsGroup
				);
				// Show sucsess info and set properly status
				this.setAppStatus({
					level: "INFO",
					message: `Экспорт списка клиентов в CSV : [INFO MSG] Экспорт списка клиентов в CSV файл успешно завершен`
				});
				// Show notifiaction
				this.showActionsNotify(
					`Список клиентов был успешно экспортирован в CSV файл. Вы можете выбрать любое доступное действие для сгенерированной квитанции, нажав соответствующую кнопку ниже`,
					exportedFilePath,
					`Список клиентов ${
						this.$props === "civil" ? "физических" : "юридических"
					} лиц за ${this.periodGetter.label}`,
					`Список клиентов - ${
						this.$props === "civil" ? "физических" : "юридических"
					} лиц с суммой МГ/МН соединений. CSV файл можно открыть любым приложением - текстовым редактором (Notepad, Notepad++, SublimeText, etc). Либо экспортировать в электронную таблицу (Excel, LibreOffice Calc). Имейте ввиду, что файл сохранен в кодировке UTF8.`,
					`CSV файл со списком клиентов - ${
						this.$props === "civil" ? "физических" : "юридических"
					} лиц успешно отправлен на почту, указанную в настройках вашего пользователя`
				);
				this.showExportClientsListToCSV = false;
			} catch (err) {
				// Set progress work in -1 value. It set waiting component in error state
				this.setProgressWork(-1);
				this.setAppStatus({
					level: "ERROR",
					message: `Экспорт списка клиентов в CSV : [ERR MSG] Невозможно экспортировать список клиентов в CSV файл по причине : ${err}`
				});
			}
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
@import "../css/app.scss";

.clients-details-layout {
	min-width: 1024px;
	overflow-y: hidden;
	.clients-details-container {
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
			}
		}
		.detail-actions {
			.detail-actions_title {
				text-transform: uppercase;
				font-size: 1em;
			}
			.detail-actions_annotation {
				margin-top: 10px;
				font-size: 0.75em;
			}
		}
	}
}
</style>