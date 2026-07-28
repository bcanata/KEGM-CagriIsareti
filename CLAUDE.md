# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turkish-language web application called "Çağrı İşareti Sorgulama" (Callsign Query Service) that provides a unified interface for querying callsign information from three different sources:
- **KEGM**: Turkish Coast Guard General Directorate (Kıyı Emniyeti Genel Müdürlüğü)
- **QRZ.com**: International callsign database
- **TA Callbook**: Turkish amateur radio callsign database

## Development Commands

### Start the application
```bash
npm start
```
This starts the Express.js server with nodemon and dotenv configuration.

### Install dependencies
```bash
npm install
```

## Architecture

### Backend Structure
- **Single file architecture**: `app.js` contains the entire Express.js application
- **Four main API endpoints**:
  - `/kegm/:CallSign` - Turkish Coast Guard callsign query
  - `/qrz/:CallSign` - QRZ.com API integration
  - `/tacb/:CallSign` - Turkish amateur radio callbook query
  - `/toplu/:CallSign` - Combined query from all three sources

### Frontend Structure
- **Single page**: `public/index.html` - Bootstrap 5 based interface
- **No build process**: Direct HTML/JavaScript, no bundling or compilation

### Key Dependencies
- **Express.js**: Web framework
- **Cheerio**: HTML parsing for web scraping
- **xml2js**: XML parsing for QRZ.com API
- **node-fetch**: HTTP client for external requests
- **dotenv**: Environment variable management

## Authentication Requirements

The application requires manual session setup:

### KEGM (Turkish Coast Guard)
1. Login to https://www.kiyiemniyeti.gov.tr/ehizmetler/telsiz_cagri_isareti_sorgula
2. Extract `ASP.NET_SessionId` cookie from browser dev tools
3. Set as `SESSIONID` environment variable

### QRZ.com
1. Generate session key via: `https://xmldata.qrz.com/xml/current/?username=USERNAME;password=PASSWORD;agent=q5.0`
2. Extract `<Key>` value from XML response
3. Set as `QRZ_SESSION_KEY` environment variable

Both sessions expire periodically and require manual renewal.

## Environment Configuration

Copy `.env.sample` to `.env` and configure:
- `SESSIONID`: KEGM session cookie
- `QRZ_SESSION_KEY`: QRZ.com API session key
- `PORT`: Server port (defaults to 3000)

## API Endpoints

### Individual Queries
- `GET /kegm/:CallSign` - Returns Turkish Coast Guard data
- `GET /qrz/:CallSign` - Returns QRZ.com data
- `GET /tacb/:CallSign` - Returns Turkish callbook data

### Combined Query
- `GET /toplu/:CallSign` - Returns aggregated data from all three sources

### Frontend Interface
- `GET /` - Web interface for manual queries

## Docker Support

The application is containerized and available on Docker Hub:
```bash
docker run -p 3000:3000 -d \
  -e SESSIONID=[KEGM Session ID] \
  -e QRZ_SESSION_KEY=[QRZ Session Key] \
  bcanata/callsign-search:0.0.2
```

## Character Encoding

The Turkish callbook integration uses ISO-8859-9 encoding for proper Turkish character support.

## Error Handling

Each endpoint includes comprehensive error handling for:
- Network failures
- Authentication errors
- Malformed responses
- Session expiration

## Development Notes

- This is a monolithic application with no database layer
- All data comes from external sources via web scraping or API calls
- The application is specifically designed for Turkish maritime and amateur radio communities
- No automated tests are present in the current codebase
- No linting or build tools are configured