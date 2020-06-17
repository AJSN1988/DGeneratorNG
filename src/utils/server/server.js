import path from "path";

export default class UtmServer {
  constructor(setAppAction, setErrorConnection, mysqlDispatcher) {
    this.setAppAction = setAppAction;
    this.setErrorConnection = setErrorConnection;
    this.established = false;
    this.client = null;
    this.mysql = mysqlDispatcher;
    this.sftpSession = null;
    this.sftpConnection = null;
  }
  async connect(serverConfig, dbConfig) {
    // Connnect to server, port forwarding and connect to UTM database
    const Client = require("ssh2").Client;
    const ssh = new Client();
    this.client = ssh;
    const setAppStatus = this.setAppAction;
    const setErrorConnection = this.setErrorConnection;

    await new Promise((resolve, reject) => {
      ssh.on("ready", () => {
        ssh.forwardOut(
          dbConfig.databasehost,
          serverConfig.remotePort,
          dbConfig.databasehost,
          serverConfig.remotePort,
          (err, stream) => {
            if (err) reject(err);

            setAppStatus({
              level: "INFO",
              message: `Подключение к серверу UTM : [INFO MSG] Порт ${serverConfig.remotePort} был успешно проброшен до сервера UTM`
            });

            this.established = true;

            this.mysql.init(stream).then(() => {
              setAppStatus({
                level: "INFO",
                message: `Подключение к базе данных UTM : [INFO MSG] База данных ${dbConfig.databasename} готова к использованию`
              });
              resolve();
            }).catch(err => {
              reject(err);
            });
          }
        );
      }).on("keyboard-interactive", function (name, instructions, instructionsLang, prompts, finish) {
        finish([serverConfig.password]);
      }).on("error", (err) => {
        setAppStatus({
          level: "ERROR",
          message: `Ошибка подключения к серверу UTM : [ERR MSG] Ошибка соединения с сервером. Причина : ${err}`
        });
        // reject(err);
        setErrorConnection(true);
      }).on("timeout", (err) => {
        setAppStatus({
          level: "ERROR",
          message: `Ошибка подключения к серверу UTM : [ERR MSG] Время подключения к серверу истекло : ${err}`
        });
        setErrorConnection(true);
      }).on("end", () => {
        setAppStatus({
          level: "INFO",
          message: "Подключение к серверу UTM : [INFO MSG] Соединение с сервером UTM5 успешно закрыто"
        });
      });
      ssh.connect({
        host: serverConfig.host,
        port: serverConfig.transport,
        username: serverConfig.user,
        password: serverConfig.password,
        tryKeyboard: true
      });
    });
  }
  async disconnect() {
    if (this.established) {
      try {
        await this.mysql.disconnect();
        this.client.end();
        this.established = false;
      } catch (err) {
        throw err;
      }
    }
  }
  async initSFTP(serverConfig, remoteCdrsLocation) {
    const Client = require("ssh2").Client;
    const connection = new Client();
    // Init connection
    await new Promise((resolve, reject) => {
      connection.on("ready", () => {
        connection.sftp((err, sftp) => {
          if (err) throw err;
          this.sftpSession = sftp;
          this.sftpConnection = connection;
          // Check existing cdr directory
          sftp.exists(remoteCdrsLocation, (exists) => {
            if (!exists) {
              sftp.mkdir(remoteCdrsLocation, (err) => {
                if (err) reject(err);
                this.setAppAction({
                  level: "INFO",
                  message: "Передача CDR файлов на сервер UTM : [INFO MSG] SFTP сессия открыта. Передача файлов доступна"
                });
                resolve();
              });
            } else {
              this.setAppAction({
                level: "INFO",
                message: "Передача CDR файлов на сервер UTM : [INFO MSG] SFTP сессия открыта. Передача файлов доступна"
              });
              resolve();
            }
          });
        });
      }).on("keyboard-interactive", function (name, instructions, instructionsLang, prompts, finish) {
        finish([serverConfig.password]);
      }).on("end", () => {
        this.setAppAction({
          level: "INFO",
          message: "Передача CDR файлов на сервер UTM : [INFO MSG] SFTP сессия успешно закрыта"
        });
      });
      connection.connect({
        host: serverConfig.host,
        port: serverConfig.transport,
        username: serverConfig.user,
        password: serverConfig.password,
        tryKeyboard: true
      });
    });
  }
  async transferCDR(cdr, cdrDirectory, remoteCdrsLocation) {
    // Transer CDR file through initialised sftp connection
    const fullLocalPath = path.normalize(path.join(cdrDirectory, cdr));
    const fullRemotePath = `${remoteCdrsLocation}/${cdr}`;
    await new Promise((resolve, reject) => {
      this.sftpSession.fastPut(fullLocalPath, fullRemotePath, (err) => {
        if (err) reject(err);
        this.setAppAction({
          level: "INFO",
          message: `Передача CDR файлов на сервер UTM : [INFO MSG] Файл ${cdr} успешно передан на сервер UTM`
        });
        resolve();
      });
    });
  }
  async readRemoteCDR(remoteCdrsLocation, CDRName) {
    // Read CDR file through initialised sftp connection
    const fullPath = `${remoteCdrsLocation}/${CDRName}`;
    const lines = await new Promise((resolve, reject) => {
      this.sftpSession.readFile(fullPath, (err, handle) => {
        if (err) reject(err);
        resolve(handle.toString());
      });
    });
    return lines;
  }
  async getRemoteCDRsNames(remoteCdrsLocation) {
    // Get all CDR files in UTM server (use period)    
    const cdrs = await new Promise((resolve, reject) => {
      this.sftpSession.readdir(remoteCdrsLocation, (err, list) => {
        if (err) reject(err);
        resolve(list);
      });
    });
    return cdrs;
  }
  closeSFTPConnection() {
    if (this.sftpConnection) {
      this.sftpConnection.end();
    }
  }
}