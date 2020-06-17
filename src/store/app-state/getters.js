const currentUserGetter = (state) => state.currentUser;

const sideMenuOpenGetter = (state) => state.sideMenuOpen;

const appConfigGetter = (state) => state.appConfig;

const appStatusGetter = (state) => state.appStatus;

const appCriticalErrorFlagGetter = (state) => state.appCriticalErrorFlag;

const serverConnectionGetter = (state) => state.serverConnection;

const connectionErrorGetter = (state) => state.connectionError;

const periodGetter = (state) => state.period;

const progressWorkGetter = (state) => state.progressWork;


export {
  currentUserGetter,
  sideMenuOpenGetter,
  appConfigGetter,
  appStatusGetter,
  appCriticalErrorFlagGetter,
  serverConnectionGetter,
  connectionErrorGetter,
  periodGetter,
  progressWorkGetter
};
