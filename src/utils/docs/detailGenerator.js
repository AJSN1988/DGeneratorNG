import DocsGenerator from "./docsGenerator";
import { convertUnixTimeToFulltime } from "../commonUtils";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

export default class DetailGenerator extends DocsGenerator {
  constructor(period, config, clientsGroup) {
    super(period);
    // Select template path for client group
    const template = clientsGroup === "civil" ? config.civiltemplatepath : config.legaltemplatepath;
    this.templatePath = process.env.NODE_ENV === "production" ?
      path.normalize(path.join(this.appPath, template)) :
      path.normalize(path.join(
        __dirname, clientsGroup === "civil" ?
        "../../data/templates/civilDetail.html" :
        "../../data/templates/legalDetail.html"));
    // Create ouput paths
    this.outputPathIndividual = path.normalize(path.join(__dirname, `../../data/details/${this.outputDirectoryName}/${clientsGroup}/individual`));
    this.outputPathCollection = path.normalize(path.join(__dirname, `../../data/details/${this.outputDirectoryName}/${clientsGroup}/collection`));
    // Check and create work directories
    try {
      this.checkDocsDirectory(this.outputPathIndividual, this.outputPathCollection);
    } catch (err) {
      throw err;
    }
    this.config = config;
    this.clientsGroup = clientsGroup;
  }
  async generateSingleDetail(client, calls, number, mode, tax) {
    // Prepare template
    const templateFile = fs.readFileSync(this.templatePath, "utf8");
    const template = handlebars.compile(templateFile);
    let totalCalls = 0;
    let totalDurations = 0;
    let totalSumm = 0;
    let clientNumbers = [];
    // Edit calls
    for (let call of calls) {
      // Add to total stats
      totalCalls += 1;
      totalDurations += Number(call.duration);



      if (this.clientsGroup === "civil") {
        // Compile summ
        call.tarifCost = (call.tarifCost / 1000).toFixed(2);
        call.summ = (call.summ / 1000).toFixed(3);
      } else {
        const summWithTax = Number((call.summ / 1000).toFixed(3)) * tax;
        // Add in total summ
        totalSumm += summWithTax;
        call.summ = summWithTax.toFixed(3);
      }
      call.date = convertUnixTimeToFulltime(call.date);
      // Add client number in array
      if (!clientNumbers.includes(call.numberA)) {
        clientNumbers.push(call.numberA);
      }
    }
    // Prepare detail data
    const data = {
      detailNumber: `${number.toString().padStart(5, "0")}-${this.period.short}`,
      currentDate: this.period.today,
      user: client["full_name"],
      clientPhone: clientNumbers.join(" "),
      period: this.period.label,
      account: client["account_id"],
      contract: client["comments"],
      date: this.period.label,
      year: this.period.today.split(".")[2],
      calls: calls,
      totalCalls: totalCalls,
      totalDurations: totalDurations,
      totalDurationsMinutes: Math.ceil(totalDurations / 60),
      totalSumm: this.clientsGroup === "civil" ? (client["mg_summ"] / 100).toFixed(2) : totalSumm.toFixed(2)
    };
    try {
      // Create new detail HTML code
      const billHTML = template(data);
      const fullPath = mode === "single" ?
        path.normalize(path.join(this.outputPathIndividual, `${client["account_id"]}.html`)) :
        path.normalize(path.join(this.outputPathCollection, `${client["account_id"]}.html`));
      await promisify(fs.writeFile)(fullPath, billHTML);
      return fullPath;
    } catch (err) {
      throw err;
    }
  }
}