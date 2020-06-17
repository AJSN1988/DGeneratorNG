<template>
	<div class="clients-list">
		<q-table
			:data="clients"
			:columns="columns"
			:filter="filter"
			row-key="account_id"
			dark
			flat
			:bordered="true"
			color="amber"
			table-style="font-size: 10px;"
			:pagination.sync="pagination"
			rows-per-page-label="Показывать клиентов на странице"
			:rows-per-page-options="[50, 100, 500, 0]"
			no-results-label="Не найдено совпадений. Уточните поиск"
		>
			<template v-slot:top-right>
				<q-input
					borderless
					dense
					debounce="300"
					style="width: 260px;"
					v-model="filter"
					:placeholder="filterPlaceholder"
					:dark="true"
				>
					<template v-slot:append>
						<q-icon name="search" />
					</template>
				</q-input>
			</template>
			<template v-slot:body-cell-actions="props">
				<q-td :props="props" :auto-width="true">
					<div class="actions-cell">
						<template v-for="(action, index) in actions">
							<q-btn
								dense
								round
								flat
								:color="props.row[action.lockFieldName] ? action.color : 'grey-7'"
								@click="action.func(props.row)"
								:icon="action.icon"
								:title="props.row[action.lockFieldName] ? action.label : action.disableLabel"
								:key="index"
								:disable="!props.row[action.lockFieldName]"
							/>
						</template>
					</div>
				</q-td>
			</template>
		</q-table>
	</div>
</template>

<script>
export default {
	name: "ClientsListComponent",
	props: {
		clients: {
			type: Array,
			required: true
		},
		columns: {
			type: Array,
			required: true
		},
		paginationOptions: {
			type: Object,
			required: false
		},
		actions: {
			type: Array,
			required: false
		},
		filterPlaceholder: {
			type: String,
			required: true
		}
	},
	created() {
		this.pagination.sortBy = this.$props.paginationOptions.sortBy;
		this.pagination.descending = this.$props.paginationOptions.descending;
		this.pagination.rowsPerPage = this.$props.paginationOptions.rowsPerPage;
	},
	data() {
		return {
			filter: "",
			pagination: {
				sortBy: "",
				descending: false,
				page: 1,
				rowsPerPage: null
			}
		};
	}
};
</script>

<style lang="scss">
.q-table tbody td {
	white-space: normal;
}
.q-table thead tr th {
	// white-space: normal;
	font-size: 10px;
	text-align: center;
}
.actions-cell {
	display: inline-flex;
}
</style>