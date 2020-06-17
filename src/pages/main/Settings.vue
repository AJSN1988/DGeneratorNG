<template>
	<q-layout view="hHh lpR fFf" class="settings-layout">
		<app-header />
		<side-menu />
		<q-page-container class="settings-container">
			<top-info
				:crumb="{ 
        prev: {
          icon: 'home',
          route: 'main'
        },
        current: {
          label: 'Настройки приложения', icon: 'settings'
        }
       }"
			/>
			<div class="settings">
				<div class="settings-form">
					<q-form class="q-gutter-md" ref="configForm">
						<!-- Settings form accordion -->
						<q-list dark bordered class="rounded-borders bg-primary">
							<q-expansion-item
								icon="settings_input_hdmi"
								label="Подключение к серверу UTM5"
								default-opened
								header-class="text-white"
								group="actionsGroup"
								class="accordion__item"
							>
								<q-card class="bg-orange">
									<q-card-section>
										<q-input
											filled
											v-model="config.server.host"
											label="IP адрес сервера"
											hint="Укажите корректный адрес сервера UTM5"
											lazy-rules
											:rules="[ 
                        val => val && /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(val) || 
                        'Некорректный IP адрес'
                      ]"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.server.user"
											label="Имя пользователя"
											hint="Заполните имя пользователя сервера UTM5"
											lazy-rules
											:rules="[val => val && /^[a-zA-Z0-9]+$/.test(val) || 'Неккоректное имя пользователя']"
											class="settings-form__input"
										/>
										<q-input
											filled
											type="password"
											v-model="config.server.password"
											label="Пароль"
											hint="Заполните пароль для пользователя сервера UTM5"
											lazy-rules
											:rules="[ val => val && /^[a-zA-Z0-9]+$/.test(val) || 'Укажите пароль пользователя']"
											class="settings-form__input"
										/>
										<q-input
											filled
											type="number"
											v-model="config.server.transport"
											label="Номер порта удаленного доступа"
											hint="Укажите номер порта, который используется для защищенного соединения"
											lazy-rules
											:rules="[ val => val && /^[0-9]+$/.test(val) || 'Укажите номер порта']"
											class="settings-form__input"
										/>
										<q-input
											filled
											type="number"
											v-model="config.server.remotePort"
											label="Номер пробрасываемого порта"
											hint="Укажите номер порта, который следует пробросить на локальный хост"
											lazy-rules
											:rules="[ val => val && /^[0-9]+$/.test(val) || 'Укажите номер пробрасываемого порта']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.server.cdrlocation"
											label="Рабочий каталог для CDR файлов"
											hint="Укажите каталог в котором будут распологаться сконвретирвоанные CDR файлы"
											lazy-rules
											:rules="[val => val && /^(.+)\/([^/]+)$/.test(val) || 'Неккоректный путь']"
											class="settings-form__input"
										/>
									</q-card-section>
								</q-card>
							</q-expansion-item>
							<q-expansion-item
								icon="library_books"
								label="Доступ к базе данных UTM"
								header-class="text-white"
								group="actionsGroup"
								class="accordion__item"
							>
								<q-card class="bg-orange">
									<q-card-section>
										<q-input
											filled
											v-model="config.database.user"
											label="Имя пользователя"
											hint="Укажите имя пользователя для ДБ UTM"
											lazy-rules
											:rules="[ val => val && /^[a-zA-Z0-9]+$/.test(val) || 'Укажите пользователя БД']"
											class="settings-form__input"
										/>
										<q-input
											filled
											type="password"
											v-model="config.database.password"
											label="Пароль"
											hint="Укажите пароль пользователя для ДБ UTM"
											lazy-rules
											:rules="[ val => val && /^[a-zA-Z0-9]+$/.test(val) || 'Укажите пароль пользователя БД']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.database.databasename"
											label="Имя базы данных UTM"
											hint="Укажите имя (название) для ДБ UTM"
											lazy-rules
											:rules="[ val => val && /^[a-zA-Z0-9]+$/.test(val) || 'Укажите имя БД']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.database.databasehost"
											label="Адрес пробрасываемого хоста с базой данных UTM"
											hint="Укажите хост с БД UTM (обычно это localhost)"
											lazy-rules
											:rules="[ val => val && /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(val) || 'Укажите адрес хоста БД']"
											class="settings-form__input"
										/>
									</q-card-section>
								</q-card>
							</q-expansion-item>
							<q-expansion-item
								icon="filter_9_plus"
								label="Настройки отчетных документов"
								header-class="text-white"
								group="actionsGroup"
								class="accordion__item"
							>
								<q-card class="bg-orange">
									<q-card-section>
										<q-input
											filled
											v-model="config.reports.reportnumber"
											type="number"
											label="Уникальный номер отчета"
											hint="Укажите уникальный номер для отчета по услугам связт"
											lazy-rules
											:rules="[ val => /^[0-9]{1,4}$/.test(val) || 'Укажите уникальный номер отчета']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.billnumber"
											type="number"
											label="Порядкоый номер счета"
											hint="Укажите порядковый номер счета"
											lazy-rules
											:rules="[ val => /^[0-9]{1,6}$/.test(val) || 'Укажите порядковый номер счета']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.civilid"
											type="number"
											label="ID тарифного плана клиентов физических лиц"
											hint="Укажите ID тарифа физических лиц в биллинговой системе UTM5"
											lazy-rules
											:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите ID тарифа в UTM5']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.legalid"
											type="number"
											label="ID тарифного плана клиентов юридических лиц"
											hint="Укажите ID тарифа юридических лиц в биллинговой системе UTM5"
											lazy-rules
											:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите ID тарифа в UTM5']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.csvdelimeter"
											label="Разделитель CSV файла"
											hint="Укажите символ - разделитель в CSV файлах"
											lazy-rules
											:rules="[ val => /^[;:.,\s\t-_]{1}$/.test(val) || 'Укажите сивол - разделитель']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.forbillstemplatepath"
											label="Путь к шаблону отчета по МГ/МН юридических лиц"
											hint="Укажите полный путь к HTML шаблону для отчета по МГ/МН соединениям клиентов - юридических лиц"
											lazy-rules
											:rules="[val => val && /^(.+)\/([^/]+)$/.test(val) || 'Неккоректный путь к шаблону']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.allcivilsaccountid"
											type="number"
											label="ID аккаунт клиентов - физических лиц"
											hint="Укажите ID аккаунта для всех клиентов - физических лиц"
											lazy-rules
											:rules="[ val => /^[0-9]{1,4}$/.test(val) || 'Укажите ID аккаунт']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.allcivilscontract"
											label="Номер договора для клиентов - физических лиц"
											hint="Укажите номер договора для всех клиентов - физических лиц"
											lazy-rules
											:rules="[ val => /^[a-zA-Z0-9]+$/.test(val) || 'Укажите номер договора']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.agentcontract"
											label="Номер агентского договора на МГ/МН"
											hint="Укажите номер агенского договора с МГ/МН оператором"
											lazy-rules
											:rules="[val => val && /^[a-zA-Z0-9]+$/.test(val) || 'Неккоректный номер договора']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.financeactnumber"
											label="Номер акта на оплату услуг МГ/МН"
											hint="Укажите номер акта оплаты услуг МГ/МН (опционально, можно оставить пустым)"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.ndscode"
											type="number"
											label="Код ставки НДС"
											hint="Укажите цифровой код ставки НДС"
											lazy-rules
											:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите код НДС']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.ndsvalue"
											label="Ставка НДС"
											hint="Укажите процентный коэффициент для ставки НДС"
											lazy-rules
											:rules="[ val => /^[0-9,\.]+$/.test(val) || 'Укажите ставку НДС']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.mnservicecode"
											type="number"
											label="Код услуги 'Международная связь'"
											hint="Укажите цифровой код услуги 'Международная связь'"
											lazy-rules
											:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите код услуги связи']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.mgservicecode"
											type="number"
											label="Код услуги 'Междугородная связь'"
											hint="Укажите цифровой код услуги 'Междугородная связь'"
											lazy-rules
											:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите код услуги связи']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.zoneservicecode"
											type="number"
											label="Код услуги 'Внутризоновая связь'"
											hint="Укажите цифровой код услуги 'Внутризоновая связь'"
											lazy-rules
											:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите код услуги связи']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.reports.trunkstemplatepath"
											label="Путь к шаблону отчета по пропуску трафика"
											hint="Укажите полный путь к HTML шаблону для отчета по пропуску трафика"
											lazy-rules
											:rules="[val => val && /^(.+)\/([^/]+)$/.test(val) || 'Неккоректный путь к шаблону']"
											class="settings-form__input"
										/>
									</q-card-section>
								</q-card>
							</q-expansion-item>
							<q-expansion-item
								icon="monetization_on"
								label="Настройки квитанций на оплату услуг связи"
								header-class="text-white"
								group="actionsGroup"
								class="accordion__item"
							>
								<q-card class="bg-orange">
									<q-card-section>
										<q-input
											filled
											v-model="config.bills.templatepath"
											label="Путь к шаблону для квитанции на оплату услуг"
											hint="Укажите полный путь к HTML шаблону для стандартной квитанции"
											lazy-rules
											:rules="[val => val && /^(.+)\/([^/]+)$/.test(val) || 'Неккоректный путь к шаблону']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.bills.mtssumm"
											type="number"
											label="Сумма абонентской платы за услуги МТС для физических лиц (в копейках)"
											hint="Укажите сумму абонентской платы для физических лиц"
											lazy-rules
											:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите сумму в копейках']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.bills.maxbillschunk"
											type="number"
											label="Маскимальное количество квитанций в коллекции"
											hint="Укажите максимальное число при котором будет создаваться дополнительный файл коллекции"
											lazy-rules
											:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите целое число']"
											class="settings-form__input"
										/>
									</q-card-section>
								</q-card>
							</q-expansion-item>
							<q-expansion-item
								icon="phone_forwarded"
								label="Настройки детализаций телефонных соединений"
								header-class="text-white"
								group="actionsGroup"
								class="accordion__item"
							>
								<q-card class="bg-orange">
									<q-card-section>
										<q-input
											filled
											v-model="config.details.civiltemplatepath"
											label="Путь к шаблону детализаций (физические лица)"
											hint="Укажите полный путь к HTML шаблону для детализации физическим лицам"
											lazy-rules
											:rules="[val => val && /^(.+)\/([^/]+)$/.test(val) || 'Неккоректный путь к шаблону']"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.details.legaltemplatepath"
											label="Путь к шаблону детализаций (юридические лица)"
											hint="Укажите полный путь к HTML шаблону для детализации юридическим лицам"
											lazy-rules
											:rules="[val => val && /^(.+)\/([^/]+)$/.test(val) || 'Неккоректный путь к шаблону']"
											class="settings-form__input"
										/>
									</q-card-section>
								</q-card>
							</q-expansion-item>
							<q-expansion-item
								icon="list_alt"
								label="Настройки CDR"
								header-class="text-white"
								group="actionsGroup"
								class="accordion__item"
							>
								<q-card class="bg-orange">
									<q-card-section>
										<q-select
											filled
											v-model="config.cdr.pattern"
											:options="['mta', 'eltex']"
											label="Формат загружаемых для обработки CDR файлов"
											hint="Выберите формат CDR, в зависимости от коммутационного оборудования"
											class="settings-form__input"
											options-selected-class="text-grey"
										/>
									</q-card-section>
								</q-card>
							</q-expansion-item>
							<q-expansion-item
								icon="alternate_email"
								label="Настройки подсистемы рассылки"
								header-class="text-white"
								group="actionsGroup"
								class="accordion__item"
							>
								<q-card class="bg-orange">
									<q-card-section>
										<q-input
											filled
											v-model="config.mail.server"
											label="SMTP сервер"
											hint="Укажите доменное имя почтового сервера"
											lazy-rules
											:rules="[ 
                        val => val && /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(val) || 
                        'Некорректное доменное имя сервера'
                      ]"
											class="settings-form__input"
										/>
										<q-input
											filled
											type="number"
											v-model="config.mail.port"
											label="Номер порта почтового сервиса"
											hint="Укажите номер порта, который используется для соединения"
											lazy-rules
											:rules="[ val => val && /^[0-9]+$/.test(val) || 'Укажите номер порта']"
											class="settings-form__input"
										/>
										<q-select
											filled
											v-model="config.mail.secure"
											:options="['true', 'false']"
											label="Использовать защищенное соединение"
											hint="Укажите используется ли шифрование (true или false)"
											class="settings-form__input"
										/>
										<q-input
											filled
											v-model="config.mail.username"
											label="Имя пользователя"
											hint="Заполните имя пользователя почтового сервиса"
											lazy-rules
											:rules="[val => val && /\S+@\S+\.\S+/.test(val) || 'Неккоректное имя пользователя (пример - user@email.com)']"
											class="settings-form__input"
										/>
										<q-input
											filled
											type="password"
											v-model="config.mail.password"
											label="Пароль"
											hint="Заполните пароль для пользователя почтового сервиса"
											lazy-rules
											:rules="[ val => val && /^[a-zA-Z0-9]+$/.test(val) || 'Укажите пароль пользователя']"
											class="settings-form__input"
										/>
									</q-card-section>
								</q-card>
							</q-expansion-item>
							<q-expansion-item
								icon="supervisor_account"
								label="Присоединяющие операторы"
								header-class="text-white"
								group="actionsGroup"
								class="accordion__item"
							>
								<q-card class="bg-grey-9">
									<q-card-section>
										<q-btn
											color="none"
											flat
											text-color="white"
											icon="add_circle_outline"
											label="Добавить оператора"
											class="accordion__button"
											@click="addOperatorDialog = true;"
										/>
										<q-expansion-item
											:label="operator.operatorname"
											header-class="text-white"
											group="operatorsGroup"
											class="accordion__item"
											v-for="(operator, index) in config.operators"
											:key="index"
										>
											<q-card class="bg-grey-9">
												<q-card-section>
													<q-input
														filled
														v-model="config.operators[index].operatorname"
														label="Наименование оператора"
														hint="Укажите намименование присоединяющего оператора"
														dark
														lazy-rules
														:rules="[val => val && /^[а-яА-Я\s]+$/.test(val) || 'Укажите наименование оператора']"
														class="settings-form__input"
													/>
													<q-input
														filled
														v-model="config.operators[index].type"
														label="Тип присоединения"
														hint="Сформулируйте тип присоединения"
														dark
														lazy-rules
														:rules="[val => val && /^[а-яА-Я0-9\s,\.]+$/.test(val) || 'Укажите тип присоединения']"
														class="settings-form__input"
													/>
													<q-select
														filled
														v-model="config.operators[index].typecode"
														:options="['1 - на местном уровне', '2 - на ЗН/МГ/МН уровне']"
														label="Цифровой код присоединения"
														hint="Выберите цифровой код, в зависимости от типа присоединения"
														dark
														class="settings-form__input"
														options-selected-class="text-grey"
													/>
													<q-input
														filled
														v-model="config.operators[index].trunksid"
														type="number"
														label="Идентификатор транк группы"
														hint="Укажите ID транковой группы в сторону оператора"
														dark
														lazy-rules
														:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите целое число']"
														class="settings-form__input"
													/>
													<q-input
														filled
														v-model="config.operators[index].prefixes"
														label="Префиксы выхода на транковую группу"
														hint="Укажите (через символ '|') цифровые префиксы выхода на транковую группу"
														dark
														lazy-rules
														:rules="[val => val && /^[0-9\|]+$/.test(val) || 'Укажите целые числа через |']"
														class="settings-form__input"
													/>
													<q-btn
														color="none"
														flat
														text-color="white"
														icon="remove_circle_outline"
														label="Удалить оператора"
														@click="removeOperatorFromConfig(index)"
													/>
												</q-card-section>
											</q-card>
										</q-expansion-item>
									</q-card-section>
								</q-card>
							</q-expansion-item>
							<q-expansion-item
								icon="face"
								label="Управление пользователями"
								header-class="text-white"
								group="actionsGroup"
								class="accordion__item"
							>
								<q-card class="bg-grey-9">
									<q-card-section>
										<q-btn
											color="none"
											flat
											text-color="white"
											icon="add_circle_outline"
											label="Добавить нового пользователя"
											class="accordion__button"
											@click="addUserDialog = true;"
										/>
										<q-expansion-item
											:label="user.fullname"
											header-class="text-white"
											group="usersGroup"
											class="accordion__item"
											v-for="(user, index) in config.users"
											:key="index"
										>
											<q-card class="bg-grey-9">
												<q-card-section>
													<q-input
														filled
														v-model="config.users[index].username"
														label="Имя пользователя"
														hint="Укажите имя пользователя приложения"
														dark
														lazy-rules
														:rules="[val => val && /^[a-zA-Z0-9]+$/.test(val) || 'Укажите имя пользователя']"
														class="settings-form__input"
													/>
													<q-input
														filled
														v-model="config.users[index].password"
														label="Пароль пользователя"
														dark
														hint="Укажите пароль для авторизации"
														type="password"
														lazy-rules
														:rules="[ val => val && /^[a-zA-Z0-9]+$/.test(val) || 'Укажите пароль пользователя']"
														class="settings-form__input"
													/>
													<q-select
														filled
														v-model="config.users[index].admin"
														:options="['true', 'false']"
														label="Пользователь имеет привелегии администратора"
														dark
														hint="Укажите имеет ли пользователь привилегии администратора (true или false)"
														class="settings-form__input"
														options-selected-class="text-grey"
														:disable="currentUserGetter.username === user.username"
													/>
													<q-input
														filled
														v-model="config.users[index].email"
														label="Электронный адрес пользователя"
														dark
														hint="Укажите электронный адрес пользователя"
														lazy-rules
														:rules="[ val => val && /\S+@\S+\.\S+/.test(val) || 'Укажите email пользователя']"
														class="settings-form__input"
													/>
													<q-input
														filled
														v-model="config.users[index].fullname"
														label="Полное имя пользователя"
														dark
														hint="Укажите полное имя пользователя"
														lazy-rules
														:rules="[ val => val && /^([а-яА-я]{1,}\s[а-яА-я]{1,}'?-?[а-яА-Я]{1,}\s?([а-яА-Я]{1,})?)$/.test(val) || 'Укажите полное пользователя']"
														class="settings-form__input"
													/>
													<q-btn
														color="none"
														flat
														text-color="white"
														icon="remove_circle_outline"
														label="Удалить пользователя"
														@click="removeUserFromConfig(index)"
														:disable="currentUserGetter.username === user.username"
													/>
												</q-card-section>
											</q-card>
										</q-expansion-item>
									</q-card-section>
								</q-card>
							</q-expansion-item>
						</q-list>
					</q-form>
				</div>
				<div class="settings-annotation">
					<q-card class="my-card bg-primary text-white">
						<q-card-section>
							<div class="settings-annotation__header">Настройки DGenerator NG</div>
						</q-card-section>
						<q-card-section>
							<p>
								Прежде чем измениять настройки данного приложения, стоит обратиться к разделу со справочной информацией.
								В случае установки некрроектного параметра, приложение не сможет корректно работать. В этом случае,
								ознакомьтесь с текущим статусом работы приложения, а также обратитесь к log файлу для получения
								всеобъемлющей информации.
							</p>
						</q-card-section>
						<div
							class="settings-annotation__tip"
						>Нажмите "Применить" для подтверждения, в противном случае нажмите "Отменить"</div>
						<q-separator dark />
						<q-card-actions>
							<q-btn flat @click="confirmChanges">Применить</q-btn>
							<q-btn flat @click="cancelChanges">Отменить</q-btn>
						</q-card-actions>
					</q-card>
				</div>
			</div>
			<!-- Add new user dialog content -->
			<q-dialog v-model="addUserDialog" ref="newUserDialog" :persistent="true">
				<q-layout
					view="Lhh lpR fff"
					container
					class="bg-orange"
					style="width: 700px; max-height: 658px;"
				>
					<q-page-container>
						<div class="new-user-form">
							<div class="new-user-form__header q-dialog__title">Добавление нового пользователя</div>
							<div class="new-user-form__annotation">
								Для добавления нового пользователя корректно заполните все поля формы
								и нажмите кнопку "Добавить пользователя", в противном случае нажмите "Отмена".
							</div>
							<q-form class="q-gutter-md" ref="newUserForm">
								<q-card class="bg-orange">
									<q-card-section>
										<q-input
											filled
											v-model="potencialUser.username"
											label="Имя пользователя"
											hint="Укажите имя пользователя приложения"
											lazy-rules
											:rules="[val => val && /^[a-zA-Z0-9]+$/.test(val) || 'Укажите имя пользователя']"
											class="new-user-form__input"
										/>
										<q-input
											filled
											v-model="potencialUser.password"
											label="Пароль пользователя"
											hint="Укажите пароль для авторизации"
											type="password"
											lazy-rules
											:rules="[ val => val && /^[a-zA-Z0-9]+$/.test(val) || 'Укажите пароль пользователя']"
											class="new-user-form__input"
										/>
										<q-select
											filled
											v-model="potencialUser.admin"
											:options="['true', 'false']"
											label="Пользователь имеет привелегии администратора"
											hint="Укажите имеет ли пользователь привилегии администратора (true или false)"
											class="new-user-form__input"
											options-selected-class="text-grey"
											popup-content-style="background-color: #FECE1A"
										/>
										<q-input
											filled
											v-model="potencialUser.email"
											label="Электронный адрес пользователя"
											hint="Укажите электронный адрес пользователя"
											lazy-rules
											:rules="[ val => val && /\S+@\S+\.\S+/.test(val) || 'Укажите email пользователя']"
											class="new-user-form__input"
										/>
										<q-input
											filled
											v-model="potencialUser.fullname"
											label="Полное имя пользователя"
											hint="Укажите полное имя пользователя"
											lazy-rules
											:rules="[ val => val && /^([а-яА-я]{1,}\s[а-яА-я]{1,}'?-?[а-яА-Я]{1,}\s?([а-яА-Я]{1,})?)$/.test(val) || 'Укажите полное пользователя']"
											class="new-user-form__input"
										/>
									</q-card-section>
									<q-card-actions class="q-card__actions q-card__actions--horiz row justify-end">
										<q-btn flat @click="addNewUser" data-autofocus="true">Добавить пользователя</q-btn>
										<q-btn flat @click="hideAddUserDialog">Отменить</q-btn>
									</q-card-actions>
								</q-card>
							</q-form>
						</div>
					</q-page-container>
				</q-layout>
			</q-dialog>
			<!-- End add new user dialog content -->
			<!-- Add new operator dialog -->
			<q-dialog v-model="addOperatorDialog" ref="newOperatorDialog" :persistent="true">
				<q-layout
					view="Lhh lpR fff"
					container
					class="bg-orange"
					style="width: 700px; max-height: 658px;"
				>
					<q-page-container>
						<div class="new-operator-form">
							<div
								class="new-operator-form__header q-dialog__title"
							>Добавление нового присоединяющего оператора</div>
							<div class="new-operator-form__annotation">
								Для добавления нового присоединяющего оператора корректно заполните все поля формы
								и нажмите кнопку "Добавить оператора", в противном случае нажмите "Отмена".
							</div>
							<q-form class="q-gutter-md" ref="newOperatorForm">
								<q-card class="bg-orange">
									<q-card-section>
										<q-input
											filled
											v-model="potencialOperator.operatorname"
											label="Наименование оператора"
											hint="Укажите наименование присоединяющего оператора"
											lazy-rules
											:rules="[val => val && /^[а-яА-Я0-9\s]+$/.test(val) || 'Укажите наименование оператора']"
											class="new-operator-form__input"
										/>
										<q-input
											filled
											v-model="potencialOperator.type"
											label="Тип присоединения"
											hint="Сформулируйте тип присоединения"
											lazy-rules
											:rules="[val => val && /^[а-яА-Я\s]+$/.test(val) || 'Укажите тип присоединения']"
											class="new-operator-form__input"
										/>
										<q-select
											filled
											v-model="potencialOperator.typecode"
											:options="['1 - на местном уровне', '2 - на ЗН/МГ/МН уровне']"
											label="Цифровой код присоединения"
											hint="Выберите цифровой код, в зависимости от типа присоединения"
											class="new-operator-form__input"
											options-selected-class="text-grey"
										/>
										<q-input
											filled
											v-model="potencialOperator.trunksid"
											type="number"
											label="Идентификатор транк группы"
											hint="Укажите ID транковой группы в сторону оператора"
											lazy-rules
											:rules="[ val => /^[0-9]+$/.test(val) || 'Укажите целое число']"
											class="new-operator-form__input"
										/>
										<q-input
											filled
											v-model="potencialOperator.prefixes"
											label="Префиксы выхода на транковую группу"
											hint="Укажите (через символ '|') цифровые префиксы выхода на транковую группу"
											lazy-rules
											:rules="[val => val && /^[0-9\|]+$/.test(val) || 'Укажите целые числа через |']"
											class="settings-form__input"
										/>
									</q-card-section>
									<q-card-actions class="q-card__actions q-card__actions--horiz row justify-end">
										<q-btn flat @click="addNewOperator" data-autofocus="true">Добавить оператора</q-btn>
										<q-btn flat @click="hideAddOperatorDialog">Отменить</q-btn>
									</q-card-actions>
								</q-card>
							</q-form>
						</div>
					</q-page-container>
				</q-layout>
			</q-dialog>
			<!-- End add new operator dialog -->
			<!-- Reconnection dialog -->
			<connection-modal />
			<!-- End reconnection dialog -->
		</q-page-container>
		<app-footer />
	</q-layout>
