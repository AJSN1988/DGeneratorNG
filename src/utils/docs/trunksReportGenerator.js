import DocsGenerator from "./docsGenerator";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

export default class TrunksReportGenerator extends DocsGenerator {
  constructor(period, config) {
    super(period);
    this.config = config;
    const template = config.trunkstemplatepath;
    this.templatePath = process.env.NODE_ENV === "production" ?
      path.normalize(path.join(this.appPath, template)) :
      path.normalize(path.join(__dirname, "../../data/templates/trunks.html"));
    // Output path
    this.outputPath = path.normalize(path.join(__dirname, `../../data/reports/${this.outputDirectoryName}`));
    // Check and create work directories
    try {
      this.checkDocsDirectory(this.outputPath);
    } catch (err) {
      throw err;
    }
  }
  async createTrunksReport(stats) {
    // Prepare template
    const templateFile = fs.readFileSync(this.templatePath, "utf8");
    const template = handlebars.compile(templateFile);
    const operators = [];
    // Compile data array
    for (let operator in stats) {
      stats[operator].duration = (stats[operator].duration / 60).toFixed();
      operators.push(stats[operator]);
    }

    const data = {
      currentDate: this.period.today,
      operators: operators
    }

    // Create new trunks HTML code
    const reportHTML = template(data);
    const fullPath = path.normalize(path.join(this.outputPath, `trunksReport.html`));
    await promisify(fs.writeFile)(fullPath, reportHTML);
    return fullPath;
  }
}