const express = require('express');
const https = require('https');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;
const sessionId = process.env.SESSIONID;
const qrzSessionKey = process.env.QRZ_SESSION_KEY;

app.use(express.static('public'));

app.get('/qrz/:CallSign', async (req, res) => {
    const callSign = req.params.CallSign;
    let jsonData = {};
  
    if (qrzSessionKey) {
      const qrzUrl = `https://xmldata.qrz.com/xml/current/?s=${qrzSessionKey};callsign=${callSign}`;
  
      https.get(qrzUrl, (qrzResponse) => {
        let qrzData = '';
        qrzResponse.on('data', (qrzChunk) => {
          qrzData += qrzChunk;
        });
  
        qrzResponse.on('end', () => {
          xml2js.parseString(qrzData, (err, qrzJson) => {
            if (err) {
              console.error('QRZ.com XML verisi alınamadı:', err);
              res.status(500).send('Internal Server Error');
              return;
            }
  
            const errorElement = qrzJson.QRZDatabase.Session[0].Error;
            if (errorElement) {
              const errorMessage = errorElement[0];
              res.status(200).json({ error: errorMessage });
              return;
            }
  
            const qrzcomData = qrzJson.QRZDatabase.Callsign[0];
            const formattedQrzcomData = {};
  
            for (const key in qrzcomData) {
              if (Array.isArray(qrzcomData[key])) {
                formattedQrzcomData[key] = qrzcomData[key][0];
              }
            }
  
            jsonData = formattedQrzcomData;
  
            res.json(jsonData);
          });
        });
      });
    }
  });
  

app.get('/kegm/:CallSign', async (req, res) => {
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
            console.log(data);
            const titleElement = $('title:contains("Object moved")');
            if (titleElement.length > 0) {
                res.status(200).json({ error: 'KEGM girişi yapılmadı' });
                return;
            }
            
            const errorElement = $('body > div.wrapper > div > section.content > div > div > div > div.box-body > div > div');
            
            if (errorElement.length > 0) {
                res.status(200).json({ error: 'Yanlış çağrı işareti' });
                return;
            }
            
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

app.get('/tacb/:CallSign', async (req, res) => {
    const callSign = req.params.CallSign;
    
    const url = `http://www.tacallbook.org/cgi-bin/bul2d.cgi?ara=${callSign}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "upgrade-insecure-requests": "1",
                "Referer": `http://www.tacallbook.org/cgi-bin/bul1.cgi?ara=${callSign}`,
                "Referrer-Policy": "strict-origin-when-cross-origin",
            },
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder("iso-8859-9");
        const textData = decoder.decode(buffer);
        
        const $ = cheerio.load(textData);
        
        const callsign = $("body > center:nth-child(2) > table > tbody > tr > td:nth-child(1) > font:first-of-type").contents().filter(function() {
            return this.nodeType === 3;
        }).text().trim();
        const fname = $("body > center:nth-child(2) > table > tbody > tr > td:nth-child(1) > font > font").text();
        const email = $("body > center:nth-child(2) > table > tbody > tr > td:nth-child(2) > font:nth-child(22) > a").text().trim();
        const address = $("body > center:nth-child(2) > table > tbody > tr > td:nth-child(2) > font:nth-child(2), body > center:nth-child(2) > table > tbody > tr > td:nth-child(2) > font:nth-child(5)").text().trim();
        const phone = $("body > center:nth-child(2) > table > tbody > tr > td:nth-child(2) > font:nth-child(18)").text().trim();
        const site = $("body > center:nth-child(2) > table > tbody > tr > td:nth-child(2) > font:nth-child(25) > a").text().trim();
        //const icq = $("body > center:nth-child(2) > table > tbody > tr:nth-child(7) > td").text().trim();

        if (callsign.length === 0) {
            res.status(200).json({ error: 'Çağrı işareti bulunamadı' });
            return;
        }
        console.log(callsign.length);
        const result = {
            callsign: callsign,
            fname: fname,
            phone: phone,
            email: email,
            address: address,
            site: site,
            //icq: icq,
        };
        
        res.json(result);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/toplu/:CallSign', async (req, res) => {
    const callSign = req.params.CallSign;
    const combinedData = {};
    
    try {
        const qrzResponse = await fetch(`http://localhost:${port}/qrz/${callSign}`);
        if (!qrzResponse.ok) {
            throw new Error('QRZ Data Fetch Failed');
        }
        const qrzData = await qrzResponse.json();
        combinedData.qrz = qrzData;
        
        const kegmResponse = await fetch(`http://localhost:${port}/kegm/${callSign}`);
        if (!kegmResponse.ok) {
            throw new Error('KEGM Data Fetch Failed');
        }
        const kegmData = await kegmResponse.json();
        combinedData.kegm = kegmData;
        
        const tacbResponse = await fetch(`http://localhost:${port}/tacb/${callSign}`);
        if (!tacbResponse.ok) {
            throw new Error('TACB Data Fetch Failed');
        }
        const tacbData = await tacbResponse.json();
        combinedData.tacb = tacbData;
        
        res.json(combinedData);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
});
