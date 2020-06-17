import electron from "electron";
import fs from "fs";

export default class DocsGenerator {
  constructor(period) {
    this.period = period;
    this.appPath = electron.remote.app.getAppPath();
    this.outputDirectoryName = period.short;
  }
  checkDocsDirectory(directories) {
    try {
      for (let directory of arguments) {
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }
      }
    } catch (err) {
      throw err;
    }
  }
  compileClientAddress(address, flat) {
    return `${address} ${flat}`;
  }
  getStreetNameFromAddress(address) {
    const rawStreetRegex = /(?<=ул)([\s\S]+?)(?=д[.,;:\s])/;
    const onlyStreetNameRegex = /(?<=^[.,;:\s])([\s\S]+?)(?=[.,:;\s]+$)/; // Maybe need update this regex
    const rawStreetName = address.match(rawStreetRegex);

    if (rawStreetName[0]) {
      const streetName = rawStreetName[0].match(onlyStreetNameRegex);
      if (streetName[0]) {
        return streetName[0];
      } else {
        throw new Error(`Адрес - "${address}" имеет некорректный формат`);
      }
    } else {
      throw new Error(`Адрес - "${address}" имеет некорректный формат`);
    }
  }
  compileSumm(summ, kopLength = 2) {
    if (!summ) return "0.00";
    summ = summ.toString();
    if (summ.length > kopLength) {
      const rubles = summ.substring(0, summ.length - kopLength);
      const kops = summ.slice(-kopLength);
      return `${rubles}.${kops}`;
    } else {
      return `0.${summ.padStart(kopLength, "0")}`;
    }
  }
  async emptyDirectory(directory) {
    try {
      await promisify(fsExtra.emptyDir)(directory);
    } catch (err) {
      throw err;
    }
  }
  async createCSVFromData(delimeter, fieldsTitles, dataArray) {
    let csv = "";
    if (fieldsTitles[0].title) {
      csv = `${fieldsTitles.map(el => el.title).join(delimeter)}\n`; // First line with titles
    }
    for (let row of dataArray) {
      let rowData = [];
      for (let fieldName of fieldsTitles.map(el => el.name)) {
        rowData.push(row[fieldName]);
      }
      csv += `${rowData.join(delimeter)}\n`;
    }

    return csv;
  }
}