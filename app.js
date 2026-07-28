const express = require('express');
const https = require('https');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const fetch = require('node-fetch');
const zlib = require('zlib');

const app = express();
const port = process.env.PORT || 3000;
const sessionId = process.env.SESSIONID;
const qrzSessionKey = process.env.QRZ_SESSION_KEY;

app.use(express.static('public'));

// Results page route
app.get('/results', (req, res) => {
    res.sendFile(__dirname + '/public/results.html');
});

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

    const postData = `CallSign=${callSign}`;

    const options = {
        hostname: 'www.kiyiemniyeti.gov.tr',
        port: 443,
        path: '/ehizmetler/telsiz_cagri_isareti_sorgula',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://www.kiyiemniyeti.gov.tr',
            'Referer': 'https://www.kiyiemniyeti.gov.tr/ehizmetler/telsiz_cagri_isareti_sorgula',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15',
            'Cookie': `id=a3fWa; Language=2; TS013a0f54=011bb3ba6e65bf24ac4b50eeca5ab6d9e88cb06cd03e574547c428ac36ea2b0a5daca40725ad8b1701a7e858bad6c2cbf54d22a4599b133a0ca5537df28b52d32bc03694d118b8aca809e6c6f1149875f902890b865359ab35316e58c01fe3cb769509da8be20182223f69562094d42c1ff5615f09; ASP.NET_SessionId=${sessionId}`,
        },
        rejectUnauthorized: false,
    };

    const reqs = https.request(options, (response) => {
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

    reqs.write(postData);
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

// Generate all callsigns from TA2AA to TA2ZZ
function generateCallsignRange() {
    const callsigns = [];
    for (let i = 65; i <= 90; i++) { // A to Z
        for (let j = 65; j <= 90; j++) { // A to Z
            callsigns.push(`TA2${String.fromCharCode(i)}${String.fromCharCode(j)}`);
        }
    }
    return callsigns;
}

// Batch scan endpoint for TA2AA to TA2ZZ
app.get('/scan-ta2-range', async (req, res) => {
    const callsigns = generateCallsignRange();
    const results = {};
    let processed = 0;
    const total = callsigns.length;

    console.log(`Starting batch scan of ${total} callsigns from TA2AA to TA2ZZ`);

    // Add delay between requests to avoid overwhelming external services
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {
        for (const callsign of callsigns) {
            try {
                console.log(`Processing ${callsign} (${processed + 1}/${total})`);

                // Make individual requests to each service with delay
                const [qrzResponse, kegmResponse, tacbResponse] = await Promise.allSettled([
                    fetch(`http://localhost:${port}/qrz/${callsign}`).catch(e => ({ error: e.message })),
                    fetch(`http://localhost:${port}/kegm/${callsign}`).catch(e => ({ error: e.message })),
                    fetch(`http://localhost:${port}/tacb/${callsign}`).catch(e => ({ error: e.message }))
                ]);

                const result = {
                    callsign: callsign,
                    processed: true
                };

                // Process QRZ result
                if (qrzResponse.status === 'fulfilled' && qrzResponse.value.ok) {
                    result.qrz = await qrzResponse.value.json();
                } else {
                    result.qrz = { error: 'Failed to fetch' };
                }

                // Process KEGM result
                if (kegmResponse.status === 'fulfilled' && kegmResponse.value.ok) {
                    result.kegm = await kegmResponse.value.json();
                } else {
                    result.kegm = { error: 'Failed to fetch' };
                }

                // Process TA Callbook result
                if (tacbResponse.status === 'fulfilled' && tacbResponse.value.ok) {
                    result.tacb = await tacbResponse.value.json();
                } else {
                    result.tacb = { error: 'Failed to fetch' };
                }

                results[callsign] = result;
                processed++;

                // Send progress update every 10 callsigns
                if (processed % 10 === 0) {
                    console.log(`Progress: ${processed}/${total} (${Math.round(processed/total*100)}%)`);
                }

                // Add delay to avoid rate limiting (1 second between callsigns)
                await delay(1000);

            } catch (error) {
                console.error(`Error processing ${callsign}:`, error.message);
                results[callsign] = {
                    callsign: callsign,
                    error: error.message,
                    processed: false
                };
                processed++;
            }
        }

        console.log(`Batch scan completed. Processed ${processed} callsigns.`);

        // Return summary statistics and full results
        const summary = {
            total: total,
            processed: processed,
            timestamp: new Date().toISOString(),
            qrzFound: 0,
            kegmFound: 0,
            tacbFound: 0,
            anyFound: 0
        };

        // Count successful finds
        Object.values(results).forEach(result => {
            if (result.qrz && !result.qrz.error) summary.qrzFound++;
            if (result.kegm && !result.kegm.error) summary.kegmFound++;
            if (result.tacb && !result.tacb.error) summary.tacbFound++;
            if ((result.qrz && !result.qrz.error) ||
                (result.kegm && !result.kegm.error) ||
                (result.tacb && !result.tacb.error)) {
                summary.anyFound++;
            }
        });

        res.json({
            summary: summary,
            results: results
        });

    } catch (error) {
        console.error('Batch scan error:', error);
        res.status(500).json({
            error: 'Batch scan failed',
            message: error.message,
            processed: processed,
            total: total
        });
    }
});

// Test scan endpoint for first 10 callsigns only
app.get('/scan-test', async (req, res) => {
    const callsigns = generateCallsignRange().slice(0, 10); // Only first 10 for testing
    const results = {};
    let processed = 0;
    const total = callsigns.length;

    console.log(`Starting test scan of ${total} callsigns`);

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {
        for (const callsign of callsigns) {
            try {
                console.log(`Processing ${callsign} (${processed + 1}/${total})`);

                const [qrzResponse, kegmResponse, tacbResponse] = await Promise.allSettled([
                    fetch(`http://localhost:${port}/qrz/${callsign}`).catch(e => ({ error: e.message })),
                    fetch(`http://localhost:${port}/kegm/${callsign}`).catch(e => ({ error: e.message })),
                    fetch(`http://localhost:${port}/tacb/${callsign}`).catch(e => ({ error: e.message }))
                ]);

                const result = {
                    callsign: callsign,
                    processed: true
                };

                if (qrzResponse.status === 'fulfilled' && qrzResponse.value.ok) {
                    result.qrz = await qrzResponse.value.json();
                } else {
                    result.qrz = { error: 'Failed to fetch' };
                }

                if (kegmResponse.status === 'fulfilled' && kegmResponse.value.ok) {
                    result.kegm = await kegmResponse.value.json();
                } else {
                    result.kegm = { error: 'Failed to fetch' };
                }

                if (tacbResponse.status === 'fulfilled' && tacbResponse.value.ok) {
                    result.tacb = await tacbResponse.value.json();
                } else {
                    result.tacb = { error: 'Failed to fetch' };
                }

                results[callsign] = result;
                processed++;

                await delay(500); // Shorter delay for testing

            } catch (error) {
                console.error(`Error processing ${callsign}:`, error.message);
                results[callsign] = {
                    callsign: callsign,
                    error: error.message,
                    processed: false
                };
                processed++;
            }
        }

        console.log(`Test scan completed. Processed ${processed} callsigns.`);

        const summary = {
            total: total,
            processed: processed,
            timestamp: new Date().toISOString(),
            qrzFound: 0,
            kegmFound: 0,
            tacbFound: 0,
            anyFound: 0
        };

        Object.values(results).forEach(result => {
            if (result.qrz && !result.qrz.error) summary.qrzFound++;
            if (result.kegm && !result.kegm.error) summary.kegmFound++;
            if (result.tacb && !result.tacb.error) summary.tacbFound++;
            if ((result.qrz && !result.qrz.error) ||
                (result.kegm && !result.kegm.error) ||
                (result.tacb && !result.tacb.error)) {
                summary.anyFound++;
            }
        });

        res.json({
            summary: summary,
            results: results
        });

    } catch (error) {
        console.error('Test scan error:', error);
        res.status(500).json({
            error: 'Test scan failed',
            message: error.message,
            processed: processed,
            total: total
        });
    }
});

// Get scan status (for monitoring long-running scans)
app.get('/scan-status', (req, res) => {
    // This is a simple status endpoint - in a real implementation,
    // you might want to store scan progress in a database or memory
    res.json({
        status: 'ready',
        message: 'Ready to start new scan. Use /scan-ta2-range to begin.',
        estimatedTime: 'Approximately 26 minutes (676 callsigns × 2.3 seconds each)',
        testEndpoint: 'Use /scan-test to test with first 10 callsigns only'
    });
});

app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
});
