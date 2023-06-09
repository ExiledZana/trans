const fs = require('fs');
const { getRandomSender, getRandomReceiver, getRandomAmount } = require('./generator.js');


const folderPath = './archive/';
const balanceFolder = './balances'

const otpravitel = getRandomSender();
const prinimatel = getRandomReceiver();
const kolvo = getRandomAmount();
const balancePathSender = `${balanceFolder}/user_${otpravitel}.json`;
const balancePathReceiver = `${balanceFolder}/user_${prinimatel}.json`;
const senderData = fs.readFileSync(balancePathSender, 'utf8');
const receiverData = fs.readFileSync(balancePathReceiver, 'utf8');

function checkBalance(){

  if (!fs.existsSync(balancePathSender)){
    const files = fs.readdirSync(folderPath);
    let currentBalance = 0;
    files.forEach((file) => {
    const filePath = `${folderPath}/${file}`;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (fileContent.trim().length === 0) {
      return;
    }
    try {
      const jsonData = JSON.parse(fileContent);
      if (jsonData.receiver === otpravitel) {
        currentBalance += jsonData.amount;
      }
  }
  catch (err){
    console.error(`Error parsing JSON from file ${filePath}:`, err);
  }})

  const objectSender = {balance: currentBalance};
  const jsonSender = JSON.stringify(objectSender);
  fs.writeFileSync(balancePathReceiver, jsonSender);
  };



  if (!fs.existsSync(balancePathReceiver)){
    const files = fs.readdirSync(folderPath);
    let currentBalance = 0;
    files.forEach((file) => {
    const filePath = `${folderPath}/${file}`;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (fileContent.trim().length === 0) {
      return;
    }
    try {
      const jsonData = JSON.parse(fileContent);
      if (jsonData.receiver === prinimatel) {
        currentBalance += jsonData.amount;
      }
    }
    catch (err){
      console.error(`Error parsing JSON from file ${filePath}:`, err);
    }})

  const objectReceiver = {balance: currentBalance};
  const jsonReceiver = JSON.stringify(objectReceiver);
  fs.writeFileSync(balancePathReceiver, jsonReceiver);
  }

  const senderBalanceData = JSON.parse(senderData);
  const receiverBalanceData = JSON.parse(receiverData);
  const senderBalance = senderBalanceData.balance;
  const receiverBalance = receiverBalanceData.balance;

  return {
    senderBalance: senderBalance,
    receiverBalance: receiverBalance
  }
}

function countFilesInFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    const fileNumber = files.length;
    return fileNumber;
  } catch (err) {
    console.error('Error reading folder:', err);
    return null;
  }
}




function writingTrans(folderPath) {

    const balance = checkBalance();
    const fileCount = countFilesInFolder(folderPath);
    const currentDate = new Date();
    const fileName = `id_${fileCount}.json`;
    const filePath = folderPath + fileName;
    const komissia = Math.round(kolvo*0.01);
    const total = kolvo + komissia;


    if (balance.senderBalance < kolvo + komissia){
      console.log(`${otpravitel}'s balance is too low. Current Balance ${balance.senderBalance}. Required amount ${total}`)
      return;
    }

    if (otpravitel === prinimatel){
      console.log(`Mr. ${otpravitel}, you can not send tokens to yourself`)
      return;
    }

    else {
      const data = {
        id: fileCount,
        sender: otpravitel,
        receiver: prinimatel,
        amount: kolvo,
        type: 'transfer',
        date: currentDate,
        comission: komissia
      };

      const jsonData = JSON.stringify(data, null, 2);

      fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
        } else {
          console.log(`Successful operation: ${kolvo} are sent from ${otpravitel} to ${prinimatel}. Comission is ${komissia}.`);
        }
      });

      const newSenderBalance = balance.senderBalance - total;
      const newReceiverBalance = balance.receiverBalance + kolvo;
      const senderBalanceDataUpdate = JSON.parse(senderData);
      const receiverBalanceDataUpdate = JSON.parse(receiverData);
      senderBalanceDataUpdate.balance = newSenderBalance;
      receiverBalanceDataUpdate.balance = newReceiverBalance;
      const updatedSenderData = JSON.stringify(senderBalanceDataUpdate, null, 2);
      const updatedReceiverData = JSON.stringify(receiverBalanceDataUpdate, null, 2);

      fs.writeFile(balancePathSender, updatedSenderData, 'utf8', (error) => {
        if (error) {
          console.error('Error writing JSON file:', error);
          return;
        }
        console.log(`New user ${otpravitel} balance = ${newSenderBalance}`);
      });

      fs.writeFile(balancePathReceiver, updatedReceiverData, 'utf8', (error) => {
        if (error) {
          console.error('Error writing JSON file:', error);
          return;
        }
        console.log(`New user ${prinimatel} balance = ${newReceiverBalance}`);
      });


}};



writingTrans(folderPath);