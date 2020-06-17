<template>
	<p>
		<button @click="showDirectory" :disabled="getWorkDirectory">Открыть рабочий каталог</button>
	</p>
</template>

<script>
import { checkDirectory, openDocsDirectory } from "../utils/commonUtils";

export default {
	name: "ShowDirBtnComponent",
	props: {
		docType: {
			type: String,
			required: true
		}
	},
	computed: {
		getWorkDirectory() {
			return checkDirectory(this.$props.docType);
		}
	},
	methods: {
		showDirectory() {
			try {
				openDocsDirectory(this.$props.docType);
			} catch (err) {
				this.setAppStatus({
					level: "ERROR",
					message: `Расположение документов : [ERR MSG] Приложению не удалось открыть рабочий каталог с документами. Причина - ${err}`
				});
			}
		}
	}
};
</script>

<style lang="scss" scoped>
@import "../css/app.scss";
p {
	margin: 20px 0 -0;
	button {
		@include coloredButton($primary, $orange, $orange, none, 10px 15px);
	}
}
</style>