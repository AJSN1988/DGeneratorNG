<template>
  <div class="waiting-end-work">
    <div class="waiting-end-work__title">{{ options.title }}</div>
    <div class="waiting-end-work__annotation">{{ options.annotation }}</div>
    <div
      class="waiting-end-work__progress"
      v-if="options.progress && progressWorkGetter !== -1"
    >
      <q-linear-progress
        size="25px"
        :value="progressWorkGetter"
        color="primary"
      >
        <div class="absolute-full flex flex-center">
          <q-badge
            color="white"
            text-color="primary"
            :label="progressLabel"
          />
        </div>
      </q-linear-progress>
    </div>
    <div
      class="waiting-end-work__label"
      v-if="!options.progress && progressWorkGetter !== -1"
    >
      <q-icon name="schedule" />
      <span>{{ options.waitingLabel }}</span>
    </div>
    <div
      class="waiting-end-work__error"
      v-if="progressWorkGetter === -1"
    >
      <q-icon name="error_outline" />
      <span>Ошибка выполнения</span>
    </div>
    <div class="waiting-end-work_status">
      {{ appStatusGetter }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "WaitingEndWorkComponent",
  props: {
    options: {
      type: Object,
      requared: true
    }
  },
  computed: {
    progressLabel() {
      return `${(this.progressWorkGetter * 100).toFixed(0)}%`;
    },
    ...mapGetters("AppState", ["appStatusGetter"]),
    ...mapGetters("AppState", ["appCriticalErrorFlagGetter"]),
    ...mapGetters("AppState", ["progressWorkGetter"])
  }
}
</script>

<style lang="scss" scoped>
@import "../css/app.scss";

.waiting-end-work {
  background-color: $background;
  .waiting-end-work__title {
    text-transform: uppercase;
    font-size: 1em;
  }
  .waiting-end-work__annotation {
    margin-top: 10px;
    font-size: 0.75em;
  }
  .waiting-end-work__progress {
    margin: 16px 0;
  }
  .waiting-end-work_status {
    font-size: 0.9em;
    text-align: center;
  }
  .waiting-end-work__error,
  .waiting-end-work__label {
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