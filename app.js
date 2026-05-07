/**
 * SPEEDTEST APP LOGIC
 * Menangani UI, animasi Gauge, dan Alur Testing.
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const btnStart = document.getElementById('btnStart');
    const btnStop = document.getElementById('btnStop');
    const currentSpeedEl = document.getElementById('currentSpeed');
    const testStatusEl = document.getElementById('testStatus');
    
    // Stats Elements
    const ipEl = document.getElementById('netIp');
    const ispEl = document.getElementById('netIsp');
    const locationEl = document.getElementById('netLocation');
    const timezoneEl = document.getElementById('netTimezone');
    
    const pingEl = document.getElementById('statPing');
    const jitterEl = document.getElementById('statJitter');
    const downloadEl = document.getElementById('statDownload');
    const uploadEl = document.getElementById('statUpload');

    let isTesting = false;
    let gaugeInterval;

    // Inisialisasi: Ambil Info Jaringan saat web pertama dibuka
    initNetworkInfo();

    async function initNetworkInfo() {
        const info = await NetworkAPI.fetchNetworkInfo();
        if (info) {
            ipEl.innerText = info.ip;
            ispEl.innerText = info.isp;
            locationEl.innerText = info.location;
            timezoneEl.innerText = info.timezone;
        } else {
            ipEl.innerText = "Error fetching data";
        }
    }

    // Fungsi Animasi Gauge (Max limit visual = 100 Mbps)
    function updateGauge(mbps) {
        currentSpeedEl.innerText = mbps;
        // Konversi mbps ke derajat (Max 360deg = full circle)
        // Kita asumsikan 100 Mbps = 360 derajat secara visual agar animasi terlihat penuh
        let degrees = (mbps / 100) * 360;
        if (degrees > 360) degrees = 360; 
        document.documentElement.style.setProperty('--gauge-progress', `${degrees}deg`);
    }

    function resetUI() {
        updateGauge(0);
        testStatusEl.innerText = "Idle";
        testStatusEl.style.color = "var(--accent-red)";
        pingEl.innerText = "0";
        jitterEl.innerText = "0";
        downloadEl.innerText = "0";
        uploadEl.innerText = "0";
    }

    // MAIN TEST LOGIC
    async function runSpeedTest() {
        isTesting = true;
        btnStart.disabled = true;
        btnStop.disabled = false;
        resetUI();

        try {
            // 1. PING & JITTER TEST
            if (!isTesting) return;
            testStatusEl.innerText = "Testing Ping...";
            const { ping, jitter } = await NetworkAPI.measurePing();
            pingEl.innerText = ping;
            jitterEl.innerText = jitter;

            // 2. DOWNLOAD TEST
            if (!isTesting) return;
            testStatusEl.innerText = "Testing Download...";
            testStatusEl.style.color = "#00e676"; // Hijau saat download
            
            const finalDownload = await NetworkAPI.measureDownload((liveMbps) => {
                if(isTesting) updateGauge(liveMbps);
            });
            
            if (!isTesting) return;
            downloadEl.innerText = finalDownload;
            updateGauge(0); // Reset visual sebelum masuk upload

            // 3. UPLOAD TEST
            if (!isTesting) return;
            testStatusEl.innerText = "Testing Upload...";
            testStatusEl.style.color = "#3498db"; // Biru saat upload

            const finalUpload = await NetworkAPI.measureUpload((liveMbps) => {
                if(isTesting) updateGauge(liveMbps);
            });
            
            if (!isTesting) return;
            uploadEl.innerText = finalUpload;
            updateGauge(finalUpload); // Sisakan visual di angka terakhir

            // SELESAI
            testStatusEl.innerText = "Test Completed";
            testStatusEl.style.color = "var(--text-muted)";

        } catch (error) {
            console.error("Test aborted or failed", error);
            testStatusEl.innerText = "Test Error";
        } finally {
            isTesting = false;
            btnStart.disabled = false;
            btnStop.disabled = true;
        }
    }

    // Event Listeners
    btnStart.addEventListener('click', runSpeedTest);
    
    btnStop.addEventListener('click', () => {
        isTesting = false;
        btnStart.disabled = false;
        btnStop.disabled = true;
        testStatusEl.innerText = "Test Stopped";
        testStatusEl.style.color = "var(--accent-red)";
        updateGauge(0);
    });
});
