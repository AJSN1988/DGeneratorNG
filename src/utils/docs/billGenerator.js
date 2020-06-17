import DocsGenerator from "./docsGenerator";
import fs from "fs";
import fsExtra from "fs-extra";
import { promisify } from "util";
import path from "path";
import handlebars from "handlebars";
import qr from "../qrGenerator";

export default class BillGenerator extends DocsGenerator {
  constructor(period, config) {
    super(period);
    this.billsCollection = {};
    this.maxBillsChunk = config.maxbillschunk;
    this.templatePath = process.env.NODE_ENV === "production" ?
      path.normalize(path.join(this.appPath, config.templatepath)) :
      path.normalize(path.join(__dirname, "../../data/templates/bill.html"));
    this.outputPathStandart = path.normalize(path.join(__dirname, `../../data/bills/${this.period.short}/standart`));
    this.outputPathCustom = path.normalize(path.join(__dirname, `../../data/bills/${this.period.short}/custom`));
    this.outputPathCollection = path.normalize(path.join(__dirname, `../../data/bills/${this.period.short}/collection`))
    // Check ouput path existing
    try {
      this.checkDocsDirectory(this.outputPathStandart, this.outputPathCustom, this.outputPathCollection);
    } catch (err) {
      throw err;
    }
  }
  async generateSingleBill(client, services, number, type, mode) {
    // Create bill for a client
    const templatePath = this.templatePath;
    // const outputPath = this.outputPathCustom;
    const outputPath = type === "standart" ? this.outputPathStandart : this.outputPathCustom;
    const templateFile = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(templateFile);

    // Create service qr codes
    let qrImages = [];
    for (let service of services) {
      // Genarate QR code base64 string
      const qrBase64 = await qr({
        fullName: client.user,
        accountID: client.account,
        address: client.address
      }, service.summ, service.vid);
      qrImages.push(qrBase64);
      // Compile service summ
      const summ = this.compileSumm(service.summ);
      service.summ = summ;
    }
    // Prepare payment data
    const data = {
      billNumber: `${number.toString().padStart(5, "0")}-${this.period.short}`,
      currentDate: this.period.today,
      user: client.user,
      address: client.address,
      account: client.account,
      date: this.period.label,
      year: this.period.today.split(".")[2],
      services: services,
      qrCodes: qrImages
    };

    try {
      // Create new bill HTML code
      const billHTML = template(data);
      if (mode === "single") {
        // Create new bill file for a single client
        const fullPath = path.normalize(path.join(outputPath, `${client.account}.html`));
        await promisify(fs.writeFile)(fullPath, billHTML);
        return fullPath;
      } else if (mode === "collect") {
        // Return raw html file for collecting
        return billHTML;
      }
    } catch (err) {
      throw err;
    }
  }
  async addBillInCollection(client, services, number) {
    const clientStreet = this.getStreetNameFromAddress(client.address).trim();
    const collectonPath = path.normalize(path.join(this.outputPathCollection, clientStreet));
    try {
      // Check street name directory exist
      this.checkDocsDirectory(collectonPath);
      // Add filecount into collection
      if (this.billsCollection[clientStreet]) {
        this.billsCollection[clientStreet].count++
      } else {
        this.billsCollection[clientStreet] = {};
        this.billsCollection[clientStreet].count = 1;
        this.billsCollection[clientStreet].fileName = 1;
      }
      // Create bill HTML
      const billHTML = await this.generateSingleBill(client, services, number, "standart", "collect");
      // Calc max bills in specific collection. And set new collection name
      if (this.billsCollection[clientStreet].count > this.maxBillsChunk) {
        this.billsCollection[clientStreet].count = 1;
        this.billsCollection[clientStreet].fileName++;
      } const fullPath = path.normalize(path.join(collectonPath, `${this.billsCollection[clientStreet].fileName}.html`));
      await promisify(fs.appendFile)(fullPath, billHTML);
      // Return last bill file location. It provide functionlity for openning in explorer
      console.log(client.user, client.address);
      console.log(number);
      return collectonPath;
    } catch (err) {
      throw err;
    }
  }
  async removeCollectionBillsDirectiry() {
    await promisify(fsExtra.emptyDir)(this.outputPathCollection);
  }
}