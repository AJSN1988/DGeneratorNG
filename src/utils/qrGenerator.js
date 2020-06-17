import QRCode from 'qrcode';

export default async function qrGenerate(clientData, summ, VID) {
  const splitedName = clientData.fullName.split(" ");
  const lastName = splitedName[0];
  const firstName = splitedName[1];
  const middleName = splitedName[2] ? splitedName[2] : "";

  const data = `ST00012|Name=ООО «Альтес-Р»|PersonalAcc=40702810740460000716|BankName=ПАО Сбербанк|BIC=044525225|CorrespAcc=30101810400000000225|Sum=${summ}|PayeeINN=5055002574|KPP=505501001|PersAcc=${clientData.accountID}|LastName=${lastName}|FirstName=${firstName}|MiddleName=${middleName}|PayerAddress=${clientData.address}|VID=${VID}`;
  const base64 = await new Promise((resolve, reject) => {
    QRCode.toDataURL(data, (err, url) => {
      if (err) reject(err);
      resolve(url);
    });
  });
  return base64;
}