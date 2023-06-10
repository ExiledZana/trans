const fs = require('fs');
const { getRandomSender, getRandomReceiver, getRandomAmount } = require('./generator.js');


const folderPath = './archive/';
const balanceFolder = './balances'

const balance = {};


function generateRandom() {
  const sender = getRandomSender();
  const receiver = getRandomReceiver();
  const amount = getRandomAmount();
  const balancePathSender = `${balanceFolder}/user_${sender}.json`;
  const balancePathReceiver = `${balanceFolder}/user_${receiver}.json`;
  const senderData = fs.readFileSync(balancePathSender, 'utf8');
  const receiverData = fs.readFileSync(balancePathReceiver, 'utf8');

  checkBalanceFiles(currentBalance, sender, receiver)



}


function fullBalanceScan (person){
  const files = fs.readdirSync(folderPath);
    const currentBalance = 0;
    files.forEach((file) => {
      const filePath = `${folderPath}/${file}`;
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (fileContent.trim().length === 0) {
        return;
      }
      try {
        const jsonData = JSON.parse(fileContent);
        if (jsonData[person] === person) {
          currentBalance += jsonData.amount;
        }
      }
      catch (err) {
        console.error(`Error parsing JSON from file ${filePath}:`, err);
      }
    })
    return(currentBalance);
}

function balanceScanSender(currentBalance){
  fullBalanceScan (sender);

    const objectSender = { balance: currentBalance };
    const jsonSender = JSON.stringify(objectSender);
    fs.writeFileSync(balancePathReceiver, jsonSender);
}

function balanceScanReceiver(currentBalance){
  fullBalanceScan (receiver);

  const objectReceiver = { balance: currentBalance };
  const jsonReceiver = JSON.stringify(objectReceiver);
  fs.writeFileSync(balancePathReceiver, jsonReceiver);
}


function checkBalanceFiles(currentBalance) {

  if (!fs.existsSync(balancePathSender) || !fs.existsSync(balancePathReceiver)) {
    balanceScanSender(currentBalance);
    balanceScanReceiver(currentBalance);
  };

  if (!fs.existsSync(balancePathSender)){
    balanceScanSender(currentBalance);
  }

  if (!fs.existsSync(balancePathReceiver)) {
    balanceScanReceiver(currentBalance);
  }
}

function parseBalance(person) {
  if (typeof balance.person === 'underfined'){
    const balancePathPerson = `${balanceFolder}/user_${person}.json`;
    const personData = fs.readFileSync(balancePathPerson, 'utf8');
    const personBalanceData = JSON.parse(personData);
    balance[person] = personBalanceData.balance;
    //return (balance[person]);
  }
  else {
    return;
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

  const fileCount = countFilesInFolder(folderPath);
  const currentDate = new Date();
  const fileName = `id_${fileCount}.json`;
  const filePath = folderPath + fileName;
  const comission = Math.round(amount * 0.01);
  const total = amount + comission;


  if (balance.senderBalance < amount + comission) {
    console.log(`${sender}'s balance is too low. Current Balance ${balance.senderBalance}. Required amount ${total}`)
    return;
  }

  if (sender === receiver) {
    console.log(`Mr. ${sender}, you can not send tokens to yourself`)
    return;
  }

  else {
    const data = {
      id: fileCount,
      sender: sender,
      receiver: receiver,
      amount: amount,
      type: 'transfer',
      date: currentDate,
      comission: comission
    };

    const jsonData = JSON.stringify(data, null, 2);

    fs.writeFile(filePath, jsonData, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log(`Successful operation: ${amount} are sent from ${sender} to ${receiver}. Comission is ${comission}.`);
      }
    })

    balance[sender] -= total;
    balance[receiver] += amount;
  
}}




  function countBalance(sender, receiver){
    //const newSenderBalance = balance.senderBalance - total;
    //const newReceiverBalance = balance.receiverBalance + amount;
    const senderBalanceDataUpdate = JSON.parse(senderData);
    const receiverBalanceDataUpdate = JSON.parse(receiverData);
    senderBalanceDataUpdate.balance = balance[sender];
    receiverBalanceDataUpdate.balance = balance[receiver];
    const updatedSenderData = JSON.stringify(senderBalanceDataUpdate, null, 2);
    const updatedReceiverData = JSON.stringify(receiverBalanceDataUpdate, null, 2);

    fs.writeFile(balancePathSender, updatedSenderData, 'utf8', (error) => {
      if (error) {
        console.error('Error writing JSON file:', error);
        return;
      }
      console.log(`New user ${sender} balance = ${balance[sender]}`);
    });

    fs.writeFile(balancePathReceiver, updatedReceiverData, 'utf8', (error) => {
      if (error) {
        console.error('Error writing JSON file:', error);
        return;
      }
      console.log(`New user ${receiver} balance = ${balance[receiver]}`);
    });


  }
;



writingTrans(folderPath);