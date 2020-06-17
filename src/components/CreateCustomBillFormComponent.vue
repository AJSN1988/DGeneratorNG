<template>
	<q-card class="custom-bill">
		<q-card-section class="bg-orange">
			<div class="custom-bill__title">Настраиваемая квитанция на оплату услуг связи</div>
			<div
				class="custom-bill__annotation"
			>С помощью данной формы можно создать квитанцию на оплату производльных услуг связи, просто корректно заполнив все поля формы, но не более двух. Если вам необходимо сформировать квитанцию на большее количество услуг - просто воспользуйтесь данной формаой несколько раз</div>
			<div class="custom-bill-form">
				<q-form class="q-gutter-md" ref="customBillForm">
					<q-list dark bordered class="rounded-borders bg-orange">
						<!-- Client's data accordion -->
						<q-expansion-item
							:label="'Данные о клиенте'"
							icon="portrait"
							header-class="text-white bg-primary"
							group="clientGroup"
							default-opened
						>
							<q-input
								filled
								v-model="billNumber"
								type="number"
								label="Номер квитанции"
								hint="Укажите учетный номер квитанции (номера могут перескаться)"
								lazy-rules
								:rules="[ val => /^[0-9]{1,5}$/.test(val) || 'Укажите число от 1 до 5 знаков']"
								class="custom-bill-form__input"
							/>
							<q-input
								filled
								v-model="client.account"
								type="number"
								label="Номер лицевого счета"
								hint="Укажите лицевой счет клиента (номер счета является именем квитанции)"
								lazy-rules
								:rules="[ val => /^[0-9]{4,5}$/.test(val) || 'Укажите число от 4 до 5 знаков']"
								class="custom-bill-form__input"
								:disable="lockDataInput"
							/>
							<q-input
								filled
								v-model="client.user"
								label="Полное имя"
								hint="Укажите полное имя клиента"
								lazy-rules
								:rules="[val => val && /^[а-яёЁА-Я0-9\s-]{5,50}$/.test(val) || 'Неккоректное имя клиента']"
								class="custom-bill-form__input"
								:disable="lockDataInput"
							/>
							<q-input
								filled
								v-model="client.address"
								label="Почтовый адрес"
								hint="Укажите адрес проживания клиента"
								lazy-rules
								:rules="[val => val && /^.*$/.test(val) || 'Неккоректный адрес']"
								class="custom-bill-form__input"
								:disable="lockDataInput"
							/>
						</q-expansion-item>
						<!-- End client's data accordion -->
						<q-btn
							color="none"
							flat
							text-color="primary"
							icon="add_circle_outline"
							label="Добавить услугу"
							class="custom-bill-form__btn"
							:disable="servicesCount == 2"
							@click="addService"
						/>
						<!-- Services accordion -->
						<div class="custom-bill-form__services" v-if="services">
							<q-expansion-item
								:label="`Пользовательская услуга связи - ${index + 1}`"
								header-class="text-white bg-primary"
								icon="vertical_split"
								group="clientGroup"
								v-for="(service, index) in services"
								:key="index"
							>
								<q-input
									filled
									v-model="service.vid"
									type="number"
									label="ID услуги"
									hint="Укажите ID услуги, который будет отображаться в QR коде"
									lazy-rules
									:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите целое число']"
									class="custom-bill-form__input"
								/>
								<q-input
									filled
									v-model="service.name"
									label="Наименование услуги"
									hint="Укажите полное наименование услуги связи"
									lazy-rules
									:rules="[val => val && /^[а-яёЁА-Я0-9\s-]{10,50}$/.test(val) || 'Неккоректное наименование услуги']"
									class="custom-bill-form__input"
								/>
								<q-input
									filled
									v-model="service.summ"
									type="number"
									label="Сумма к оплате"
									hint="Укажите сумму к оплате в копейках (требование банка)"
									lazy-rules
									:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите сумму в копейках']"
									class="custom-bill-form__input"
								/>
								<q-btn
									color="none"
									flat
									text-color="orange"
									icon="remove_circle_outline"
									label="Удалить услугу"
									class="custom-bill-form__btn bg-primary"
									@click="removeService(index)"
								/>
							</q-expansion-item>
						</div>
						<!-- End service accordion -->
					</q-list>
				</q-form>
			</div>
		</q-card-section>
		<q-card-actions align="center" class="bg-orange">
			<q-btn flat :label="'Сформировать'" @click="createCustomBill" />
			<q-btn flat :label="'Отмена'" @click="actions.close" />
		</q-card-actions>
	</q-card>
