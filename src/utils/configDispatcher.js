import fs from "fs";
import { promisify } from "util";
import path from "path";
import electron from "electron";

export default class ConfigDispatcher {
  constructor() {
    this.appPath = electron.remote.app.getAppPath();
    this.configPath = process.env.NODE_ENV === "production"
      ? path.normalize(path.join(this.appPath, "../config.json"))
      : path.normalize(path.join(__dirname, "../data/appConfig/config.json"));
  }
  async readConfig() {
    const config = await promisify(fs.readFile)(this.configPath);
    return JSON.parse(config);
  }
  async updateConfig(configObject) {
    await promisify(fs.writeFile)(this.configPath, JSON.stringify(configObject));
  }
}
