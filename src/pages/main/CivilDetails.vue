<template>
	<clients-details
		:clientsGroup="'civil'"
		:paginationProps="paginationProps"
		:columns="columns"
		:topInfoLabel="topInfoLabel"
		:description="description"
		:enableExportSection="true"
	/>
</template>

<script>
import ClientsDetails from "../../components/ClientsDetails.vue";

export default {
	name: "CivilDetailsPage",
	components: {
		ClientsDetails
	},
	data() {
		return {
			topInfoLabel: "Физические лица (детализации телефонного трафика)",
			description: `Для того, чтобы сформировать список детализаций для каждого клиента физического лица, 
        выберите отчетный период (предприятие использует постоплату за свои услуги, 
        соответственно учитывайте этот факт, генерируя квитанции) и нажмите кнопку "Сформировать все детализации". 
        Список клиентов, признаки принадлежности к группе "Физические лица" описываются непосредственно в 
        биллинговой системе UTM5.`,
			paginationProps: {
				sortBy: "account_id",
				descending: false,
				rowsPerPage: 50
			},
			columns: [
				{
					name: "account_id",
					required: true,
					label: "Счет",
					align: "left",
					field: "account_id",
					format: val => `${val}`,
					sortable: true
				},
				{
					name: "login",
					required: true,
					label: "Логин",
					align: "left",
					field: "login",
					format: val => `${val}`,
					sortable: true
				},
				{
					name: "full_name",
					align: "left",
					label: "ФИО клиента",
					field: "full_name",
					sortable: true
				},
				{
					name: "actual_address",
					align: "left",
					label: "Адрес клиента",
					field: "actual_address",
					sortable: true
				},
				{
					name: "flat_number",
					align: "center",
					label: "Квартира",
					field: "flat_number"
				},
				{
					name: "mg_summ_label",
					align: "center",
					label: "Сумма МГ/МН (с НДС)",
					field: "mg_summ_label",
					sortable: true,
					sort: (a, b) => parseFloat(a) - parseFloat(b)
				},
				{
					name: "actions",
					label: "Действия",
					field: "",
					align: "center"
				}
			]
		};
	}
};
</script>