</template>

<script>
import AppHeader from "../../components/Header.vue";
import SideMenu from "../../components/SideMenu.vue";
import TopInfo from "../../components/ContainerTopInfo.vue";
import AppFooter from "../../components/Footer.vue";
import ConnectionModal from "../../components/ConnectionModal.vue";

import { mapGetters, mapActions } from "vuex";

import logger from "../../utils/logger.js";

export default {
	name: "SettingsPage",
	components: {
		AppHeader,
		SideMenu,
		TopInfo,
		AppFooter,
		ConnectionModal
	},
	created() {
		this.cloneConfigFromState();
	},
	data() {
		return {
			config: {},
			potencialUser: {},
			potencialOperator: {},
			addUserDialog: false,
			addOperatorDialog: false
		};
	},
	methods: {
		openAddUserDialog() {
			this.addUserDialog = true;
		},
		addNewUser() {
			this.$refs.newUserForm.validate().then(valid => {
				if (valid) {
					this.config.users.push(this.potencialUser);
					this.hideAddUserDialog();
					this.$refs.newUserForm.reset();
				} else {
					// Pay attention if from non-valid
					this.$refs.newUserDialog.shake();
				}
			});
		},
		addNewOperator() {
			this.$refs.newOperatorForm.validate().then(valid => {
				if (valid) {
					this.config.operators.push(this.potencialOperator);
					this.hideAddOperatorDialog();
					this.$refs.newOperatorForm.reset();
				} else {
					// Pay attention if from non-valid
					this.$refs.newOperatorForm.shake();
				}
			});
		},
		hideAddOperatorDialog() {
			this.$refs.newOperatorDialog.hide();
		},
		hideAddUserDialog() {
			this.$refs.newUserDialog.hide();
		},
		removeOperatorFromConfig(operatorIndex) {
			const operatorInfo = this.config.operators[operatorIndex];
			this.$q
				.dialog({
					title: "Удалить оператора?",
					message: `Вы действительно хотите удалить информацию о присоединяющем операторе ${operatorInfo.operatorname}? Это действие впоследствии можно будет отменить, нажав кнопку "Отменить" непосредственно на экране настроек.`,
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
					// Remove operator from local config copy. After confirm config form, all chages will copy automatic.
					this.config.operators.splice(operatorIndex);
				});
		},
		removeUserFromConfig(userIndex) {
			const userInfo = this.config.users[userIndex];
			this.$q
				.dialog({
					title: "Удалить пользователя?",
					message: `Вы действительно хотите удалить пользователя ${userInfo.username} (${userInfo.fullname}). Это действие впоследствии можно будет отменить, нажав кнопку "Отменить" непосредственно на экране настроек.`,
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
					// Remove user from local config copy. After confirm config form, all chages will copy automatic.
					this.config.users.splice(userIndex);
				});
		},
		cloneConfigFromState() {
			// Clone app config state object
			this.config = JSON.parse(
				JSON.stringify(this.$store.state.AppState.appConfig)
			);
		},
		updateConfig() {
			// Validate config form and update app config state
			this.$refs.configForm.validate().then(valid => {
				if (valid) {
					// Add func for to creating new config file and after resolve promise set vuex state
					this.$ConfigDispatcher
						.updateConfig(this.config)
						.then(() => {
							this.setAppConfig(this.config);
							this.setAppStatus({
								level: "INFO",
								message:
									"Обновление конфигурации : [INFO MSG] Конфигурация успешно обновлена"
							});
							this.$router.push({ path: "/main" });
						})
						.catch(err => {
							this.setAppStatus({
								level: "ERROR",
								message: `Ошибка обновление конфигурации : [ERR MSG] Невозможно обновить конфигурцаию по причине - ${err.message}`
							});
						});
				} else {
					this.$q.dialog({
						title: "Ошибка валидации",
						message:
							'Один или несколько параметров конфигруации некорректны. Нажмите кнопку "ОК". Исправьте некорректные параметры и повторите попытку.',
						style: {
							backgroundColor: "#FECE1A"
						}
					});
				}
			});
		},
		confirmChanges() {
			this.$q
				.dialog({
					title: "Подтвердите действие",
					message:
						'Вы собираетесь изменить конфигурацию приложения. Если вы уверены в своих действиях и тщательно проверили указанные параметры, нажмите кнопку "ОК". В противном случае нажмите "Отмена"',
					style: {
						backgroundColor: "#FECE1A"
					},
					cancel: true,
					persistent: true,
					ok: {
						label: "ОК",
						flat: true
					},
					cancel: {
						label: "Отмена",
						flat: true
					}
				})
				.onOk(() => {
					this.$refs.configForm.validate().then(() => {
						this.updateConfig();
					});
				})
				.onCancel(() => {
					this.cloneConfigFromState();
				});
		},
		cancelChanges() {
			this.cloneConfigFromState();
			this.$router.push({ path: "/main" });
		},
		...mapActions("AppState", ["setAppConfig"]),
		...mapActions("AppState", ["setAppStatus"])
	},
	computed: {
		...mapGetters("AppState", ["currentUserGetter"])
	}
};
</script>