</template>

<script>
import BillGenerator from "../utils/docs/billGenerator";
import { mapGetters, mapActions } from "vuex";

export default {
	name: "CreateCustomBillComponent",
	props: {
		data: {
			type: Object,
			required: false
		},
		actions: {
			type: Object,
			required: false
		}
	},
	created() {
		if (this.$props.data.account) {
			this.client = this.$props.data;
			this.lockDataInput = true;
		} else {
		}
	},
	data() {
		return {
			services: [],
			servicesCount: 0,
			lockDataInput: false,
			client: {
				account: "",
				user: "",
				address: ""
			},
			billNumber: 1
		};
	},
	methods: {
		createCustomBill() {
			this.$refs.customBillForm.validate().then(async valid => {
				if (valid && this.servicesCount) {
					// Create custom bill after validation
					const generator = new BillGenerator(
						this.periodGetter,
						this.appConfigGetter.bills
					);
					// Close form from props action
					this.$props.actions.close();
					// Create bill
					try {
						const billPath = await generator.generateSingleBill(
							this.client,
							this.services,
							this.billNumber,
							"custom",
							"single"
						);
						// Show correct notification from props action
						this.$props.actions.notificate(
							`Платежная квитанция для ${this.client.user} сгенерирована.Вы можете выбрать любое доступное действие для сгенерированной квитанции, нажав соотвествующую кнопку ниже`,
							billPath,
							`Квитанция на оплату услуг связи для ${this.client.user}`,
							"Платежная квитанция для физичекого лица. Файл с квитанцией прикреплен ниже. Перед печатью убедитесь в корректности указанных данных.",
							`Квитанция для ${this.client.user} успешно отправлена на почту, указанную в настройках вашего пользователя`
						);
					} catch (err) {
						// Set error status
						this.setAppStatus({
							level: "ERROR",
							message: `Создание квитанции : [ERR MSG] Невозможно создать квитанцию : ${err}`
						});
						// Show error notification
						this.$q.notify({
							timeout: 2000,
							color: "orange",
							textColor: "primary",
							icon: "error",
							message:
								"Произошла ошибка при формировании квитанции. Для информации обратитесь к log-файлу"
						});
					}
				} else {
					this.$q.dialog({
						title: "Ошибка валидации",
						message:
							'Один или несколько полей формы квитанции некорректны. Либо вы не добавили ни одной услуги. Нажмите кнопку "ОК". Исправьте некорректные поля и повторите попытку.',
						style: {
							backgroundColor: "#FECE1A"
						}
					});
				}
			});
		},
		addService() {
			// Increment count services
			this.servicesCount++;
			// Add model
			this.services.push({
				vid: "",
				name: "",
				summ: ""
			});
		},
		removeService(index) {
			// Decrement count services
			this.servicesCount--;
			// Remove service from model
			this.services.splice(index, 1);
		},
		...mapActions("AppState", ["setAppStatus"])
	},
	computed: {
		...mapGetters("AppState", ["periodGetter"]),
		...mapGetters("AppState", ["appConfigGetter"])
	}
};
</script>

<style lang="scss" scoped>
@import "../css/app.scss";

.custom-bill {
	width: 500px;
	&__title {
		text-transform: uppercase;
		font-size: 1em;
	}
	&__annotation {
		margin-top: 10px;
		font-size: 0.75em;
	}
	.custom-bill-form {
		padding-top: 16px;
		&__input {
			margin-bottom: 9px;
			font-size: 1em;
		}
		&__btn {
			margin: 10px 0;
		}
	}
}
</style>