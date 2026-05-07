/**
 * SPEEDTEST API ENGINE
 * Menangani pengambilan IP dan kalkulasi kecepatan jaringan.
 */

const NetworkAPI = {
    // 1. Fetch IP & ISP Info
    async fetchNetworkInfo() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            return {
                ip: data.ip || 'Unknown',
                isp: data.org || 'Unknown Provider',
                location: `${data.city}, ${data.country_name}`,
                timezone: data.timezone || 'Unknown'
            };
        } catch (error) {
            console.error("Gagal mengambil info network:", error);
            return null;
        }
    },

    // 2. Measure Ping & Jitter
    async measurePing() {
        const pingTimes = [];
        const testUrl = 'https://cloudflare.com/cdn-cgi/trace'; // Endpoint cepat & stabil

        for (let i = 0; i < 5; i++) {
            const start = performance.now();
            try {
                await fetch(testUrl + '?t=' + Math.random(), { mode: 'no-cors', cache: 'no-store' });
                const end = performance.now();
                pingTimes.push(end - start);
            } catch (e) {
                console.error("Ping error", e);
            }
        }

        if (pingTimes.length === 0) return { ping: 0, jitter: 0 };

        const ping = Math.round(pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length);
        
        // Kalkulasi Jitter (Rata-rata variansi antar ping)
        let jitterSum = 0;
        for (let i = 0; i < pingTimes.length - 1; i++) {
            jitterSum += Math.abs(pingTimes[i] - pingTimes[i+1]);
        }
        const jitter = Math.round(jitterSum / (pingTimes.length - 1)) || 0;

        return { ping, jitter };
    },

    // 3. Measure Download Speed
    async measureDownload(onProgress) {
        // Menggunakan file gambar resolusi tinggi publik untuk test (~3MB)
        const imageUrl = "https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-1.2.1&w=3000&q=80";
        const downloadSizeBits = 3000000 * 8; // Estimasi 3MB dalam bits
        
        const start = performance.now();
        try {
            // Simulasi proses progress (karena fetch biasa sulit track progress di static site)
            let currentBits = 0;
            const progressInterval = setInterval(() => {
                const now = performance.now();
                const durationInSeconds = (now - start) / 1000;
                // Fake progress update for UI animation
                currentBits += downloadSizeBits / 10; 
                let currentMbps = (currentBits / durationInSeconds / 1000000).toFixed(1);
                if(currentMbps > 0) onProgress(currentMbps);
            }, 200);

            await fetch(imageUrl + '&t=' + Math.random(), { cache: 'no-store' });
            
            clearInterval(progressInterval);
            const end = performance.now();
            const durationInSeconds = (end - start) / 1000;
            const mbps = (downloadSizeBits / durationInSeconds / 1000000).toFixed(1);
            
            return parseFloat(mbps);
        } catch (e) {
            return 0;
        }
    },

    // 4. Measure Upload Speed
    async measureUpload(onProgress) {
        // Membuat random data Blob (~2MB) untuk diupload
        const dataSize = 2 * 1024 * 1024;
        const uploadData = new Blob([new Uint8Array(dataSize)]);
        const uploadSizeBits = dataSize * 8;
        const testUrl = 'https://httpbin.org/post'; // Public POST endpoint

        const start = performance.now();
        try {
            let currentBits = 0;
            const progressInterval = setInterval(() => {
                const now = performance.now();
                const durationInSeconds = (now - start) / 1000;
                currentBits += uploadSizeBits / 15; 
                let currentMbps = (currentBits / durationInSeconds / 1000000).toFixed(1);
                if(currentMbps > 0) onProgress(currentMbps);
            }, 200);

            await fetch(testUrl, {
                method: 'POST',
                body: uploadData,
                mode: 'cors',
                cache: 'no-store'
            });

            clearInterval(progressInterval);
            const end = performance.now();
            const durationInSeconds = (end - start) / 1000;
            const mbps = (uploadSizeBits / durationInSeconds / 1000000).toFixed(1);
            
            return parseFloat(mbps);
        } catch (e) {
            return 0;
        }
    }
};
