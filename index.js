const fs = require('fs');
const { getRandomSender, getRandomReceiver, getRandomAmount } = require('./generator.js');


const folderPath = 'C:/Users/дмитрий/Desktop/transactions/archive/';
const balanceSheet = {};



function writingTrans(folderPath) {
    const fileCount = countFilesInFolder(folderPath);
    const otpravitel = getRandomSender();
    const prinimatel = getRandomReceiver();
    const kolvo = getRandomAmount();
    const currentDate = new Date();
    const fileName = `id_${fileCount}.json`;
    const filePath = folderPath + fileName;

    const data = {
        id: fileCount,
        sender: otpravitel,
        receiver: prinimatel,
        amount: kolvo,
        type: 'transfer',
        date: currentDate
    };

    const jsonData = JSON.stringify(data, null, 2);

    fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
        } else {
          console.log(`Data written to ${filePath} successfully.`);
        }
      });

};

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
                }
              } catch (err) {
                console.error(`Error parsing JSON from file ${filePath}:`, err);
              }
            });

        
        balanceSheet[i] = currentBalance;
    }
    console.log(balanceSheet);
        
}

countBalance();
writingTrans(folderPath);
