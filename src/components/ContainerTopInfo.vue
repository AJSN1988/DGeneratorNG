<template>
  <div class="top-info">
    <div class="q-pa-md q-gutter-sm top-info__route-links">
      <q-breadcrumbs>
        <q-breadcrumbs-el
          :icon="crumb.prev.icon"
          @click="goToPage(crumb.prev.route)"
        />
        <q-breadcrumbs-el
          :label="crumb.current.label"
          :icon="crumb.current.home"
        />
      </q-breadcrumbs>
    </div>
    <div class="top-info__period">
      <q-btn
        :label="`Текущий период : ${periodGetter.label}`"
        flat
        unelevated
        :no-caps="true"
        color="primary"
      >
        <period-selector />
      </q-btn>
    </div>
  </div>
</template>

<script>
import PeriodSelector from "./PeriodSelectorComponent.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "ContainerTopInfoComponent",
  components: {
    PeriodSelector
  },
  props: {
    crumb: {
      type: Object,
      required: true
    }
  },
  methods: {
    goToPage(path) {
      if (path === "/") {
        // Disconnect from server
        this.$UtmServer.disconnect().then(() => {
          // Clear active user
          this.setCurrentUser({
            level: "INFO",
            message: `Выход из системы : [INFO MSG] Пользователь ${this.currentUserGetter.username} (${this.currentUserGetter.fullname}) вышел из приложения`,
            user: {}
          });
          // Set app status
          this.setAppStatus({
            level: "INFO",
            message: "Подключение к серверу UTM : [INFO MSG] Соединение с сервером UTM5 успешно закрыто."
          });
          // Set properly connection status
          this.setServerConnection(false);
          // Go to login page
          this.$router.push({ path: "/" });
        }).catch(err => {
          this.setAppStatus({
            level: "ERROR",
            message: `Подключение к серверу UTM : [ERR MSG] ${err.message}`
          });
        });
      } else {
        this.$router.push({ path: path });
      }
    },
    ...mapActions("AppState", ["setCurrentUser"]),
    ...mapActions("AppState", ["setServerConnection"]),
    ...mapActions("AppState", ["setAppStatus"])
  },
  computed: {
    ...mapGetters("AppState", ["periodGetter"]),
    ...mapGetters("AppState", ["currentUserGetter"])
  }
}
</script>

<style lang="scss" scoped>
@import "../css/app.scss";
.top-info {
  margin-bottom: -16px;
  @include flex(row, space-between, nowrap);
  .top-info__period {
    display: flex;
  }
}
</style>