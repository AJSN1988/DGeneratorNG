<template>
	<q-layout
		view="hHh lpR fFf"
		class="civil-bills-layout"
		v-if="clientsList && !showClientsQueryDialog"
	>
		<app-header />
		<side-menu />
		<q-page-container class="civil-bills-container">
			<top-info
				:crumb="{ 
        prev: {
          icon: 'home',
          route: 'main'
        },
        current: {
          label: 'Физические лица (квитанции на опату услуг связи)', icon: 'home'
        }
       }"
			/>
			<div class="q-pa-md bg-orange text-white accordion">
				<q-list dark bordered class="rounded-borders bg-primary">
					<q-expansion-item
						icon="dashboard"
						label="Сформировать все квитанции"
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
						default-opened
					>
						<collect-standart-bills :clientsList="clientsList" />
					</q-expansion-item>
					<q-expansion-item
						icon="help_outline"
						label="Сформировать квитанцию для клиента, отсутствующего в биллинговой системе UTM5"
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									Если вам по какой-либо причине понадобилось сформировать платежную квитанцию
									для клиента (или не клиента), который отсутсвует в биллинговой системе UTM5, нажмите кнопку
									"Сформирвоать квитанцию", после чего корркетно заполните все поля формы.
								</p>
								<button @click="showCustomBillForm">Сформировать квитанцию</button>
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
						label="Сформировать квитанцию для клиента"
						default-opened
						header-class="text-white"
						group="clientsGroup"
						class="accordion__item"
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									Каждому клиенту из списка возможно сформировать как стандартную (усулги местной телефонной связи плюс
									услуги МГ/МН связи), так и квитанцию с настраиваемыми услугами (указывается вручную). Для того, чтобы
									сформировать конкретную квитанцию, найдите клиента в списке и в разделе "Действия" нажмите на соответствующую кнопку
								</p>
								<p>
									В случае, необходимости экспортировать список клиентов в другую информационную систему, можно
									воспользоваться экспортном списка клиентов в csv файл. Для этого нажмите кнопку "Экспортировать в csv"
								</p>
								<p>
									<button @click="exportClientsList">Экспортировать в csv</button>
								</p>
								<clients-list
									:clients="clientsList"
									:actions="[{
                    func: createStandartBill,
                    lockFieldName: 'full_name',
                    icon: 'euro',
                    color: 'amber',
                    label: 'Сгенерировать стандартную квитанцию'
                  },
                  {
                    func: showCustomBillForm,
                    lockFieldName: 'full_name',
                    icon: 'extension',
                    color: 'grey',
                    label: 'Сгенерировать настраиваемую квитанцию'
                  }]"
									:columns="dataColumns"
									:paginationOptions="paginationProps"
									:filterPlaceholder="'Поиск (Счет, Логин, ФИО, Адрес)'"
								/>
							</q-card-section>
						</q-card>
					</q-expansion-item>
				</q-list>
			</div>
			<!-- Get single bill for a client dialog -->
			<q-dialog
				v-model="showClientsMgSummQueryDialog"
				ref="clientsMgSummQueryDialog"
				:persistent="true"
			>
				<q-card style="max-width: 700px">
					<q-card-section class="bg-orange">
						<waiting-component
							:options="{
              title: `Создание квитанции для ${clientNameForSingleBill}`,
              annotation: 'Дождитесь выполнения процесса создания квитанции. После успешного завершения процесса, во всплывающей подсказке можно выбрать доступные действия с сформированными документами. В случае возникновения ошибки, нажмите кнопку Закрыть и обратитесь к log-файл для получения информации об ошибке',
              progress: false,
              waitingLabel: 'Создаю стандартную квитанцию на оплату услуг связи'
            }"
						/>
					</q-card-section>
					<q-card-actions align="center" class="bg-orange" v-if="progressWorkGetter === -1">
						<q-btn flat :label="'Закрыть'" @click="showClientsMgSummQueryDialog = false" />
					</q-card-actions>
				</q-card>
			</q-dialog>
			<!-- End single bill for a client dialog -->
			<!-- Create custom bill dialog -->
			<q-dialog v-model="showCreateCustomBillDialog" ref="createCustomBillDialog" :persistent="true">
				<custom-bill-form :data="customBillFormData" :actions="customBillFormActions" />
			</q-dialog>
			<!-- End create custom bill dialog -->
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
	</q-layout>
</template>

