const fs = require('fs');

// Read the complete JSON data
const jsonData = JSON.parse(fs.readFileSync('response.json', 'utf8'));

// Create the complete HTML file
const htmlTemplate = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TA2 Çağrı İşareti Veritabanı (TA2AA - TA2ZZ) - Tam Veri</title>
    <style>
        :root {
            --primary-color: #2c3e50;
            --success-color: #27ae60;
            --warning-color: #f39c12;
            --danger-color: #e74c3c;
            --info-color: #3498db;
            --light-bg: #ecf0f1;
            --border-color: #bdc3c7;
        }

        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
        }

        .main-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            margin: 20px auto;
            max-width: 1400px;
            backdrop-filter: blur(10px);
        }

        .header-section {
            background: linear-gradient(135deg, var(--primary-color), #34495e);
            color: white;
            padding: 30px;
            border-radius: 15px 15px 0 0;
            text-align: center;
        }

        .stats-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            border-left: 4px solid var(--info-color);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stats-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .stats-card.success { border-left-color: var(--success-color); }
        .stats-card.warning { border-left-color: var(--warning-color); }
        .stats-card.danger { border-left-color: var(--danger-color); }
        .stats-card.primary { border-left-color: var(--primary-color); }

        .search-section {
            background: var(--light-bg);
            padding: 25px;
            border-radius: 10px;
            margin: 20px 0;
        }

        .callsign-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            border-left: 5px solid var(--border-color);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .callsign-card.available {
            border-left-color: var(--success-color);
            background: linear-gradient(135deg, #ffffff, #f0fff4);
        }

        .callsign-card.unavailable {
            border-left-color: var(--warning-color);
            background: linear-gradient(135deg, #ffffff, #fffaf0);
        }

        .callsign-card.not-found {
            border-left-color: var(--danger-color);
            background: linear-gradient(135deg, #ffffff, #fff5f5);
        }

        .callsign-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .callsign-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--light-bg);
        }

        .callsign-number {
            font-size: 24px;
            font-weight: bold;
            color: var(--primary-color);
        }

        .status-badge {
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-badge.active {
            background: var(--success-color);
            color: white;
        }

        .status-badge.inactive {
            background: var(--warning-color);
            color: white;
        }

        .status-badge.not-found {
            background: var(--danger-color);
            color: white;
        }

        .data-source {
            margin: 10px 0;
            padding: 15px;
            background: var(--light-bg);
            border-radius: 8px;
            border-left: 3px solid var(--info-color);
        }

        .data-source h6 {
            color: var(--primary-color);
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .data-source .data-item {
            margin: 5px 0;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .filter-btn {
            margin: 5px;
            padding: 10px 20px;
            border: 2px solid var(--border-color);
            background: white;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .filter-btn:hover {
            background: var(--light-bg);
        }

        .filter-btn.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }

        .availability-indicator {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        .availability-indicator.available {
            background: var(--success-color);
        }

        .availability-indicator.unavailable {
            background: var(--warning-color);
        }

        .availability-indicator.not-found {
            background: var(--danger-color);
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }

        .loading-spinner {
            display: none;
            text-align: center;
            padding: 50px;
        }

        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left: 4px solid var(--primary-color);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .pagination-container {
            display: flex;
            justify-content: center;
            margin: 30px 0;
        }

        .pagination {
            display: flex;
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .pagination li {
            margin: 0 5px;
        }

        .pagination a {
            display: block;
            padding: 10px 15px;
            text-decoration: none;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            color: var(--primary-color);
            transition: all 0.3s ease;
        }

        .pagination a:hover {
            background: var(--light-bg);
        }

        .pagination .active a {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }

        .pagination .disabled a {
            color: #ccc;
            pointer-events: none;
        }

        .export-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 1000;
        }

        .export-btn:hover {
            background: var(--info-color);
            transform: scale(1.1);
        }

        .progress {
            height: 8px;
            background: var(--light-bg);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .progress-bar {
            height: 100%;
            background: var(--info-color);
            transition: width 0.3s ease;
        }

        .progress-bar.success { background: var(--success-color); }
        .progress-bar.warning { background: var(--warning-color); }

        .row {
            display: flex;
            flex-wrap: wrap;
            margin: -10px;
        }

        .col-md-3, .col-md-4, .col-md-6 {
            padding: 10px;
            flex: 1;
        }

        .col-md-3 { max-width: 25%; }
        .col-md-4 { max-width: 33.333%; }
        .col-md-6 { max-width: 50%; }

        @media (max-width: 768px) {
            .col-md-3, .col-md-4, .col-md-6 {
                max-width: 100%;
            }
        }

        .badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            margin-right: 5px;
        }

        .badge-success { background: var(--success-color); color: white; }
        .badge-warning { background: var(--warning-color); color: white; }
        .badge-info { background: var(--info-color); color: white; }
    </style>
</head>
<body>
    <div class="main-container">
        <!-- Header -->
        <div class="header-section">
            <h1>📡 TA2 Çağrı İşareti Veritabanı</h1>
            <p style="font-size: 1.2em; margin: 10px 0;">Tüm TA2AA - TA2ZZ çağrı işaretlerinin kapsamlı analizi</p>
            <p style="font-size: 0.9em; opacity: 0.8;">🕒 Son güncelleme: <span id="lastUpdate"></span></p>
        </div>

        <!-- Main Content -->
        <div style="padding: 20px;">
            <!-- Statistics Section -->
            <div class="row" style="margin-bottom: 30px;">
                <div class="col-md-3">
                    <div class="stats-card primary">
                        <h5>📋 Toplam Çağrı İşareti</h5>
                        <h2 id="totalCallsigns">-</h2>
                        <p style="margin: 0; font-size: 0.9em; color: #666;">TA2AA - TA2ZZ</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card success">
                        <h5>✅ Aktif</h5>
                        <h2 id="activeCount">-</h2>
                        <p style="margin: 0; font-size: 0.9em; color: #666;">Kullanımda olanlar</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card warning">
                        <h5>⏸️ Pasif</h5>
                        <h2 id="inactiveCount">-</h2>
                        <p style="margin: 0; font-size: 0.9em; color: #666;">Kullanım dışı olanlar</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card danger">
                        <h5>❌ Mevcut Değil</h5>
                        <h2 id="notFoundCount">-</h2>
                        <p style="margin: 0; font-size: 0.9em; color: #666;">Kayıtlı olmayanlar</p>
                    </div>
                </div>
            </div>

            <!-- Source Statistics -->
            <div class="row" style="margin-bottom: 30px;">
                <div class="col-md-4">
                    <div class="stats-card">
                        <h6>🌐 QRZ.com</h6>
                        <div class="progress">
                            <div id="qrzProgress" class="progress-bar" style="width: 0%"></div>
                        </div>
                        <span id="qrzFound">-</span> / <span id="totalCalls">-</span> bulunan
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stats-card">
                        <h6>🛡️ KEGM</h6>
                        <div class="progress">
                            <div id="kegmProgress" class="progress-bar success" style="width: 0%"></div>
                        </div>
                        <span id="kegmFound">-</span> / <span id="totalKegm">-</span> bulunan
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stats-card">
                        <h6>📚 TA Callbook</h6>
                        <div class="progress">
                            <div id="tacbProgress" class="progress-bar warning" style="width: 0%"></div>
                        </div>
                        <span id="tacbFound">-</span> / <span id="totalTacb">-</span> bulunan
                    </div>
                </div>
            </div>

            <!-- Search and Filter Section -->
            <div class="search-section">
                <div class="row">
                    <div class="col-md-6" style="margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 8px; padding: 10px;">
                            <span style="padding: 0 10px;">🔍</span>
                            <input type="text" id="searchInput" placeholder="Çağrı işareti veya isim ile arayın..."
                                   style="border: none; outline: none; flex: 1; font-size: 16px;">
                        </div>
                    </div>
                    <div class="col-md-6" style="margin-bottom: 15px;">
                        <select id="sortSelect" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;">
                            <option value="callsign">Çağrı İşareti (A-Z)</option>
                            <option value="callsign-desc">Çağrı İşareti (Z-A)</option>
                            <option value="status">Duruma Göre</option>
                            <option value="available">Mevcut Olanlar</option>
                        </select>
                    </div>
                </div>

                <!-- Filter Buttons -->
                <div style="text-align: center; margin-top: 20px;">
                    <button class="filter-btn active" onclick="filterData('all')">
                        📊 Tümü (<span id="allCount">-</span>)
                    </button>
                    <button class="filter-btn" onclick="filterData('available')">
                        ✅ Mevcut (<span id="availableFilterCount">-</span>)
                    </button>
                    <button class="filter-btn" onclick="filterData('unavailable')">
                        ⏸️ Pasif (<span id="unavailableFilterCount">-</span>)
                    </button>
                    <button class="filter-btn" onclick="filterData('not-found')">
                        ❌ Bulunamadı (<span id="notFoundFilterCount">-</span>)
                    </button>
                    <button class="filter-btn" onclick="filterData('qrz-only')">
                        🌐 Sadece QRZ
                    </button>
                    <button class="filter-btn" onclick="filterData('kegm-only')">
                        🛡️ Sadece KEGM
                    </button>
                    <button class="filter-btn" onclick="filterData('tacb-only')">
                        📚 Sadece TA Callbook
                    </button>
                </div>
            </div>

            <!-- Results Container -->
            <div id="resultsContainer"></div>

            <!-- Pagination -->
            <div class="pagination-container">
                <ul class="pagination" id="pagination"></ul>
            </div>
        </div>
    </div>

    <!-- Export Button -->
    <button class="export-btn" onclick="exportToCSV()" title="CSV olarak dışa aktar">
        💾
    </button>

    <script>
        // Embedded complete callsign database
        const callsignDatabase = ${JSON.stringify(jsonData, null, 2)};

        // Application logic
        let callsignData = [];
        let filteredData = [];
        let currentPage = 1;
        const itemsPerPage = 20;
        let currentFilter = 'all';

        // Initialize the application
        function initializeApp() {
            // Convert data to array format
            callsignData = Object.entries(callsignDatabase.results).map(([callsign, info]) => ({
                callsign,
                ...info,
                status: determineStatus(info),
                availability: determineAvailability(info)
            }));

            filteredData = [...callsignData];

            updateStatistics(callsignDatabase.summary);
            displayResults();
        }

        function determineStatus(info) {
            if (info.kegm && info.kegm.assigned !== false) {
                if (info.kegm.active === true) {
                    return 'active';
                } else if (info.kegm.error === 'Yanlış çağrı işareti') {
                    return 'not-found';
                } else {
                    return 'inactive';
                }
            }
            return 'not-found';
        }

        function determineAvailability(info) {
            const kegmStatus = determineStatus(info);
            if (kegmStatus === 'active') return 'available';
            if (kegmStatus === 'inactive') return 'unavailable';
            return 'not-found';
        }

        function updateStatistics(summary) {
            document.getElementById('lastUpdate').textContent = new Date(summary.timestamp).toLocaleString('tr-TR');
            document.getElementById('totalCallsigns').textContent = summary.total.toLocaleString('tr-TR');

            const stats = {
                active: 0,
                inactive: 0,
                notFound: 0
            };

            callsignData.forEach(item => {
                stats[item.status]++;
            });

            document.getElementById('activeCount').textContent = stats.active.toLocaleString('tr-TR');
            document.getElementById('inactiveCount').textContent = stats.inactive.toLocaleString('tr-TR');
            document.getElementById('notFoundCount').textContent = stats.notFound.toLocaleString('tr-TR');

            // Update source statistics
            document.getElementById('qrzFound').textContent = summary.qrzFound.toLocaleString('tr-TR');
            document.getElementById('kegmFound').textContent = summary.kegmFound.toLocaleString('tr-TR');
            document.getElementById('tacbFound').textContent = summary.tacbFound.toLocaleString('tr-TR');
            document.getElementById('totalCalls').textContent = summary.total.toLocaleString('tr-TR');
            document.getElementById('totalKegm').textContent = summary.total.toLocaleString('tr-TR');
            document.getElementById('totalTacb').textContent = summary.total.toLocaleString('tr-TR');

            // Update progress bars
            document.getElementById('qrzProgress').style.width = \`\${(summary.qrzFound / summary.total) * 100}%\`;
            document.getElementById('kegmProgress').style.width = \`\${(summary.kegmFound / summary.total) * 100}%\`;
            document.getElementById('tacbProgress').style.width = \`\${(summary.tacbFound / summary.total) * 100}%\`;

            // Update filter counts
            const filterCounts = {
                all: callsignData.length,
                available: callsignData.filter(item => item.availability === 'available').length,
                unavailable: callsignData.filter(item => item.availability === 'unavailable').length,
                'not-found': callsignData.filter(item => item.availability === 'not-found').length
            };

            document.getElementById('allCount').textContent = filterCounts.all.toLocaleString('tr-TR');
            document.getElementById('availableFilterCount').textContent = filterCounts.available.toLocaleString('tr-TR');
            document.getElementById('unavailableFilterCount').textContent = filterCounts.unavailable.toLocaleString('tr-TR');
            document.getElementById('notFoundFilterCount').textContent = filterCounts['not-found'].toLocaleString('tr-TR');
        }

        function displayResults() {
            const container = document.getElementById('resultsContainer');
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageData = filteredData.slice(start, end);

            container.innerHTML = pageData.map(item => createCallsignCard(item)).join('');

            updatePagination();
        }

        function createCallsignCard(item) {
            const statusClass = item.availability;
            const statusBadgeClass = {
                'active': 'active',
                'inactive': 'inactive',
                'not-found': 'not-found'
            }[item.status];

            const statusBadgeText = {
                'active': 'AKTİF',
                'inactive': 'PASİF',
                'not-found': 'YOK'
            }[item.status];

            return \`
                <div class="callsign-card \${statusClass}" data-status="\${item.status}">
                    <div class="availability-indicator \${statusClass}"></div>

                    <div class="callsign-header">
                        <div>
                            <span class="callsign-number">\${item.callsign}</span>
                            <span class="status-badge \${statusBadgeClass}">\${statusBadgeText}</span>
                        </div>
                        <div>
                            <span class="badge badge-success me-1">
                                \${item.qrz && !item.qrz.error ? '✅' : '❌'} QRZ
                            </span>
                            <span class="badge badge-info me-1">
                                \${item.kegm && !item.kegm.error ? '✅' : '❌'} KEGM
                            </span>
                            <span class="badge badge-warning">
                                \${item.tacb && !item.tacb.error ? '✅' : '❌'} TACB
                            </span>
                        </div>
                    </div>

                    \${item.qrz && !item.qrz.error ? \`
                    <div class="data-source">
                        <h6>🌐 QRZ.com</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="data-item">
                                    👤 <strong>Ad:</strong> \${item.qrz.fname || '-'} \${item.qrz.name || '-'}
                                </div>
                                <div class="data-item">
                                    📍 <strong>Konum:</strong> \${item.qrz.addr2 || '-'}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="data-item">
                                    🏳️ <strong>Ülke:</strong> \${item.qrz.country || '-'}
                                </div>
                                \${item.qrz.state ? \`
                                <div class="data-item">
                                    🗺️ <strong>Eyalet:</strong> \${item.qrz.state}
                                </div>
                                \` : ''}
                            </div>
                        </div>
                    </div>
                    \` : ''}

                    \${item.kegm && !item.kegm.error ? \`
                    <div class="data-source">
                        <h6>🛡️ Kıyı Emniyeti Genel Müdürlüğü (KEGM)</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="data-item">
                                    🆔 <strong>TCKN:</strong> \${item.kegm.trid || '-'}
                                </div>
                                <div class="data-item">
                                    ℹ️ <strong>Durum:</strong> \${item.kegm.status || '-'}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="data-item">
                                    📅 <strong>Geçerlilik:</strong> \${item.kegm.activeUntil || '-'}
                                </div>
                                <div class="data-item">
                                    \${item.kegm.active ? '✅' : '⏸️'} <strong>Aktif:</strong> \${item.kegm.active ? 'Evet' : 'Hayır'}
                                </div>
                            </div>
                        </div>
                    </div>
                    \` : ''}

                    \${item.tacb && !item.tacb.error ? \`
                    <div class="data-source">
                        <h6>📚 TA Callbook</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="data-item">
                                    👤 <strong>Ad Soyad:</strong> \${item.tacb.fname || '-'}
                                </div>
                                <div class="data-item">
                                    📞 <strong>Telefon:</strong> \${item.tacb.phone || '-'}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="data-item">
                                    📧 <strong>E-posta:</strong> \${item.tacb.email || '-'}
                                </div>
                                <div class="data-item">
                                    📍 <strong>Adres:</strong> \${item.tacb.address || '-'}
                                </div>
                            </div>
                        </div>
                        \${item.tacb.site ? \`
                        <div class="data-item">
                                    🌐 <strong>Web:</strong> <a href="http://\${item.tacb.site}" target="_blank">\${item.tacb.site}</a>
                                </div>
                        \` : ''}
                    </div>
                    \` : ''}
                </div>
            \`;
        }

        function updatePagination() {
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);
            const pagination = document.getElementById('pagination');

            let paginationHTML = '';

            // Previous button
            paginationHTML += \`
                <li class="\${currentPage === 1 ? 'disabled' : ''}">
                    <a href="#" onclick="changePage(\${currentPage - 1}); return false;">
                        ←
                    </a>
                </li>
            \`;

            // Page numbers
            for (let i = 1; i <= Math.min(totalPages, 10); i++) {
                paginationHTML += \`
                    <li class="\${i === currentPage ? 'active' : ''}">
                        <a href="#" onclick="changePage(\${i}); return false;">\${i}</a>
                    </li>
                \`;
            }

            // Next button
            paginationHTML += \`
                <li class="\${currentPage === totalPages ? 'disabled' : ''}">
                    <a href="#" onclick="changePage(\${currentPage + 1}); return false;">
                        →
                    </a>
                </li>
            \`;

            pagination.innerHTML = paginationHTML;
        }

        function changePage(page) {
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                displayResults();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        function filterData(filter) {
            currentFilter = filter;
            currentPage = 1;

            // Update active button
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            const searchTerm = document.getElementById('searchInput').value.toLowerCase();

            filteredData = callsignData.filter(item => {
                // Text search
                if (searchTerm) {
                    const searchMatch =
                        item.callsign.toLowerCase().includes(searchTerm) ||
                        (item.qrz?.fname && item.qrz.fname.toLowerCase().includes(searchTerm)) ||
                        (item.qrz?.name && item.qrz.name.toLowerCase().includes(searchTerm)) ||
                        (item.tacb?.fname && item.tacb.fname.toLowerCase().includes(searchTerm)) ||
                        (item.kegm?.name && item.kegm.name.toLowerCase().includes(searchTerm));

                    if (!searchMatch) return false;
                }

                // Filter by type
                switch(filter) {
                    case 'available':
                        return item.availability === 'available';
                    case 'unavailable':
                        return item.availability === 'unavailable';
                    case 'not-found':
                        return item.availability === 'not-found';
                    case 'qrz-only':
                        return item.qrz && !item.qrz.error;
                    case 'kegm-only':
                        return item.kegm && !item.kegm.error;
                    case 'tacb-only':
                        return item.tacb && !item.tacb.error;
                    default:
                        return true;
                }
            });

            // Apply sorting
            sortData(document.getElementById('sortSelect').value);

            displayResults();
        }

        function sortData(sortBy) {
            switch(sortBy) {
                case 'callsign':
                    filteredData.sort((a, b) => a.callsign.localeCompare(b.callsign));
                    break;
                case 'callsign-desc':
                    filteredData.sort((a, b) => b.callsign.localeCompare(a.callsign));
                    break;
                case 'status':
                    const statusOrder = { 'active': 0, 'inactive': 1, 'not-found': 2 };
                    filteredData.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
                    break;
                case 'available':
                    filteredData.sort((a, b) => {
                        const availOrder = { 'available': 0, 'unavailable': 1, 'not-found': 2 };
                        return availOrder[a.availability] - availOrder[b.availability];
                    });
                    break;
            }
            displayResults();
        }

        function exportToCSV() {
            let csv = 'Çağrı İşareti,Durum,QRZ Adı,QRZ Soyadı,KEGM Adı,KEGM TCKN,KEGM Durum,TACB Adı,TACB Telefon,TACB E-posta\\n';

            filteredData.forEach(item => {
                csv += \`\${item.callsign},\`;
                csv += \`\${item.status === 'active' ? 'AKTİF' : item.status === 'inactive' ? 'PASİF' : 'YOK'},\`;
                csv += \`\${item.qrz?.fname || ''},\`;
                csv += \`\${item.qrz?.name || ''},\`;
                csv += \`\${item.kegm?.name || ''},\`;
                csv += \`\${item.kegm?.trid || ''},\`;
                csv += \`\${item.kegm?.status || ''},\`;
                csv += \`\${item.tacb?.fname || ''},\`;
                csv += \`\${item.tacb?.phone || ''},\`;
                csv += \`\${item.tacb?.email || ''}\\n\`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', \`ta2_callsigns_\${new Date().toISOString().split('T')[0]}.csv\`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();

            // Search input
            document.getElementById('searchInput').addEventListener('input', () => filterData(currentFilter));

            // Sort select
            document.getElementById('sortSelect').addEventListener('change', (e) => {
                sortData(e.target.value);
            });
        });
    </script>
</body>
</html>`;

// Write the complete HTML file
fs.writeFileSync('TA2_Callsign_Database_Complete.html', htmlTemplate);
console.log('Complete HTML file generated successfully!');
console.log('File contains all 676 callsign entries from TA2AA to TA2ZZ');
console.log('File size:', fs.statSync('TA2_Callsign_Database_Complete.html').size, 'bytes');
";

// Generate a compressed version for easier sharing
const compressedHtml = htmlTemplate
    .replace(/\\s+/g, ' ')
    .replace(/<!--.*?-->/g, '')
    .replace(/\\/g, '');

fs.writeFileSync('TA2_Callsign_Database_Compressed.html', compressedHtml);
console.log('Compressed HTML file generated successfully!');
console.log('Compressed file size:', fs.statSync('TA2_Callsign_Database_Compressed.html').size, 'bytes');