<template>
	<q-layout v-if="serverConnectionGetter" view="hHh lpR fFf" class="main-layout">
		<app-header />
		<side-menu />
		<q-page-container class="main-container">
			<top-info
				:crumb="{ 
        prev: {
          icon: 'person_outline',
          route: '/'
        },
        current: {
          label: 'Стартовый экран', icon: 'home'
        }
       }"
			/>
			<div class="q-pa-md bg-orange text-white accordion">
				<q-list dark bordered class="rounded-borders bg-primary">
					<q-expansion-item
						icon="dashboard"
						label="Приступая к работе"
						default-opened
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									DGenerator NG - приложение, которое позволяет генерировать и управлять платежными документами
									клиентов фиксированной связи, отчетными и финансовыми документами, а также статистику по
									транкам к присоединяющим операторам связи.
								</p>
								<p>
									Данное приложение работает с базой данных биллинговой системы UTM5, расположенной на удаленном хосте
									в локальной сети предприятия. Соответственно, в случае отсутсвия соединения с сервером, приложение
									не сможет выполнять указанные задачи.
								</p>
								<p>
									Для получения справочной информации воспользуйтесь ссылкой ниже. В случае обнаружения ошибок либо
									предложений для доработки свяжитесь с разработчиком по телефону 104.
								</p>
								<button @click="routeTo('help')">Справочная информация</button>
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
						icon="drafts"
						label="Квитанции за услуги связи физических лиц"
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									Для того, чтобы сформировать список кватанций для каждого клиента физического лица,
									перейдите в раздел по ссылке ниже, выберите отчетный период
									(предприятие использует постоплату за свои услуги, соответственно
									учитывайте этот факт, генерируя квитанции) и нажмите кнопку "Сгенерировать квитанции". Список
									клиентов, признаки принадлежности к группе "Физические лица" описываются непосредственно в
									биллинговой системе UTM5.
								</p>
								<button
									@click="routeTo('civil_bills')"
									style="margin-bottom: 16px"
								>Квитанции за услуги связи</button>
								<p>
									Если, по неведомой мне причине, появилась необходимость сгенерировать квитанцию не на основании
									списка клиентов в биллинговой системе UTM5, это возможно сделать, заполнив соответствующую форму.
								</p>
							</q-card-section>
						</q-card>
					</q-expansion-item>
					<q-expansion-item
						icon="horizontal_split"
						label="Детализации телефонных вызовов физических лиц"
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									Для того, чтобы сгенерировать детализации телефонных соединений клиентов физических лиц,
									перейдите в соответствующий раздел, нажав кнопку "Сгенерировать детализации".
									Не забывайте, что в данных детализациях учитываются только исходящий МГ/МН трафик.
									Для получения полной детализации (входящие/исходящие) воспользуйтесь инструментарием биллинговой системы UTM5.
								</p>
								<button @click="routeTo('civil_details')">Детализации вызовов</button>
							</q-card-section>
						</q-card>
					</q-expansion-item>
					<q-expansion-item
						icon="horizontal_split"
						label="Детализации телефонных вызовов юридических лиц"
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									Для того, чтобы сгенерировать детализации телефонных соединений клиентов юридических лиц,
									нажмите кнопку "Сгенерировать детализации". Не забывайте, что в данные детализации учитываются
									только исходящие МГ/МН вызовы. Для получения полной детализации (входящие/исходящие) воспользуйтесь
									инструментарием биллинговой системы UTM5.
								</p>
								<button @click="routeTo('legal_details')">Сгенерировать детализации</button>
							</q-card-section>
						</q-card>
					</q-expansion-item>
					<q-expansion-item
						icon="speaker_notes"
						label="Отчетные документы для юридических лиц"
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									Для того, чтобы сформировать отчетные документы клиентам - юридическим лицам,
									перейдите в соответствующий раздел, кликнув кнопку "Сформирмировать отчетные документы",
									не забывайте проверять корректность отчетного периода
									(предприятие использует постоплату за свои услуги, соответственно
									учитывайте этот факт, генерируя квитанции). Не забывайте контролировать правильность
									порядковой нумерации счетов-фактур. Список клиентов, признаки принадлежности к группе
									"Юридические лица" описываются непосредственно в биллинговой системе UTM5.
								</p>
								<button @click="routeTo('legal_reports')">Сформирмировать отчетные документы</button>
							</q-card-section>
						</q-card>
					</q-expansion-item>
					<q-expansion-item
						icon="settings_input_component"
						label="Статистика телефонных соединений по транкам присоединяющих операторов"
						header-class="text-white"
						group="actionsGroup"
						class="accordion__item"
					>
						<q-card class="bg-grey-9">
							<q-card-section>
								<p>
									Периодически возникают ситуации, когда присоединяющему оператору необходимо предоставить объемы
									пропускаемого трафика для осуществления взаиморасчетов. Если вы ничего не поняли из написанного, не генерируйте данную отчетность.
								</p>
								<p>
									Для того, чтобы сформировать статистику по телефонному трафику через транки Ростелекома
									, нажмите кнопку "Сгенерировать статистику Ростелеком".
								</p>
								<button
									@click="routeTo('trunks_report')"
									style="margin-bottom: 16px"
								>Сгенерировать статистику Ростелеком</button>
								<p>Для того, чтобы сформировать статистику по телефонному трафику через транк Билайна, нажмите кнопку "Сгенерировать статистику Ростелеком".</p>
								<button @click="generateTrunksDetail('beeline')">Сгенерировать статистику Билайн</button>
							</q-card-section>
						</q-card>
					</q-expansion-item>
				</q-list>
			</div>
			<!-- Reconnection dialog -->
			<connection-modal />
			<!-- End reconnection dialog -->
		</q-page-container>
		<app-footer />
	</q-layout>
	<q-layout v-else>
		<q-page-container v-if="!serverConnectionGetter" class="loading-container">
			<app-loading />
		</q-page-container>
	</q-layout>
