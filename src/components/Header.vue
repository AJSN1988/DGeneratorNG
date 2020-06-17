<template>
	<q-header elevated class="bg-primary text-white">
		<header-frame />
		<q-toolbar>
			<q-btn dense flat round icon="menu" @click="toggleSideMenuOpen()" />
			<q-toolbar-title>
				<div class="toolbar">
					<div class="toolbar__app-logo">
						<img src="../assets/logo.png" width="100" height="32" />
					</div>
					<div class="toolbar__app-name">
						DGenerator NG
						<q-badge color="warning" text-color="primary">{{ appVersion }}</q-badge>
					</div>
					<div class="toolbar__app-auth">
						<div class="username">{{ currentUserGetter.fullname }}</div>
						<button @click="quit">
							<q-icon size="18px" name="exit_to_app" color="white" />
							<span>Выйти</span>
						</button>
					</div>
				</div>
			</q-toolbar-title>
		</q-toolbar>
	</q-header>
</template>

<script>
import HeaderFrame from "./InHeaderFrame.vue";
import { mapGetters, mapActions } from "vuex";
import PJSON from "../../package.json";

export default {
	name: "AppHeaderComponent",
	components: {
		HeaderFrame
	},
	created() {
		// Get app version
		this.appVersion = PJSON.version;
	},
	data() {
		return {
			appVersion: null
		};
	},
	computed: {
		...mapGetters("AppState", ["currentUserGetter"])
	},
	methods: {
		quit() {
			// Show quit dialog
			this.$q
				.dialog({
					title: "Выход из приложения",
					message:
						'Вы действительно хотите выйти из приложения? Ответив "Да" вы корретно завершите сетевое подлючение к серверу и закроете окно программы',
					style: {
						backgroundColor: "#FECE1A"
					},
					cancel: true,
					persistent: true,
					ok: {
						label: "Да",
						flat: true
					},
					cancel: {
						label: "Нет",
						flat: true
					}
				})
				.onOk(async user => {
					// Disconnect from server
					await this.$UtmServer.disconnect();
					this.setCurrentUser({
						level: "INFO",
						message: `Выход из системы : [INFO MSG] Пользователь ${this.currentUserGetter.username} (${this.currentUserGetter.fullname}) вышел из приложения`,
						user: {}
					});
					// Set properly connection status
					this.setServerConnection(false);
					// Exit from app
					if (process.env.MODE === "electron") {
						this.$q.electron.remote.BrowserWindow.getFocusedWindow().close();
					}
				});
		},
		...mapActions("AppState", ["setCurrentUser"]),
		...mapActions("AppState", ["setServerConnection"]),
		...mapActions("AppState", ["toggleSideMenuOpen"]),
		...mapActions("AppState", ["setAppStatus"])
	}
};
</script>

<style lang="scss" scoped>
@import "../css/app.scss";

.toolbar {
	line-height: 1;
	display: flex;
	justify-content: space-between;
	.toolbar__app-logo {
		display: inline-flex;
		width: calc(30% - 58px);
		img,
		span {
			align-self: center;
		}
		span {
			padding-left: 42px;
		}
	}
	.toolbar__app-name {
		width: 60%;
		font-size: 0.75em;
		letter-spacing: 0.5px;
		align-self: center;
		text-align: center;
	}
	.toolbar__app-auth {
		display: inline-flex;
		align-self: center;
		justify-content: flex-end;
		font-size: 12px;
		letter-spacing: 1px;
		padding-right: 12px;
		width: 30%;
		.username {
			align-self: center;
			padding-right: 12px;
			font-size: 0.875rem;
		}
		button {
			@include mainButton($white, $orange, 5px 10px, 0 10px 0 0);
		}
	}
}
</style>