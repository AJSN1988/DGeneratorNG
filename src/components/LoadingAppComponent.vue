<template>
  <q-page class="flex flex-center loading-component-container">
    <div class="loading-wrapper">
      <div class="bounce-wrapper">
        <div class="loading">
          <div class="loading__bounceball" />
          <div class="loading__text">
            {{ appCriticalErrorFlagGetter ? "Ошибка" : "Загрузка" }}
            <span>{{ appCriticalErrorFlagGetter ? "Закройте приложение" : "Дождитесь окончания" }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="app-status">
      {{ appStatusGetter }}
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "LoadingComponent",
  computed: {
    ...mapGetters("AppState", ["appStatusGetter"]),
    ...mapGetters("AppState", ["appCriticalErrorFlagGetter"])
  }
}
</script>

<style lang="scss" scoped>
@import "../css/app.scss";

.loading-component-container {
  background-color: $background;
  width: 100%;
  height: 100vh;
  @include flex(column, center, nowrap);
  .loading-wrapper {
    @include flex(row, center, nowrap);
    .bounce-wrapper {
      margin-bottom: 30px;
      position: relative;
      .loading__text {
        color: $primary;
        display: inline-block;
        margin-left: 30px;
        text-transform: uppercase;
        font-size: 1rem;
        span {
          margin-left: 5px;
          font-size: 0.5em;
        }
      }
      .loading__bounceball {
        position: relative;
        display: inline-block;
        height: 42px;
        width: 15px;
        &:before {
          position: absolute;
          content: "";
          display: block;
          top: 0;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background-color: $primary;
          transform-origin: 50%;
          animation: bounce 500ms alternate infinite ease;
        }
      }
    }
  }
  .app-status {
    color: $whiteText;
    background-color: $background1;
    padding: 5px 10px;
  }
}

@keyframes bounce {
  0% {
    top: 30px;
    height: 15px;
    border-radius: 60px 60px 20px 20px;
    transform: scaleX(1.8);
  }
  35% {
    height: 20px;
    border-radius: 50%;
    transform: scaleX(1);
  }
  100% {
    top: 0;
  }
}
</style>