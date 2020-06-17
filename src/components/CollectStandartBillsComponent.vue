<template>
	<q-card class="bg-grey-9 collect-bills">
		<q-card-section>
			<p>
				Для того, чтобы сформировать список кватанций для каждого клиента физического лица,
				выберите отчетный период (предприятие использует постоплату за свои услуги,
				соответственно учитывайте этот факт, генерируя квитанции) и нажмите кнопку "Сформировать все квитанции".
				Список клиентов, признаки принадлежности к группе "Физические лица" описываются непосредственно в биллинговой системе UTM5.
			</p>
			<button @click="collectAllStandartBills">Сформировать все квитанции</button>
			<show-dir docType="bills" />
		</q-card-section>
		<!-- Collect bills dialog -->
		<q-dialog v-model="showCollectBillsDialog" ref="showCollectBillsDialog" :persistent="true">
			<q-card style="max-width: 700px">
				<q-card-section class="bg-orange">
					<waiting-component
						:options="{
              title: 'Формирование квитанций для всех клиентов',
              annotation: 'Если вы хотите прервать процесс формирования квитанций, нажмите кнопку Отмена. Это прервет формирование квитанций и очистит рабочий каталог.',
              progress: true
            }"
					/>
				</q-card-section>
				<q-card-actions align="center" class="bg-orange">
					<q-btn
						flat
						:label="progressWorkGetter === -1 ? 'Закрыть' : 'Отмена'"
						@click="cancelCollectBills"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<!-- End collect bills dialog -->
	</q-card>
</template>

<script>
import WaitingComponent from "./WaitingEndWorkComponent.vue";
import ShowDir from "./ShowDirBtnComponent.vue";

import { openDocsLocation, sendMail } from "../utils/commonUtils";
import BillGenerator from "../utils/docs/billGenerator";
import { mapGetters, mapActions } from "vuex";

export default {
	name: "CollectStandartBillsComponent",
	props: {
		clientsList: {
			type: Array,
			required: true
		}
	},
	components: {
		WaitingComponent,
		ShowDir
	},
	data() {
		return {
			showCollectBillsDialog: false,
			cancelCollectFlag: false
		};
	},
	methods: {
		async collectAllStandartBills() {
			// Show working dialog
			this.showCollectBillsDialog = true;
			// Set prepare status
			this.setAppStatus({
				level: "INFO",
				message:
					"Формирование квитанций : [INFO MSG] Приступаю к формированию стандартных квитанций для всех клиентов"
			});
			// Start generation all client bills
			const generator = new BillGenerator(
				this.periodGetter,
				this.appConfigGetter.bills
			);
			// Clear collection directory
			await generator.removeCollectionBillsDirectiry();
			this.setProgressWork(0.0); // Reset progress
			const progressStep = 1 / this.clientsList.length;
			let billNumber = 1;
			let docPath = "";
			try {
				for (let i = 0; i < this.$props.clientsList.length; i++) {
					if (this.cancelCollectFlag) {
						// User cancel collect bills. Need remove current bills collection directory
						await generator.removeCollectionBillsDirectiry();
						// Set cancel collect bills status
						this.setAppStatus({
							level: "INFO",
							message: `Формирование квитанций : [INFO MSG] Формирование квитанций для всех клиентов было отменено пользователем`
						});
						// Hide collect bills dialog
						this.showCollectBillsDialog = false;
						break;
					}
					const client = this.$props.clientsList[i];
					// const mgSumm = await this.getClientSumm(client);
					// Prepare data
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
					docPath = await generator.addBillInCollection(
						clientData,
						services,
						billNumber
					);
					billNumber++;
					// Set progress
					this.setProgressWork(this.progressWorkGetter + progressStep);
					this.setAppStatus({
						level: "INFO",
						message: `Формирование квитанций для физических лиц : [INFO MSG] Стандартная квитанция для ${client["full_name"]} успешно сформирована и добавлена в коллекцию`
					});
				}
			} catch (err) {
				// Set error status
				this.setAppStatus({
					level: "ERROR",
					message: `Формирование квитанций для физических лиц : [ERR MSG] Произошла ошибка во время формирования стандартных квитанций - причина : ${err}`
				});
				this.setProgressWork(0.0); // -1 means error in converting cdr
				this.showCollectBillsDialog = false;
				return false;
			}
			if (this.cancelCollectFlag) {
				this.cancelCollectFlag = false;
				return false;
			}
			// Show sucsess notification and close collect bills dialog
			this.showCollectBillsDialog = false;
			this.showActionsNotify(
				"Все квитанции были успешно сформированы и сохранены согласно форматированию по улицам. Опционально выберите доступные действия с этими документами.",
				docPath
			);
		},
		cancelCollectBills() {
			// Hide working status dialog
			if (this.progressWorkGetter === -1) {
				this.setProgressWork(0.0);
			} else {
				this.cancelCollectFlag = true;
			}
			this.showCollectBillsDialog = false;
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

.collect-bills {
	button {
		@include coloredButton($primary, $orange, $orange, none, 10px 15px);
	}
}
</style>