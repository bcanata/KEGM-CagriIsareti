const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');

// Configuration
const SESSION_ID = 'odlkj2qrjlptgl0a3ntcvvb3';
const TS_COOKIE = '011bb3ba6e65bf24ac4b50eeca5ab6d9e88cb06cd03e574547c428ac36ea2b0a5daca40725ad8b1701a7e858bad6c2cbf54d22a4599b133a0ca5537df28b52d32bc03694d118b8aca809e6c6f1149875f902890b865359ab35316e58c01fe3cb769509da8be20182223f69562094d42c1ff5615f09';
const DELAY_MS = 1000; // 1 second delay between requests

// Generate callsigns from TA2AA to TA2ZZ
function generateCallsigns() {
    const callsigns = [];
    for (let i = 65; i <= 90; i++) { // A to Z
        for (let j = 65; j <= 90; j++) { // A to Z
            callsigns.push(`TA2${String.fromCharCode(i)}${String.fromCharCode(j)}`);
        }
    }
    return callsigns;
}

// Query KEGM for a callsign
function queryKEGM(callsign) {
    return new Promise((resolve, reject) => {
        const postData = `CallSign=${callsign}`;

        const options = {
            hostname: 'www.kiyiemniyeti.gov.tr',
            port: 443,
            path: '/ehizmetler/telsiz_cagri_isareti_sorgula',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'Cookie': `id=a3fWa; Language=2; TS013a0f54=${TS_COOKIE}; ASP.NET_SessionId=${SESSION_ID}`,
            },
            rejectUnauthorized: false,
        };

        const req = https.request(options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const $ = cheerio.load(data);

                    // Check for redirect (not logged in)
                    const titleElement = $('title:contains("Object moved")');
                    if (titleElement.length > 0) {
                        resolve({ callsign, status: 'ERROR', message: 'Session expired' });
                        return;
                    }

                    // Get table data
                    const rowData = $('body > div.wrapper > div > section.content > div > div > div > div.box-body > div > table > tbody > tr')
                        .find('td')
                        .map((index, element) => $(element).text().trim())
                        .get();

                    if (rowData.length === 0) {
                        // Check for error div
                        const errorElement = $('body > div.wrapper > div > section.content > div > div > div > div.box-body > div > div');
                        if (errorElement.length > 0) {
                            resolve({ callsign, status: 'NOT_FOUND', message: 'Invalid callsign' });
                            return;
                        }
                    }

                    const statusText = rowData[3] || '';

                    if (statusText.includes('KULLANILABİLİR')) {
                        resolve({
                            callsign,
                            status: 'AVAILABLE',
                            message: statusText
                        });
                    } else if (statusText.includes('AKTİF DEĞİLDİR')) {
                        resolve({
                            callsign,
                            status: 'INACTIVE',
                            owner: rowData[1] || '',
                            trid: rowData[2] || '',
                            message: statusText
                        });
                    } else if (rowData.length >= 4) {
                        resolve({
                            callsign,
                            status: 'ACTIVE',
                            owner: rowData[1] || '',
                            trid: rowData[2] || '',
                            message: statusText,
                            validUntil: rowData[4] || ''
                        });
                    } else {
                        resolve({ callsign, status: 'UNKNOWN', message: 'Unknown response' });
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main function
async function main() {
    const callsigns = generateCallsigns();
    const results = [];
    const availableCallsigns = [];

    console.log(`Starting scan of ${callsigns.length} callsigns from TA2AA to TA2ZZ\n`);
    console.log('=' .repeat(80));

    for (let i = 0; i < callsigns.length; i++) {
        const callsign = callsigns[i];

        try {
            const result = await queryKEGM(callsign);
            results.push(result);

            // Print status
            const progress = `[${i + 1}/${callsigns.length}]`;

            if (result.status === 'AVAILABLE') {
                console.log(`${progress} ${callsign} - ✅ AVAILABLE`);
                availableCallsigns.push(callsign);
            } else if (result.status === 'ACTIVE') {
                console.log(`${progress} ${callsign} - 🔴 ACTIVE (${result.owner})`);
            } else if (result.status === 'INACTIVE') {
                console.log(`${progress} ${callsign} - ⏸️  INACTIVE`);
            } else if (result.status === 'ERROR') {
                console.log(`${progress} ${callsign} - ❌ ERROR: ${result.message}`);
                console.log('\n⚠️  Session expired! Please update SESSION_ID in the script.\n');
                break;
            } else {
                console.log(`${progress} ${callsign} - ❓ ${result.status}`);
            }

            // Progress indicator every 26 callsigns (one letter group)
            if ((i + 1) % 26 === 0) {
                console.log('-'.repeat(80));
                console.log(`Progress: ${Math.round((i + 1) / callsigns.length * 100)}% complete`);
                console.log(`Available so far: ${availableCallsigns.length}`);
                console.log('-'.repeat(80));
            }

            // Delay between requests
            if (i < callsigns.length - 1) {
                await delay(DELAY_MS);
            }

        } catch (error) {
            console.log(`[${i + 1}/${callsigns.length}] ${callsign} - ❌ ERROR: ${error.message}`);
            results.push({ callsign, status: 'ERROR', message: error.message });
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('SCAN COMPLETE');
    console.log('='.repeat(80));

    // Summary
    const summary = {
        total: callsigns.length,
        available: results.filter(r => r.status === 'AVAILABLE').length,
        active: results.filter(r => r.status === 'ACTIVE').length,
        inactive: results.filter(r => r.status === 'INACTIVE').length,
        errors: results.filter(r => r.status === 'ERROR').length,
    };

    console.log(`\nTotal scanned: ${summary.total}`);
    console.log(`✅ Available: ${summary.available}`);
    console.log(`🔴 Active: ${summary.active}`);
    console.log(`⏸️  Inactive: ${summary.inactive}`);
    console.log(`❌ Errors: ${summary.errors}`);

    if (availableCallsigns.length > 0) {
        console.log('\n' + '='.repeat(80));
        console.log('AVAILABLE CALLSIGNS:');
        console.log('='.repeat(80));
        availableCallsigns.forEach(cs => console.log(`  ${cs}`));
    }

    // Save results to JSON file
    const outputFile = 'ta2-scan-results.json';
    fs.writeFileSync(outputFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary,
        availableCallsigns,
        results
    }, null, 2));

    console.log(`\nResults saved to: ${outputFile}`);
}

// Run the scan
main().catch(console.error);