<style lang="scss" scoped>
@import "../../css/app.scss";
.settings-layout {
	min-width: 1024px;
	overflow-y: hidden;
	.settings-container {
		height: 100vh;
		background-color: $background;
		overflow-y: auto;
	}
	.settings {
		@include flex(row, flex-start, nowrap);
		margin: 16px 16px 8px 0;
		.settings-form {
			width: 50%;
			padding: 0 16px;
			.settings-form__input {
				&:not(:last-child) {
					margin-bottom: 8px;
				}
			}
			.accordion__item {
				.accordion__button {
					margin-bottom: 12px;
				}
			}
		}
		.settings-annotation {
			width: 50%;
			.settings-annotation__header {
				text-transform: uppercase;
			}
			.settings-annotation__tip {
				font-size: 0.75em;
				padding: 16px;
			}
		}
	}
}
.new-user-form {
	.new-user-form__header {
		padding: 16px;
	}
	.new-user-form__annotation {
		padding: 0 16px 12px;
	}
	.new-user-form__input {
		margin-bottom: 8px;
	}
}
.new-operator-form {
	.new-operator-form__header {
		padding: 16px;
	}
	.new-operator-form__annotation {
		padding: 0 16px 12px;
	}
	.new-operator-form__input {
		margin-bottom: 8px;
	}
}
</style>