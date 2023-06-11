const fs = require('fs');
const { getRandomSender, getRandomReceiver, getRandomAmount } = require('./generator.js');

const folderPath = './archive/';
const balanceFolder = './balances';

const balance = {};
let fileCount = countFilesInFolder(folderPath);

function generateRandom() {
  const sender = getRandomSender();
  const receiver = getRandomReceiver();
  const amount = getRandomAmount();
  const balancePathSender = `${balanceFolder}/user_${sender}.json`;
  const balancePathReceiver = `${balanceFolder}/user_${receiver}.json`;
  const senderData = fs.readFileSync(balancePathSender, 'utf8');
  const receiverData = fs.readFileSync(balancePathReceiver, 'utf8');
  const currentDate = new Date();
  const fileName = `id_${fileCount}.json`;
  const filePath = folderPath + fileName;
  const comission = Math.round(amount * 0.01);
  const total = amount + comission;

  if (!fs.existsSync(balancePathSender) || !fs.existsSync(balancePathReceiver)) {
    fullBalanceScan(sender);
    fullBalanceScan(receiver);
  }

  if (!fs.existsSync(balancePathSender)){
    fullBalanceScan(sender);
  }

  if (!fs.existsSync(balancePathReceiver)) {
    fullBalanceScan(receiver);
  }

  parseBalance(sender);
  parseBalance(receiver);
  writingTrans(sender, receiver, amount, comission, currentDate, filePath, total);
  return [sender, receiver];
}

function fullBalanceScan(person){
  const files = fs.readdirSync(folderPath);
  let currentBalance = 0;

  files.forEach((file) => {
    const filePathBalance = `${folderPath}/${file}`;
    const fileContent = fs.readFileSync(filePathBalance, 'utf8');
    
    if (fileContent.trim().length === 0) {
      return;
    }
    
    try {
      const jsonData = JSON.parse(fileContent);
      
      if (jsonData.sender === person) {
        currentBalance -= jsonData.amount;
        currentBalance -= jsonData.comission;
      }
      
      if (jsonData.receiver === person) {
        currentBalance += jsonData.amount;
      }
    }
    catch (err) {
      console.error(`Error parsing JSON from file ${filePathBalance}:`, err);
    }
  });

  balance[person] = currentBalance;
}

function parseBalance(person) {
  if (typeof balance[person] === 'undefined'){
    const balancePathPerson = `${balanceFolder}/user_${person}.json`;
    const personData = fs.readFileSync(balancePathPerson, 'utf8');
    const personBalanceData = JSON.parse(personData);
    balance[person] = personBalanceData.balance;
  }
  else {
    return;
  }
}

function countFilesInFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    return files.length;
  } catch (err) {
    console.error('Error reading folder:', err);
    return null;
  }
}

function writingTrans(sender, receiver, amount, comission, currentDate, filePath, total){
  if (balance[sender] < total) {
    console.log(`${sender}'s balance is too low. Current Balance: ${balance[sender]}. Required amount: ${total}`);
    return;
  }

  if (sender === receiver) {
    console.log(`Mr. ${sender}, you cannot send tokens to yourself.`);
    return;
  }

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

  fs.writeFile(filePath, jsonData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log(`Successful operation: ${amount} sent from ${sender} to ${receiver}. Comission is ${comission}.`);
    }
  });

  balance[sender] -= total;
  balance[receiver] += amount;
  fileCount++;
}

function saveBalance(){
  Object.keys(balance).forEach(key => {
    //console.log(key)
    
    const balancePathPersonUpdate = `${balanceFolder}/user_${key}.json`;
    const personBalanceDataUpdate = { balance: balance[key] };
    const updatedPersonData = JSON.stringify(personBalanceDataUpdate, null, 2);

    fs.writeFile(balancePathPersonUpdate, updatedPersonData, 'utf8', (error) => {
      if (error) {
        console.error('Error writing JSON file:', error);
        return;
      }
      console.log(`New user ${key} balance = ${balance[key]}`);
    });
  });
}


const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


rl.question('Enter the number of times to generate a transaction: ', (answer) => {
  const numberOfTimes = parseInt(answer);
  if (!isNaN(numberOfTimes)) {
    for (let i = 0; i < numberOfTimes; i++) {
      generateRandom();
    }
  } else {
    console.log('Please enter a number.');
  }
  rl.close();
});


saveBalance();
