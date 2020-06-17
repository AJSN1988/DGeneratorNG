<template>
	<clients-details
		:clientsGroup="'legal'"
		:paginationProps="paginationProps"
		:columns="columns"
		:topInfoLabel="topInfoLabel"
		:description="description"
		:enableExportSection="false"
	/>
</template>

<script>
import ClientsDetails from "../../components/ClientsDetails.vue";

export default {
	name: "LegalDetailsPage",
	components: {
		ClientsDetails
	},
	data() {
		return {
			topInfoLabel: "Юридические лица (детализации телефонного трафика)",
			description: `Для того, чтобы сформировать список детализаций для каждого клиента юридического лица, 
        выберите отчетный период (предприятие использует постоплату за свои услуги, 
        соответственно учитывайте этот факт, генерируя квитанции) и нажмите кнопку "Сформировать все детализации". 
        Список клиентов, признаки принадлежности к группе "Юридические лица" описываются непосредственно в 
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
					name: "comments",
					align: "left",
					label: "Номер договора",
					field: "comments",
					sortable: true
				},
				{
					name: "full_name",
					align: "left",
					label: "Наименование клиента",
					field: "full_name",
					sortable: true
				},
				{
					name: "mg_summ_label",
					align: "center",
					label: "Сумма МГ/МН (без НДС)",
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