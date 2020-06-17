<template>
	<q-page>
		<q-header>
			<q-bar class="q-electron-drag">
				<div>DGenerator NG</div>

				<q-space />

				<q-btn dense flat icon="minimize" @click="minimize" />
				<q-btn dense flat icon="crop_square" @click="maximize" />
				<q-btn dense flat icon="close" @click="closeApp" />
			</q-bar>
		</q-header>
	</q-page>
</template>

<script>
import { mapActions } from "vuex";

export default {
	name: "AppFrameComponent",
	methods: {
		minimize() {
			if (process.env.MODE === "electron") {
				this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize();
			}
		},
		maximize() {
			if (process.env.MODE === "electron") {
				const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow();

				if (win.isMaximized()) {
					win.unmaximize();
				} else {
					win.maximize();
				}
			}
		},
		closeApp() {
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
				.onOk(user => {
					// Set properly connection status
					this.setServerConnection(false);
					this.$UtmServer.disconnect();
					// Exit from app
					if (process.env.MODE === "electron") {
						this.$q.electron.remote.BrowserWindow.getFocusedWindow().close();
					}
				});
		},
		...mapActions("AppState", ["setServerConnection"])
	}
};
</script>