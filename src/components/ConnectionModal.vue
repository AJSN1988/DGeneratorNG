<template>
	<q-dialog v-model="connectionErrorGetter" ref="connectionModalWindow" :persistent="true">
		<q-card style="max-width: 700px">
			<q-card-section class="bg-orange">
				<div class="connection-modal">
					<div class="connection-modal__title">Работа приложения не может быть продолжена</div>
					<div class="connection-modal__annotation">
						Соединение с сервером UTM5 было разорвано. Вы можете попробовать переподключиться
						(для этого воспользуйтесь снопкой "Переподключиться") либо выйти из приложения, нажав соответствующую
						кнопку и зайти заного. Если проблему невозможно устранить, обратитесь за информацией к log-файлу и
						администратору системы.
					</div>
					<div class="connection-modal__error">
						<q-icon name="error_outline" />
						<span>Сетевое соединение было разорвано</span>
					</div>
					<div class="connection-modal__status">{{appStatusGetter}}</div>
				</div>
			</q-card-section>
			<q-card-actions align="center" class="bg-orange">
				<q-btn flat :label="'Переподключиться'" @click="reconnection" />
				<q-btn flat :label="'Закрыть приложение'" @click="quit" />
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "ConnectionModalComponent",
	computed: {
		...mapGetters("AppState", ["appStatusGetter"]),
		...mapGetters("AppState", ["connectionErrorGetter"])
	},
	methods: {
		reconnection() {
			// Go to login form
			this.$router.push({ path: "/" });
		},
		quit() {
			// Exit from app
			if (process.env.MODE === "electron") {
				this.$q.electron.remote.BrowserWindow.getFocusedWindow().close();
			}
		}
	}
};
</script>

<style lang="scss" scoped>
@import "../css/app.scss";

.connection-modal {
	background-color: $background;
	&__title {
		text-transform: uppercase;
		font-size: 1em;
	}
	&__annotation {
		margin-top: 10px;
		font-size: 0.75em;
	}
	&__status {
		font-size: 0.9em;
		text-align: center;
	}
	&__error,
	&__label {
		margin: 16px 0;
		text-align: center;
		span {
			text-transform: uppercase;
			font-weight: 500;
			padding-left: 6px;
		}
	}
}
</style>