<script>
import AppLoading from "../../components/LoadingAppComponent.vue";
import AppHeader from "../../components/Header.vue";
import SideMenu from "../../components/SideMenu.vue";
import TopInfo from "../../components/ContainerTopInfo.vue";
import ConvertCdr from "../../components/ConvertCdrsComponent.vue";
import ClientsList from "../../components/ClientsList.vue";
import WaitingComponent from "../../components/WaitingEndWorkComponent.vue";
import CollectStandartBills from "../../components/CollectStandartBillsComponent.vue";
import CustomBillForm from "../../components/CreateCustomBillFormComponent";
import AppFooter from "../../components/Footer.vue";
import ConnectionModal from "../../components/ConnectionModal.vue";

import { openDocsLocation, sendMail } from "../../utils/commonUtils";
import BillGenerator from "../../utils/docs/billGenerator";
import ClientsListCSVConverter from "../../utils/docs/clientsListCSVConverter";
import DocGenerator from "../../utils/docs/docsGenerator";
import { openDocsDirectory } from "../../utils/commonUtils";
import { mapGetters, mapActions } from "vuex";

export default {
	name: "CivilBillsPage",
	components: {
		AppHeader,
		SideMenu,
		TopInfo,
		AppLoading,
		ConvertCdr,
		ClientsList,
		WaitingComponent,
		CollectStandartBills,
		CustomBillForm,
		AppFooter,
		ConnectionModal
	},
	data() {
		return {
			clientsList: null,
			showClientsQueryDialog: false,
			showClientsMgSummQueryDialog: false,
			clientNameForSingleBill: "",
			singleClientBillWasComplited: false,
			showBillActionsDialog: false,
			showCreateCustomBillDialog: false,
			actionsNotificationTitle: "",
			actionsNotificationAnnotation: "",
			showExportClientsListToCSV: false,
			customBillFormData: {},
			customBillFormActions: {
				close: this.closeCreateCustomBill,
				notificate: this.showActionsNotify
			},
			paginationProps: {
				sortBy: "account_id",
				descending: false,
				rowsPerPage: 50
			},
			dataColumns: [
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
					name: "login",
					required: true,
					label: "Логин",
					align: "left",
					field: "login",
					format: val => `${val}`,
					sortable: true
				},
				{
					name: "full_name",
					align: "left",
					label: "ФИО клиента",
					field: "full_name",
					sortable: true
				},
				{
					name: "actual_address",
					align: "left",
					label: "Адрес клиента",
					field: "actual_address",
					sortable: true
				},
				{
					name: "flat_number",
					align: "center",
					label: "Квартира",
					field: "flat_number"
				},
				{
					name: "mg_summ_label",
					align: "center",
					label: "Сумма МГ/МН",
					field: "mg_summ_label",
					sortable: true,
					sort: (a, b) => parseFloat(a) - parseFloat(b)
				},
				{
					name: "actions",
					label: "Действия",
					field: "",
					align: "center"
				}
			]
		};
	},
	created() {
		this.getClients();
	},
	watch: {
		periodGetter(newValue, prevValue) {
			if (newValue) {
				this.getClients();
			}
		}
	},
	methods: {
		async getClients() {
			this.showClientsQueryDialog = true;
			const tarifID = this.appConfigGetter.reports.civilid;
			const firstPeriodDay = this.periodGetter.firstDay;
			const lastPeriodDay = this.periodGetter.lastDay;
			this.setAppStatus({
				level: "INFO",
				message:
					"Подключение к базе данных UTM : [INFO MSG] Подключение к базе данных UTM активно. Приступаю к получению списка клиентов"
			});
			try {
				const result = await this.$Mysql.doQuery(
					"getClientsWithSumm",
					firstPeriodDay,
					lastPeriodDay,
					tarifID
				);
				// Fill clients model
				this.clientsList = result;
				// Compile MG/MN summ for a clients list
				const generator = new DocGenerator(this.periodGetter);
				for (let client of this.clientsList) {
					client["mg_summ_label"] = generator.compileSumm(client["mg_summ"]);
				}
				this.setAppStatus({
					level: "INFO",
					message:
						'Подключение к базе данных UTM : [INFO MSG] Запрос "getClientsWithSumm" успешно выполнен'
				});
				this.showClientsQueryDialog = false;
			} catch (err) {
				// Set progress work in -1 value. It set waiting component in error state
				this.setProgressWork(-1);
				this.setAppStatus({
					level: "ERROR",
					message: `Подключение к базе данных UTM : [ERR MSG] Запрос \"getClientsWithSumm\" не может быть выполнен по причине : ${err}`
				});
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
		resetError() {
			// Clear work progress and go to start screen
			this.showClientsQueryDialog = false;
			this.setProgressWork(0.0);
			this.setServerConnection(false);
			this.$router.push({ path: "/" });
		},
		async createStandartBill(client) {
			// Start generate client's standart bill
			this.showClientsMgSummQueryDialog = true;
			try {
				// Create bill html file
				const generator = new BillGenerator(
					this.periodGetter,
					this.appConfigGetter.bills
				);
				// Prepare data for a generator
				const clientData = {
					account: client["account_id"],
					user: client["full_name"],
					address: client["actual_address"]
				};
				const services = [
					{
						vid: 1,
						name: "Местная телефонная связь",
						summ: 33500
					},
					{
						vid: 2,
						name: "Дальняя связь (МГ/МН)",
						summ: client["mg_summ"]
					}
				];
				const billNumber = 1;
				const billPath = await generator.generateSingleBill(
					clientData,
					services,
					billNumber,
					"standart",
					"single"
				);
				this.showClientsMgSummQueryDialog = false;
				// Show notifiaction
				this.showActionsNotify(
					`Платежная квитанция для ${this.clientNameForSingleBill} сгенерирована.Вы можете выбрать любое доступное действие для сгенерированной квитанции, нажав соотвествующую кнопку ниже`,
					billPath,
					`Квитанция на оплату услуг связи для ${this.clientNameForSingleBill}`,
					"Стандартная платежная квитанция для физичекого лица. Файл с квитанцией прикреплен ниже. Перед печатью убедитесь в корректности отчетного периода.",
					`Квитанция для ${this.clientNameForSingleBill} успешно отправлена на почту, указанную в настройках вашего пользователя`
				);
				// Set bill generation OK status
				this.setAppStatus({
					level: "INFO",
					message: `Создание квитанции : [INFO MSG] Квитанция для ${this.clientNameForSingleBill} успешно сгенерирована.`
				});
			} catch (err) {
				// Set progress work in -1 value. It set waiting component in error state
				this.setAppStatus({
					level: "ERROR",
					message: `Создание квитанции : [ERR MSG] Невозможно создать квитанцию : ${err}`
				});
				this.setProgressWork(-1);
			}
		},
		showCustomBillForm(client) {
			this.showCreateCustomBillDialog = true;
			const generator = new BillGenerator(
				this.periodGetter,
				this.appConfigGetter.bills
			);
			// Fill data if client present in UTM5
			if (client.account_id) {
				this.customBillFormData = {
					account: client.account_id,
					user: client.full_name,
					address: generator.compileClientAddress(
						client.actual_address,
						client.flat_number
					)
				};
			} else {
				// Send empty data in custom bill form
				this.customBillFormData = {
					account: "",
					user: "",
					address: ""
				};
			}
		},
		closeCreateCustomBill() {
			this.showCreateCustomBillDialog = false;
		},
		closeDialog(modelName) {
			this[modelName] = false;
			this.setProgressWork(0.0);
		},
		async exportClientsList() {
			// Export clients list to csv file
			this.showExportClientsListToCSV = true;
			const titles = [
				{ name: "account_id", title: "Лицевой счет" },
				{ name: "login", title: "Логин" },
				{ name: "full_name", title: "ФИО клиента" },
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
					"civil"
				);
				// Show sucsess info and set properly status
				this.setAppStatus({
					level: "INFO",
					message: `Экспорт списка клиентов в CSV : [INFO MSG] Экспорт списка клиентов в CSV файл успешно завершен`
				});
				// Show notifiaction
				this.showActionsNotify(
					`Список клиентов был успешно экспортирован в CSV файл. Вы можете выбрать любое доступное действие для сгенерированной квитанции, нажав соотвествующую кнопку ниже`,
					exportedFilePath,
					`Список клиентов физических лиц за ${this.periodGetter.label}`,
					`Список клиентов - физических лиц с суммой МГ/МН соединений. CSV файл можно открыть любым приложением - текстовым редактором (Notepad, Notepad++, SublimeText, etc). Либо экспортировать в электронную таблицу (Excel, LibreOffice Calc). Имейте ввиду, что файл сохранен в кодировке UTF8.`,
					`CSV файл со списком клиентов - физических лиц успешно отправлен на почту, указанную в настройках вашего пользователя`
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

.civil-bills-layout {
	min-width: 1024px;
	overflow-y: hidden;
	.civil-bills-container {
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
	}
}
</style>