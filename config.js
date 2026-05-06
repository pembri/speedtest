// ==============================
// LIBRESPEED SERVER LIST (FINAL)
// ==============================

const SPEEDTEST_SERVERS = [
  {
    name: "LibreSpeed EU",
    url: "https://librespeed.org/backend/"
  },
  {
    name: "Indonesia Server",
    url: "https://speedtest.deti.co.id/backend/"
  },
  {
    name: "Backup Server",
    url: "https://speedtest.ftp.otenet.gr/backend/"
  }
];

// ==============================
// TEST LATENCY (PING SERVER)
// ==============================
async function testLatency(server) {
  const start = performance.now();

  try {
    await fetch(server.url + "empty.php", {
      method: "GET",
      cache: "no-store"
    });

    const end = performance.now();
    return end - start;

  } catch {
    return Infinity;
  }
}

// ==============================
// AUTO SELECT BEST SERVER
// ==============================
async function getBestServer() {
  let bestServer = null;
  let bestPing = Infinity;

  for (const server of SPEEDTEST_SERVERS) {
    const latency = await testLatency(server);

    if (latency < bestPing) {
      bestPing = latency;
      bestServer = server;
    }
  }

  console.log("Best Server:", bestServer?.name, bestPing.toFixed(2), "ms");

  return bestServer || SPEEDTEST_SERVERS[0];
}
