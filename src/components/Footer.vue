<template>
  <q-footer
    elevated
    class="bg-primary text-white main-footer"
  >
    <q-toolbar class="app-status">
      <div class="app-status__label">
        {{ appStatusGetter }}
        <q-tooltip
          content-class="bg-primary"
          content-style="font-size: 16px"
          :offset="[10, 10]"
        >
          {{ appStatusGetter }}
        </q-tooltip>
      </div>
    </q-toolbar>
  </q-footer>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "AppFooterComponent",
  computed: {
    ...mapGetters("AppState", ["appStatusGetter"])
  }
}
</script>

<style lang="scss" scoped>
@import "../css/app.scss";

.main-footer {
  height: 30px;
  .app-status {
    @include flex(row, center, nowrap);
    .app-status__label {
      align-self: self-end;
      font-size: 0.7rem;
      padding-top: 7px;
    }
  }
}
</style>