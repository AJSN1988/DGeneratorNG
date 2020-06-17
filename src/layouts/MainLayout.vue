<template>
	<q-layout view="hHh lpR fFf">
		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<script>
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";

import ConfigDispatcher from "../utils/configDispatcher.js";
import MysqlDispatcher from "../utils/db/mysqlDispatcher.js";
import UtmServer from "../utils/server/server.js";

export default {
	name: "MainLayout",
	created() {
		// Add global config worker Read app configuration and put them into store
		Vue.prototype.$ConfigDispatcher = new ConfigDispatcher();

		this.$ConfigDispatcher
			.readConfig()
			.then(config => {
				// Put current app config in store
				this.setAppConfig(config);
				// Set properly app status
				this.setAppStatus({
					level: "INFO",
					message:
						"Получение конфигурации : [INFO MSG] Конфигурация успешно загружена"
				});
				// Create gloabal mysql dispatcher instance
				Vue.prototype.$Mysql = new MysqlDispatcher(
					this.appConfigGetter.database
				);
				// Create global server worker
				Vue.prototype.$UtmServer = new UtmServer(
					this.setAppStatus,
					this.setConnectionError,
					this.$Mysql
				);
			})
			.catch(err => {
				this.setAppStatus({
					level: "ERROR",
					message: `Ошибка получения конфигурации : [ERR MSG] ${err.message}`
				});
				this.setAppCriticalErrorFlag(true);
			});
	},
	computed: {
		...mapGetters("AppState", ["currentUserGetter"]),
		...mapGetters("AppState", ["appConfigGetter"])
	},
	methods: {
		...mapActions("AppState", ["setCurrentUser"]),
		...mapActions("AppState", ["setAppConfig"]),
		...mapActions("AppState", ["setAppStatus"]),
		...mapActions("AppState", ["setAppCriticalErrorFlag"]),
		...mapActions("AppState", ["setConnectionError"])
	}
};
</script>

<style lang="scss">
::-webkit-scrollbar {
	width: 16px;
}
::-webkit-scrollbar-track {
	margin: 82px 0 18px;
}

::-webkit-scrollbar-thumb {
	background-color: #00000062;
}
</style>
