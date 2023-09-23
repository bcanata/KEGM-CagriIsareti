const express = require('express');
const https = require('https');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;
const sessionId = process.env.SESSIONID

app.get('/qrz/:CallSign', async (req, res) => {
  const callSign = req.params.CallSign;

  const url = `https://www.kiyiemniyeti.gov.tr/ehizmetler/telsiz_cagri_isareti_sorgula?CallSign=${callSign}`;

  const options = {
    headers: {
      cookie: `ASP.NET_SessionId=${sessionId};`,
    },
    rejectUnauthorized: false,
  };

  const reqs = https.get(url, options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      const $ = cheerio.load(data);

      const rowData = $('body > div.wrapper > div > section.content > div > div > div > div.box-body > div > table > tbody > tr')
        .find('td')
        .map((index, element) => $(element).text())
        .get();

      const statusText = rowData[3];
      const isStatusAvailable = statusText === "BU ÇAĞRI İŞARETİ KULLANILABİLİR. BU ÇAĞRI İŞARETİNİ E-ÇAĞRI İŞARETİ ALMA SAYFASINDAN ALABİLİRSİNİZ.";
      const isStatusPassive = statusText === "ÇAĞRI İŞARETİ AKTİF DEĞİLDİR. BU ÇAĞRI İŞARETİ TERCİH İÇİN UYGUN DEĞİLDİR.";
      
      let jsonData;
      if (isStatusAvailable) {
        jsonData = {
          callsign: rowData[0],
          assigned: false,
          active: false,
        };
      }
      else if (isStatusPassive) {
        jsonData = {
          callsign: rowData[0],
          assigned: true, 
          name: rowData[1],
          trid: rowData[2],
          status: statusText,
          active: false,
          activeUntil: rowData[4],
        };
      } else {
        jsonData = {
          callsign: rowData[0],
          assigned: true, 
          name: rowData[1],
          trid: rowData[2],
          status: statusText,
          active: true,
          activeUntil: rowData[4],
        };
      }
      res.json(jsonData);
    });
  });

  reqs.on('error', (error) => {
    console.error('İstek gönderirken bir sorun oluştu:', error);
    res.status(500).send('Internal Server Error');
  });

  reqs.end();
});

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
