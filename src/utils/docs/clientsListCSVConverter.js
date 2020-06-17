import DocsGenerator from "./docsGenerator";
import { promisify } from "util";
import fs from "fs";
import path from "path";

export default class ClientsListCSVConverter extends DocsGenerator {
  constructor(period, titles, config) {
    super(period);
    this.delimeter = config.csvdelimeter;
    this.titles = titles;
    // Create ouput paths
    this.outputPath = path.normalize(path.join(__dirname, `../../data/reports/${this.outputDirectoryName}`));
    // Check and create work directories
    try {
      this.checkDocsDirectory(this.outputPath);
    } catch (err) {
      throw err;
    }
  }
  async createClientsCSVFile(clients, clientsGroup) {
    try {
      let fullCSV = await this.createCSVFromData(this.delimeter, this.titles, clients);
      const totalSumm = clients.reduce((total, current) => total + Number(current["mg_summ"]), 0);
      fullCSV += ["", "", "Итого сумма МГ/МН", this.compileSumm(totalSumm)].join(this.delimeter);

      const fullPath = path.normalize(path.join(this.outputPath, `${clientsGroup}ClientsList.csv`));
      await promisify(fs.writeFile)(fullPath, fullCSV, "utf8");
      return fullPath;
    } catch (err) {
      throw err;
    }
  }
}