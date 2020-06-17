import {
  app, screen, BrowserWindow, nativeTheme, Menu, MenuItem
} from "electron";
import logger from "../../src/utils/logger.js";

try {
  if (process.platform === "win32" && nativeTheme.shouldUseDarkColors === true) {
    require("fs").unlinkSync(require("path").join(app.getPath("userData"), "DevTools Extensions"));
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require("path").join(__dirname, "statics").replace(/\\/g, "\\\\");
}

let mainWindow;

function createWindow() {
  // Init screen
  const agentArea = screen.getPrimaryDisplay().workAreaSize;
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: agentArea.width,
    height: agentArea.height,
    useContentSize: true,
    frame: false,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: QUASAR_NODE_INTEGRATION,

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')
    },
  });
  // Remove menu bar
  mainWindow.removeMenu();

  mainWindow.loadURL(process.env.APP_URL);

  logger("INFO", "Начало работы : [INFO MSG] Окно приложения успешно инициировано.\n[START OF LOGGING]");

  mainWindow.on("close", () => {
    logger("INFO", "Завершение работы : [INFO MSG] Приложение корректно завершило работу.\n[END OF LOGGING]");
  })

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  createWindow();
  const contextMenu = new Menu();
  contextMenu.append(new MenuItem({
    label: "Выделить все",
    role: "selectAll"
  }));
  contextMenu.append(new MenuItem({
    label: "Скопировать",
    role: "copy"
  }));
  contextMenu.append(new MenuItem({
    label: "Вырезать",
    role: "cut"
  }));
  contextMenu.append(new MenuItem({
    label: "Вставить",
    role: "paste"
  }));
  mainWindow.webContents.on('context-menu', (e, params) => {
    contextMenu.popup(mainWindow, params.x, params.y);
  })
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
