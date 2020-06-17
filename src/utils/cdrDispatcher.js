import fs from "fs";
import fsExtra from "fs-extra";
import { promisify } from "util";
import path from "path";

export default class CdrDispatcher {
  constructor(catalog) {
    this.catalog = catalog;
    this.fullCdrsPath = path.normalize(path.join(__dirname, `../data/cdr/${this.catalog}`));
    if (!fs.existsSync(this.fullCdrsPath)) {
      fs.mkdirSync(this.fullCdrsPath, { recursive: true });
    }
    this.needClearDirectory = true;
  }
  async convertCdr(file, format) {
    // Check current CDR folder and remove old files if need
    if (this.needClearDirectory) {
      const files = await promisify(fs.readdir)(this.fullCdrsPath);
      if (files.length) await promisify(fsExtra.emptyDir)(this.fullCdrsPath);
      this.needClearDirectory = false;
    }

    const text = await file.text();
    const lines = text.split("\n");
    let counter = 0;
    let convertedLines = "";
    const fileName = file.name.replace(/\.[^.]*$/, '.cdr');
    // Simple file format checking 

    if ((format === "eltex" && /comlog_[0-9][0-9]_[0-9][0-9]_[0-9][0-9][0-9][0-9].log$/.test(file.name)) ||
      (format === "mta" && /[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9].cdr$/.test(file.name))) {
      // Simple incoming file format check

      throw new Error(`Некорректный формат CDR файла. Проверьте содержимое загружаемого файла и формат CDR`);
    }

    for (let line of lines) {
      if (format === "mta") {
        // Format mta m200 - (delimeter " " space)
        //trunk_a 
        // number_a 
        // trunk_b 
        // number_b 
        // date(dd-mm-yy) 
        //time(hh:mm:ss)
        // duration
        // end_reason

        // Format UTM5 - number_a;number_b;duration;session_id(counter);date(dd-mm-yy hh:mm:ss);trunkA;trunkB;id_station (1 - mta, 222 - eltex)

        if (line) {
          const chunks = line.trim().substring(1, line.length).split(" "); // First need delete stx symbol. Fucking mta )
          if (counter === lines.length - 2) {
            convertedLines += `${chunks[1]};${chunks[3]};${chunks[6]};${counter++};${chunks[4]} ${chunks[5]};${chunks[0]};${chunks[2]};1`;
          } else {
            convertedLines += `${chunks[1]};${chunks[3]};${chunks[6]};${counter++};${chunks[4]} ${chunks[5]};${chunks[0]};${chunks[2]};1\n`;
          }
        }

      } else if (format === "eltex") {
        // Format eltex - (delimeter ";")
        //station_id; (222 - SMG1016m)
        //answer_time (yyyy-mm-dd hh:mm:ss);
        //call_duration;
        //q850_reason;
        //break_status;
        //a_ip_address;
        //a_type;
        //a_describe;
        //in_a_number;
        //out_a_number;
        //in_a_caller_id;
        //out_a_caller_id;
        //in_a_redirection_number;
        //out_a_redirection_number;
        //b_ip_address;
        //b_type;
        //b_describe;
        //in_b_number;
        //out_b_number;
        //time_call_start;
        //time_call_end;
        //redirection_tag

        // Format UTM5 - number_a;number_b;duration;session_id(counter);date(dd-mm-yy hh:mm:ss);trunkA;trunkB;id_station (1 - mta, 222 - eltex)

        if (line) {
          const chunks = line.trim().substring(1, line.length).split(";");

          const formatedDate = chunks[1].split(" ")[0].split("-").map(d => {
            if (d.length === 4) {
              return d.substring(2, 0);
            } else return d;
          }).reverse().join("-");
          const formatedTime = chunks[1].split(" ")[1];
          if (counter === lines.length - 2) {
            convertedLines += `${chunks[9]};${chunks[18]};${chunks[2]};${counter++};${formatedDate} ${formatedTime};${chunks[15]};${chunks[16]};1`;
          } else {
            convertedLines += `${chunks[9]};${chunks[18]};${chunks[2]};${counter++};${formatedDate} ${formatedTime};${chunks[15]};${chunks[16]};1\n`;
          }
        }
      }
    }

    await promisify(fs.writeFile)(path.normalize(path.join(this.fullCdrsPath, fileName)), convertedLines);
    return fileName;
  }
  async cancelPrevConverting() {
    // Remove created CDR catalog
    await fsExtra.remove(this.fullCdrsPath);
  }
  getPathToCDR() {
    return this.fullCdrsPath;
  }
}