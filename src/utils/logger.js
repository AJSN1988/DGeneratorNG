import fs from "fs";
import path from "path";

export default function logger(level, message) {
  const logFilePath = process.env.NODE_ENV === "production"
    ? path.normalize(path.join(__dirname, "../../app.log"))
    : path.normalize(path.join(__dirname, "../data/log/app.log"));
  const currentDate = Date();

  fs.exists(logFilePath, (exists) => {
    if (!exists) {
      fs.appendFile(logFilePath, `[${currentDate}][INFO] : Подготовка к запуску : [INFO MSG] Файл app.log успешно создан.`, "utf8", (err) => {
        if (err) throw err.message;
      });
    }
    // Save message into app.log
    const log = fs.createWriteStream(logFilePath, {
      flags: 'a'
    });
    log.write(`\n[${currentDate}][${level}] : ${message}`);
    log.close();
  });
}
