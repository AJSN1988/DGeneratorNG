<template>
	<q-popup-proxy @before-show="offsetCalendar" transition-show="scale" transition-hide="scale">
		<q-date
			v-model="proxyDate"
			default-view="Years"
			:minimal="true"
			:locale="{
        months: localeMonths,
        monthsShort: ['ЯНВ', 'ФВР', 'МРТ', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'],
        days: ['Понедельник', 'Вторник', 'Средв', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
        daysShort: ['Пнд', 'Втр', 'Срд', 'Чтг', 'Птн', 'Суб', 'Вск']
      }"
			:options="date => date.split('/')[2] === '01'"
			ref="periodSelector"
		>
			<div class="row items-center justify-start q-gutter-sm">
				<q-btn label="ОК" color="primary" flat @click="savePeriodSelect" v-close-popup />
				<q-btn label="Отмена" color="primary" flat v-close-popup />
			</div>
		</q-date>
	</q-popup-proxy>
</template>

<script>
import { mapActions } from "vuex";
import { date } from "quasar";

export default {
	name: "PeriodSelectComponent",
	data() {
		return {
			proxyDate: null,
			dateOffsetLock: false,
			localeMonths: [
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
		};
	},
	methods: {
		savePeriodSelect() {
			const proxyDateParts = this.proxyDate
				.split("/")
				.map(part => Number(part));
			const today = new Date();
			const day = today
				.getDate()
				.toString()
				.padStart(2, "0");
			const monthNum = today.getMonth() + 1;
			const month = monthNum.toString().padStart(2, "0");
			const lastPeriodDayEpoch =
				new Date(
					proxyDateParts[0],
					proxyDateParts[1],
					proxyDateParts[2]
				).getTime() / 1000;
			const billPaymentDayDate = date.formatDate(
				(lastPeriodDayEpoch - 86400) * 1000,
				"DD.MM.YYYY HH:mm:ss"
			);
			this.setPeriod({
				firstDay:
					new Date(
						proxyDateParts[0],
						proxyDateParts[1] - 1,
						proxyDateParts[2]
					).getTime() / 1000,
				lastDay: lastPeriodDayEpoch,
				billPaymentDay: billPaymentDayDate,
				short:
					proxyDateParts[1] >= 10
						? `${proxyDateParts[1]}_${proxyDateParts[0]}`
						: `0${proxyDateParts[1]}-${proxyDateParts[0]}`,
				label: `${this.localeMonths[proxyDateParts[1] - 1]} ${
					proxyDateParts[0]
				} г.`,
				today: `${day}.${month}.${today.getFullYear()}`
			});
		},
		offsetCalendar() {
			this.$nextTick(() => {
				if (!this.dateOffsetLock) {
					this.$refs.periodSelector.offsetCalendar("month", true);
					this.dateOffsetLock = true;
				}
			});
		},
		...mapActions("AppState", ["setPeriod"])
	}
};
</script>
