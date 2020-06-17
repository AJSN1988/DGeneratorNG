import { stat } from "fs";

const currentUserMutation = (state, payload) => {
  state.currentUser = payload;
};

const sideMenuOpenMutation = (state) => {
  state.sideMenuOpen = !state.sideMenuOpen;
}

const appConfigMutation = (state, payload) => {
  state.appConfig = payload;
};

const appStatusMutation = (state, payload) => {
  state.appStatus = payload;
};

const appCriticalErrorFlagMutation = (state, payload) => {
  state.appCriticalErrorFlag = payload;
}

const serverConnectionMutation = (state, payload) => {
  state.serverConnection = payload;
}

const connectionErrorMutation = (state, payload) => {
  state.connectionError = payload;
}

const periodMutation = (state, payload) => {
  state.period = payload;
}

const progressWorkMutation = (state, payload) => {
  state.progressWork = payload;
}

const reportNumberMutation = (state, payload) => {
  state.appConfig.reports.reportnumber = payload;
}

const billNumberMutation = (state, payload) => {
  console.log(payload)
  state.appConfig.reports.billnumber = payload;
}


export {
  currentUserMutation,
  sideMenuOpenMutation,
  appConfigMutation,
  appStatusMutation,
  appCriticalErrorFlagMutation,
  serverConnectionMutation,
  connectionErrorMutation,
  periodMutation,
  progressWorkMutation,
  reportNumberMutation,
  billNumberMutation
};
