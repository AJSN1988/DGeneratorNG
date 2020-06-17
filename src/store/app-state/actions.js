import logger from "../../utils/logger.js";

const setCurrentUser = ({ commit }, payload) => {
  logger(payload.level, payload.message);
  commit("currentUserMutation", payload.user);
};

const toggleSideMenuOpen = ({ commit }) => {
  commit("sideMenuOpenMutation");
}

const setAppConfig = ({ commit }, payload) => {
  commit("appConfigMutation", payload);
};

const setAppCriticalErrorFlag = ({ commit }, payload) => {
  logger("ERROR", "Критическая ошибка : [ERR MSG] Обнаружена критическая ошибка. Работа приложения не может быть продолжена.")
  commit("appCriticalErrorFlagMutation", payload);
};

const setAppStatus = ({ commit }, payload) => {
  logger(payload.level, payload.message);
  commit("appStatusMutation", payload.message);
};

const setServerConnection = ({ commit }, payload) => {
  commit("serverConnectionMutation", payload);
}

const setConnectionError = ({ commit }, payload) => {
  commit("connectionErrorMutation", payload);
}

const setPeriod = ({ commit }, payload) => {
  commit("periodMutation", payload);
}

const setProgressWork = ({ commit }, payload) => {
  commit("progressWorkMutation", payload);
}

const setReportNumber = ({ commit }, payload) => {
  commit("reportNumberMutation", payload);
}

const setBillNumber = ({ commit }, payload) => {
  commit("billNumberMutation", payload);
}

export {
  setCurrentUser,
  toggleSideMenuOpen,
  setAppConfig,
  setAppStatus,
  setAppCriticalErrorFlag,
  setServerConnection,
  setConnectionError,
  setPeriod,
  setProgressWork,
  setReportNumber,
  setBillNumber
};