</template>

<script>
import AppLoading from "../../components/LoadingAppComponent.vue";
import AppHeader from "../../components/Header.vue";
import SideMenu from "../../components/SideMenu.vue";
import TopInfo from "../../components/ContainerTopInfo.vue";
import ConvertCdr from "../../components/ConvertCdrsComponent.vue";
import AppFooter from "../../components/Footer.vue";
import ConnectionModal from "../../components/ConnectionModal.vue";

import ConfigDispatcher from "../../utils/configDispatcher.js";
import CdrDispatcher from "../../utils/cdrDispatcher.js";
import { mapGetters, mapActions } from "vuex";
import { date } from "quasar";

export default {
	name: "MainPage",
	components: {
		AppHeader,
		SideMenu,
		TopInfo,
		AppLoading,
		ConvertCdr,
		AppFooter,
		ConnectionModal
	},
	async created() {
		// Try connect to server
		this.setAppStatus({
			level: "INFO",
			message:
				"Подключение к серверу UTM : [INFO MSG] Попытка подключения к серверу UTM5"
		});
		if (!this.serverConnectionGetter || this.connectionErrorGetter) {
			try {
				this.setConnectionError(false);
				await this.$UtmServer.connect(
					this.appConfigGetter.server,
					this.appConfigGetter.database
				);
				this.setAppStatus({
					level: "INFO",
					message:
						"Подключение к серверу UTM : [INFO MSG] Успешно подключен к серверу UTM5"
				});
				this.setServerConnection(true);
				// Set current period
				this.calcPeriod();
			} catch (err) {
				this.setAppStatus({
					level: "ERROR",
					message: `Ошибка подключения к серверу UTM : [ERR MSG] ${err}`
				});
				this.setAppCriticalErrorFlag(true);
				this.setAppStatus({
					level: "ERROR",
					message:
						"Критическая ошибка : [ERR MSG] Работа приложения не может быть продолжена. Закройте приложение и обратитесь к log-файлу для поиска проблем"
				});
			}
		}
	},
	computed: {
		getConnectionError() {
			return this.$UtmServer.established;
		},
		...mapGetters("AppState", ["currentUserGetter"]),
		...mapGetters("AppState", ["appConfigGetter"]),
		...mapGetters("AppState", ["serverConnectionGetter"]),
		...mapGetters("AppState", ["appStatusGetter"]),
		...mapGetters("AppState", ["periodGetter"]),
		...mapGetters("AppState", ["connectionErrorGetter"])
	},
	methods: {
		routeTo(routeName, props) {
			props
				? this.$router.push({ path: routeName, props: props })
				: this.$router.push({ path: routeName });
		},
		generateDetails(clientCategory) {
			if (clientCategory === "civil") {
				return false;
			}
			if (clientCategory === "legal") {
				return false;
			}
		},
		calcPeriod() {
			const d = new Date();
			const prevMonth = d.getMonth() - 1;
			const year = d.getFullYear();

			const startPeriodUnixEpoch =
				new Date(year, prevMonth, 1).getTime() / 1000; // Include timezone offset (GMT + 3:00 Moskow)
			const endPeriodUnixEpoch =
				new Date(year, d.getMonth(), 0).getTime() / 1000 + 86400; // Include timezone offset (GMT + 3:00 Moskow)
			const formattedPeriodForLabel = date.formatDate(
				startPeriodUnixEpoch * 1000,
				"MMMM YYYY г.",
				{
					months: [
						"Январь",
						"Февраль",
						"Март",
						"Апрель",
						"Май",
						"Июнь",
						"Июль",
						"Август",
						"Сентябрь",
						"Октябрь",
						"Ноябрь",
						"Декабрь"
					]
				}
			);
			const formattedPeriodForUtils = date.formatDate(
				startPeriodUnixEpoch * 1000,
				"MM-YYYY"
			);
			const billPaymentDayDate = date.formatDate(
				(endPeriodUnixEpoch - 86400) * 1000,
				"DD.MM.YYYY HH:mm:ss"
			);
			const day = d
				.getDate()
				.toString()
				.padStart(2, "0");
			const monthNum = d.getMonth() + 1;
			const month = monthNum.toString().padStart(2, "0");

			this.setPeriod({
				firstDay: startPeriodUnixEpoch,
				lastDay: endPeriodUnixEpoch,
				short: formattedPeriodForUtils,
				label: formattedPeriodForLabel,
				billPaymentDay: billPaymentDayDate,
				today: `${day}.${month}.${d.getFullYear()}`
			});
		},
		...mapActions("AppState", ["setCurrentUser"]),
		...mapActions("AppState", ["setAppConfig"]),
		...mapActions("AppState", ["setAppStatus"]),
		...mapActions("AppState", ["setServerConnection"]),
		...mapActions("AppState", ["setAppCriticalErrorFlag"]),
		...mapActions("AppState", ["setPeriod"]),
		...mapActions("AppState", ["setConnectionError"])
	}
};
</script>

<style lang="scss" scoped>
@import "../../css/app.scss";

.main-layout {
	min-width: 1024px;
	overflow-y: hidden;
	.main-container {
		height: 100vh;
		background-color: $background;
		overflow-y: auto;
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
}
.loading-container {
	position: fixed;
	height: 100vh;
	width: 100%;
	top: 0;
}
</style>