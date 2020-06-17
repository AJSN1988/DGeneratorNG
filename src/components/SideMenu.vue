<template>
	<q-drawer
		v-model="sideMenuOpenGetter"
		side="left"
		overlay
		behavior="desktop"
		elevated
		content-style="background-color: #101316"
		:width="365"
	>
		<div class="q-pa-md bg-primary text-white">
			<q-list dark>
				<q-separator />
				<q-item-label header>Физическими лица</q-item-label>
				<q-item clickable v-ripple to="civil_bills">
					<q-item-section avatar>
						<q-avatar color="orange" text-color="primary" icon="drafts" />
					</q-item-section>
					<q-item-section>
						<q-item-label overline>КВИТАНЦИИ ЗА УСЛУГИ СВЯЗИ</q-item-label>
					</q-item-section>
				</q-item>
				<q-item clickable v-ripple to="civil_details">
					<q-item-section avatar>
						<q-avatar color="orange" text-color="primary" icon="horizontal_split" />
					</q-item-section>
					<q-item-section>
						<q-item-label overline>ДЕТАЛИЗАЦИИ ВЫЗОВОВ</q-item-label>
					</q-item-section>
				</q-item>
				<q-separator />
				<q-item-label header>Юридические лица</q-item-label>
				<q-item clickable v-ripple to="legal_reports">
					<q-item-section avatar>
						<q-avatar color="orange" text-color="primary" icon="money" />
					</q-item-section>
					<q-item-section>
						<q-item-label overline>ОТЧЕТНЫЕ ДОКУМЕТЫ</q-item-label>
					</q-item-section>
				</q-item>
				<q-item clickable v-ripple to="legal_details">
					<q-item-section avatar>
						<q-avatar color="orange" text-color="primary" icon="horizontal_split" />
					</q-item-section>
					<q-item-section>
						<q-item-label overline>ДЕТАЛИЗАЦИИ ВЫЗОВОВ</q-item-label>
					</q-item-section>
				</q-item>
				<q-separator />
				<q-item-label header>Транки присоединяющих операторов</q-item-label>
				<q-item clickable v-ripple to="trunks_report">
					<q-item-section avatar>
						<q-avatar color="orange" text-color="primary" icon="settings_input_component" />
					</q-item-section>
					<q-item-section>
						<q-item-label overline>СФОРМИРОВАТЬ СТАТИСТИКУ</q-item-label>
					</q-item-section>
				</q-item>
				<q-separator />
				<q-item-label header>Общее</q-item-label>
				<q-item clickable v-ripple to="settings" :disable="currentUserGetter.admin === 'false'">
					<q-item-section avatar>
						<q-avatar color="orange" text-color="primary" icon="settings" />
					</q-item-section>
					<q-item-section>
						<q-item-label overline>НАСТРОЙКИ</q-item-label>
					</q-item-section>
				</q-item>
				<q-item clickable v-ripple to="help">
					<q-item-section avatar>
						<q-avatar color="orange" text-color="primary" icon="help_outline" />
					</q-item-section>
					<q-item-section>
						<q-item-label overline>ПОМОЩЬ</q-item-label>
					</q-item-section>
				</q-item>
			</q-list>
		</div>
	</q-drawer>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "SideMenuComponent",
	mounted() {
		if (this.sideMenuOpenGetter) this.toggleSideMenuOpen();
	},
	computed: {
		...mapGetters("AppState", ["sideMenuOpenGetter"]),
		...mapGetters("AppState", ["currentUserGetter"])
	},
	methods: {
		...mapActions("AppState", ["toggleSideMenuOpen"])
	}
};
</script>