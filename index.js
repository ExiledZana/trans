const fs = require('fs');
const { getRandomSender, getRandomReceiver, getRandomAmount } = require('./generator.js');


const folderPath = './archive/';
const balanceSheet = {};



function writingTrans(folderPath) {
    countBalance();
    const fileCount = countFilesInFolder(folderPath);
    const otpravitel = getRandomSender();
    const prinimatel = getRandomReceiver();
    const kolvo = getRandomAmount();
    const currentDate = new Date();
    const fileName = `id_${fileCount}.json`;
    const filePath = folderPath + fileName;
    const komissia = Math.round(kolvo*0.01);
    const total = kolvo + komissia;

    if (balanceSheet[otpravitel] < kolvo + komissia){
      console.log(`${otpravitel}'s balance is too low. Current Balance ${balanceSheet[otpravitel]}. Required amount ${total}`)
      return;
    }

    if (otpravitel === prinimatel){
      console.log(`Mr. ${otpravitel}You can not send tokens to yourself`)
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
          console.log(balanceSheet);
        }
      });

}};

function countFilesInFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    let fileCount = 0;

    for (const file of files) {
      const filePath = `${folderPath}/${file}`;
      const fileStats = fs.statSync(filePath);

      if (fileStats.isFile()) {
        fileCount++;
      }
    }

    return fileCount;
  } catch (err) {
    console.error('Error:', err);
    return -1;
  }
}

function countBalance() {
    const files = fs.readdirSync(folderPath);
    for (let i = 0; i < 11; i++){
        let currentBalance = 0;
        files.forEach((file) => {
            const filePath = `${folderPath}/${file}`;
            const fileContent = fs.readFileSync(filePath, 'utf8');
            if (fileContent.trim().length === 0) {
                return;
              }
              try {
                const jsonData = JSON.parse(fileContent);
                if (jsonData.receiver === i) {
                  currentBalance += jsonData.amount;
                }
                if (jsonData.sender === i) {
                  currentBalance -= jsonData.amount;
                  if (jsonData.hasOwnProperty("comission")){
                  currentBalance -= jsonData.comission;}
                }
              } catch (err) {
                console.error(`Error parsing JSON from file ${filePath}:`, err);
              }
            });

        
        balanceSheet[i] = currentBalance;
    }
    return balanceSheet;
        
}

//countBalance();
writingTrans(folderPath)
