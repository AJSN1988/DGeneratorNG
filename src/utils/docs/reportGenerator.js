import DocsGenerator from "./docsGenerator";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";


export default class ReportGenerator extends DocsGenerator {
  constructor(period, config, user) {
    super(period);
    this.config = config;
    this.currentUser = user;
    const template = config.forbillstemplatepath;
    this.templatePath = process.env.NODE_ENV === "production" ?
      path.normalize(path.join(this.appPath, template)) :
      path.normalize(path.join(__dirname, "../../data/templates/reportForBills.html"));
    // Output path
    this.outputPath = path.normalize(path.join(__dirname, `../../data/reports/${this.outputDirectoryName}`));
    // Check and create work directories
    try {
      this.checkDocsDirectory(this.outputPath);
    } catch (err) {
      throw err;
    }
  }
  async generateReport(clients, totalSummObject, needExport) {
    // Prepare template
    const templateFile = fs.readFileSync(this.templatePath, "utf8");
    const template = handlebars.compile(templateFile);
    let lineCounter = 0;
    let billNumber = this.config.billnumber;
    let reportRows = [];
    let totalDurationLegal = 0;
    let totalDurationCivil = 0;

    // Fill report data
    for (let client of clients) {
      if (client["zone_duration"] !== "0") {
        // Fill zone row data
        reportRows.push({
          counter: ++lineCounter,
          billNumber: this.formatBillNumber(++billNumber),
          clientName: client["full_name"],
          contractNumber: client["contract_number"],
          serviceName: "Услуга внутризоновой связи, оказанная автоматическим способом",
          serviceCode: this.config.zoneservicecode,
          duration: client["zone_duration"],
          summWithoutTax: client["zone_summ"],
          summWithTax: client["zone_summ_with_tax"]
        });
      }
      if (client["mg_duration"] !== "0") {
        // Fill mg row data
        reportRows.push({
          counter: ++lineCounter,
          billNumber: this.formatBillNumber(++billNumber),
          clientName: client["full_name"],
          contractNumber: client["contract_number"],
          serviceName: "Услуга междугородной связи, оказанная автоматическим способом",
          serviceCode: this.config.mgservicecode,
          duration: client["mg_duration"],
          summWithoutTax: client["mg_summ"],
          summWithTax: client["mg_summ_with_tax"]
        });
      }
      if (client["mn_duration"] !== "0") {
        // Fill mn row data
        reportRows.push({
          counter: ++lineCounter,
          billNumber: this.formatBillNumber(++billNumber),
          clientName: client["full_name"],
          contractNumber: client["contract_number"],
          serviceName: "Услуга международной связи, оказанная автоматическим способом",
          serviceCode: this.config.mnservicecode,
          duration: client["mn_duration"],
          summWithoutTax: client["mn_summ"],
          summWithTax: client["mn_summ_with_tax"]
        });

      }
      // Fill total duration
      if (client["tariff_id"] === this.config.legalid) {
        totalDurationLegal += Number(client["mg_duration"]);
      } else if (client["tariff_id"] === this.config.civilid) {
        totalDurationCivil = Number(client["zone_duration"]) + Number(client["mg_duration"]) + Number(client["mn_duration"]);
      }
    }
    // Fill template data
    const data = {
      agentContract: this.config.agentcontract,
      reportNumber: this.config.reportnumber.toString().padStart(4, "0"),
      currentDate: this.period.today,
      currentUser: this.currentUser,
      rows: reportRows,
      totalSummWithoutTaxLegal: totalSummObject.legalNoTax,
      totalSummWithTaxLegal: totalSummObject.legalWithTax,
      totalDurationLegal: totalDurationLegal,
      totalSummWithoutTaxCivil: totalSummObject.civilNoTax,
      totalSummWithTaxCivil: totalSummObject.civilWithTax,
      totalDurationCivil: totalDurationCivil
    }
    // Create new report HTML code
    const reportHTML = template(data);
    const fullPath = path.normalize(path.join(this.outputPath, `allServicesReport.html`));
    await promisify(fs.writeFile)(fullPath, reportHTML);
    if (needExport) {
      // Compile total data
      const totalInfo = {
        legal: {
          totalSummNoTax: totalSummObject.legalNoTax,
          totalSummWithTax: totalSummObject.legalWithTax,
          duration: totalDurationLegal
        },
        civil: {
          totalSummNoTax: totalSummObject.civilNoTax,
          totalSummWithTax: totalSummObject.civilWithTax,
          duration: totalDurationCivil
        }
      }
      const titles = [
        { name: "counter", title: "Номер по порядку" },
        { name: "billNumber", title: "Номер счета*" },
        { name: "contractNumber", title: "Номер договора" },
        { name: "serviceName", title: "Наименование услуги" },
        { name: "serviceCode", title: "Код услуги **" },
        { name: "duration", title: "Объем оказанной услуги(в минутах)" },
        { name: "summWithoutTax", title: "Стоимость(в рублях без учета НДС)" },
        { name: "summWithTax", title: "Стоимость(в рублях с учетом НДС)" }
      ]
      // Export data in csv file
      await this.exportReportToCSV(titles, data.rows, totalInfo)
    }
    // Create b2b report (csv version)
    const b2bTitles = [

    ];
    await this.generateB2BReport(data.rows);
    return {
      path: fullPath,
      billNumber: billNumber
    };
  }
  formatBillNumber(billNumber) {
    return `GW#${billNumber.toString().padStart(6, "0")}`;
  }
  async exportReportToCSV(titles, clients, totalInfo) {
    try {
      const delimeter = this.config.csvdelimeter;
      let fullCSV = await this.createCSVFromData(delimeter, titles, clients);
      fullCSV += `ИТОГО, СОГЛАСНО ОТЧЕТА ПО КЛИЕНТАМ - ЮРИДИЧЕСКИМ ЛИЦАМ:${delimeter.repeat(8)}\n`;
      fullCSV += `${delimeter.repeat(5)}Юридические лица сумма без учета НДС${delimeter}${totalInfo.legal.totalSummNoTax}${delimeter}руб.\n`;
      fullCSV += `${delimeter.repeat(5)}Юридические лица сумма с учетом НДС${delimeter}${totalInfo.legal.totalSummWithTax}${delimeter}руб.\n`;
      fullCSV += `${delimeter.repeat(5)}Юридические лица объем оказанных услуг связи${delimeter}${totalInfo.legal.duration}${delimeter}мин.\n`;
      fullCSV += `ИТОГО, СОГЛАСНО ОТЧЕТА ПО КЛИЕНТАМ - ФИЗИЧЕСКИМ ЛИЦАМ:${delimeter.repeat(8)}\n`;
      fullCSV += `${delimeter.repeat(5)}Физические лица сумма без учета НДС${delimeter}${totalInfo.civil.totalSummNoTax}${delimeter}руб.\n`;
      fullCSV += `${delimeter.repeat(5)}Физические лица сумма с учетом НДС${delimeter}${totalInfo.civil.totalSummWithTax}${delimeter}руб.\n`;
      fullCSV += `${delimeter.repeat(5)}Физические лица объем оказанных услуг связи${delimeter}${totalInfo.civil.duration}${delimeter}мин.\n`;

      const fullPath = path.normalize(path.join(this.outputPath, "clientsServicesReport.csv"));
      await promisify(fs.writeFile)(fullPath, fullCSV, "utf8");
      return fullPath;
    } catch (err) {
      throw err;
    }
  }
  async generateB2BReport(clients) {
    const delimeter = this.config.csvdelimeter;
    const titles = [
      { name: "counter" },
      { name: "agentContract" },
      { name: "contractNumber" },
      { name: "billNumber" },
      { name: "actNumber" },
      { name: "billDate" },
      { name: "lastPaymentDate" },
      { name: "currency" },
      { name: "NDSCode" },
      { name: "serviceCode" },
      { name: "serviceDate" },
      { name: "summWithTax" },
      { name: "duration" },
      { name: "locationCode" },
      { name: "needNDS" },
    ];
    const clientsData = clients.map(client => {
      client["agentContract"] = this.config.agentcontract;
      client["actNumber"] = "";
      client["billDate"] = this.period.billPaymentDay;
      client["lastPaymentDate"] = this.period.billPaymentDay;
      client["currency"] = "0";
      client["NDSCode"] = this.config.ndscode;
      client["serviceDate"] = this.period.billPaymentDay;
      client["locationCode"] = "46 465";
      client["needNDS"] = "1";
      return client;
    });
    let fullCSV = await this.createCSVFromData(delimeter, titles, clientsData);
    const nextMonthLabel = Number(this.period.short.split('-')[0]) + 1;
    const yearLabel = this.period.short.split('-')[1];
    const fullPath = path.normalize(path.join(this.outputPath, `GW_BIL_${nextMonthLabel.toString().padStart(2, "0")}_${yearLabel}.csv`));
    await promisify(fs.writeFile)(fullPath, fullCSV);

  }
}