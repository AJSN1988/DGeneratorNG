import { shell } from "electron";
import path from "path";
import { date } from "quasar";
import fs from "fs";

function openDocsLocation(documentPath) {
  // Open location
  try {
    shell.showItemInFolder(path.resolve(documentPath));
  } catch (err) {
    throw err;
  }
}

const docPaths = {
  bills: path.normalize(path.join(__dirname, process.env.NODE_ENV === "production" ? `../../data/bills` : `../data/bills`)),
  details: path.normalize(path.join(__dirname, process.env.NODE_ENV === "production" ? `../../data/details` : `../data/details`)),
  reports: path.normalize(path.join(__dirname, process.env.NODE_ENV === "production" ? `../../data/reports` : `../data/reports`)),
  log: path.normalize(path.join(__dirname, process.env.NODE_ENV === "production" ? `../../data/log` : `../data/log`)),
}

function checkDirectory(docType) {
  return fs.existsSync(path.resolve(docPaths[docType])) ? false : true;
}

function openDocsDirectory(docType) {
  try {
    shell.openItem(path.resolve(docPaths[docType]));
  } catch (err) {
    throw err;
  }
}

async function sendMail(attachPath, subject, text, mailConfig, userConfig) {
  try {
    const nodemailer = require('nodemailer');
    let transporter = nodemailer.createTransport({
      host: mailConfig.server,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.username,
        pass: mailConfig.password
      }
    });
    // Send mail with bill in attach
    await transporter.sendMail({
      from: `DGenerator NG Подсистема рассылки <${mailConfig.username}>`,
      to: userConfig.email,
      subject: subject,
      text: text,
      attachments: [
        {
          filename: path.basename(attachPath),
          path: path.resolve(attachPath)
        }
      ]
    });
  } catch (err) {
    throw err;
  }
}

function convertUnixTimeToFulltime(unixTimeStr) {
  return date.formatDate(
    unixTimeStr * 1000,
    "DD.MM.YYYY HH:mm:ss",
    {
      months: [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь"
      ]
    }
  );
}

export { openDocsLocation, openDocsDirectory, checkDirectory, sendMail, convertUnixTimeToFulltime };