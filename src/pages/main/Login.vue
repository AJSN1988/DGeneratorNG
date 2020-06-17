<template>
	<q-page class="flex flex-center login-container">
		<app-frame />
		<div class="login-wrapper">
			<div class="info-wrapper">
				<div class="app-info">
					<img class="app-info__logo" src="../../assets/logo.png" width="120" height="40" />
					<p
						class="app-info__description"
					>Генерирование платежных документов для клиентов (физические лица, индивидуальные предприниматели, юридические лица), отчетности для техничской службы связи, b2b отчетности партнерам - операторам связи. ВАЖНО (!!!) Для работы приложения необходимо сетевое соединение с сервером UTM5. В случае невозможности подключения к серверу UTM5, ознакомьтесь с log-файлом, либо обратитесь в службу техничесой поддержки.</p>
				</div>
				<div class="recent-documents">
					<h6 class="recent-documents__header">Расположение документов</h6>
					<hr class="recent-documnets__delimeter" />
					<q-list bordered separator>
						<q-item clickable @click="openDocsDir('bills')" v-ripple :disable="billsActive">
							<q-item-section avatar>
								<q-avatar icon="folder" color="grey" text-color="white" />
							</q-item-section>
							<q-item-section>Квитанции на оплату услуг связи</q-item-section>
						</q-item>
						<q-item clickable @click="openDocsDir('details')" v-ripple :disable="detailsActive">
							<q-item-section avatar>
								<q-avatar icon="folder" color="grey" text-color="white" />
							</q-item-section>
							<q-item-section>Детализации телефонных соединений</q-item-section>
						</q-item>
						<q-item clickable @click="openDocsDir('reports')" v-ripple :disable="reportsActive">
							<q-item-section avatar>
								<q-avatar icon="folder" color="grey" text-color="white" />
							</q-item-section>
							<q-item-section>Отчетные документы</q-item-section>
						</q-item>
						<q-item clickable @click="openDocsDir('log')" v-ripple :disable="logActive">
							<q-item-section avatar>
								<q-avatar icon="folder" color="grey" text-color="white" />
							</q-item-section>
							<q-item-section>Расположение log-файла</q-item-section>
						</q-item>
					</q-list>
				</div>
			</div>
			<div class="login-form-wrapper">
				<q-form @submit="login" @reset="resetForm" class="q-gutter-md">
					<q-input
						filled
						v-model="loginInput.login"
						label="Логин"
						hint="Заполните поля и нажмите кнопку 'Войти'"
						lazy-rules
						:rules="[ val => val && val.length > 0 || 'Укажите корректный логин']"
						:disable="appCriticalErrorFlagGetter"
					/>
					<q-input
						filled
						type="password"
						v-model="loginInput.password"
						label="Пароль"
						hint="Для сброса введенных данных нажмите 'Очистить'"
						lazy-rules
						:rules="[ val => val && val.length >= 5 || 'Укажите корректный пароль']"
						:disable="appCriticalErrorFlagGetter"
					/>
					<div>
						<q-btn
							label="Очистить"
							type="reset"
							color="primary"
							flat
							class="login-form-wrapper__fixed-width-btn"
							:disable="appCriticalErrorFlagGetter"
						/>
						<q-btn
							label="Войти"
							type="submit"
							color="primary"
							class="login-form-wrapper__fixed-width-btn"
							:disable="appCriticalErrorFlagGetter"
						/>
					</div>
				</q-form>
			</div>
		</div>
		<div class="app-status">
			{{ appStatusGetter }}
			<q-tooltip
				content-class="bg-primary"
				content-style="font-size: 16px"
				:offset="[10, 10]"
			>{{ appStatusGetter }}</q-tooltip>
		</div>
	</q-page>
</template>

<script>
import AppFrame from "../../components/AppFrame";
import { mapGetters, mapActions } from "vuex";
import { checkDirectory, openDocsDirectory } from "../../utils/commonUtils";

export default {
	name: "LoginPage",
	components: {
		AppFrame
	},
	mounted() {
		try {
			this.billsActive = checkDirectory("bills");
			this.detailsActive = checkDirectory("details");
			this.reportsActive = checkDirectory("reports");
			this.logActive = checkDirectory("log");
		} catch (err) {
			this.setAppStatus({
				level: "ERROR",
				message: `Расположение документов : [ERR MSG] Приложению не удалось распознать рабочие каталоги с документами. Причина - ${err}`
			});
		}
	},
	data() {
		return {
			billsActive: false,
			detailsActive: false,
			reportsActive: false,
			logActive: true,
			loginInput: {
				login: "",
				password: ""
			}
		};
	},
	methods: {
		login() {
			const users = this.appConfigGetter().users;
			const authUser = users.find(user => {
				const { login, password } = this.loginInput;
				if (login === user.username && password === user.password) {
					return user;
				}
			});
			if (authUser) {
				this.setCurrentUser({
					level: "INFO",
					message: `Вход в систему : [INFO MSG] Пользователь ${authUser.username} (${authUser.fullname}) вошел в приложние.`,
					user: authUser
				});
				this.$router.push({ path: "/main" });
				return false;
			}
			this.resetForm();
		},
		resetForm() {
			this.loginInput.login = this.loginInput.password = "";
		},
		openDocsDir(type) {
			try {
				openDocsDirectory(type);
			} catch (err) {
				this.setAppStatus({
					level: "ERROR",
					message: `Расположение документов : [ERR MSG] Приложению не удалось открыть рабочий каталог с документами. Причина - ${err}`
				});
			}
		},
		...mapGetters("AppState", ["appConfigGetter"]),
		...mapActions("AppState", ["setCurrentUser"]),
		...mapActions("AppState", ["setAppStatus"])
	},
	computed: {
		...mapGetters("AppState", ["appStatusGetter"]),
		...mapGetters("AppState", ["appCriticalErrorFlagGetter"])
	}
};
</script>

<style lang="scss">
@import "../../css/app.scss";

.login-container {
	background-color: $background;
	.login-wrapper {
		height: 450px;
		min-height: 450px;
		width: 800px;
		min-width: 800px;
		color: $whiteText;
		@include flex(row, center, nowrap);
		.info-wrapper {
			background-color: $background1;
			width: 50%;
			.app-info {
				.app-info__logo {
					margin: 12px 0 0 12px;
				}
				.app-info__description {
					margin: 0 12px 20px;
					font-size: 10px;
					text-align: justify;
					text-indent: 12px;
					line-height: 1.5;
				}
			}
			.recent-documents {
				padding: 0 12px;
				height: 280px;
				@include flex(column, center, nowrap);
				.recent-documents__header {
					text-transform: uppercase;
					margin: 0;
				}
				.recent-documnets__delimeter {
					width: 100%;
					border: none;
					height: 1px;
					background-color: $whiteText;
				}
			}
		}
		.login-form-wrapper {
			width: 50%;
			background-color: $background2;
			.login-form-wrapper__fixed-width-btn {
				width: 50%;
				border-radius: 0;
			}
		}
	}
	.app-status {
		position: absolute;
		bottom: 12px;
		font-size: 0.75em;
		&:hover {
			cursor: pointer;
		}
	}
}
</style>