export default function () {
  return {
    currentUser: {},
    appStatus: "",
    progressWork: 0.0,
    sideMenuOpen: false,
    serverConnection: false,
    connectionError: false,
    appConfig: {},
    appCriticalErrorFlag: false,
    period: {
      firstDay: null,
      lastDay: null,
      label: null,
      short: null
    }
  };
}
