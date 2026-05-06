// ==============================
// ELEMENT
// ==============================
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const speedValue = document.getElementById("speedValue");
const statusText = document.getElementById("statusText");

const pingEl = document.getElementById("ping");
const jitterEl = document.getElementById("jitter");
const downloadEl = document.getElementById("download");
const uploadEl = document.getElementById("upload");

const meter = document.querySelector(".meter");

// ==============================
// STATE
// ==============================
let st = null; // Speedtest instance
let running = false;
let graphData = [];

// ==============================
// CHART (CANVAS)
// ==============================
const canvas = document.getElementById("speedChart");
const ctx = canvas.getContext("2d");

function drawGraph() {
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = canvas.offsetHeight;

  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff2a2a";

  graphData.forEach((val, i) => {
    const x = (i / graphData.length) * width;
    const y = height - (val / 200) * height;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

// ==============================
// METER
// ==============================
function updateMeter(speed) {
  speedValue.textContent = speed.toFixed(1);

  const degree = Math.min(speed * 2, 360);
  meter.style.transform = `rotate(${degree / 10}deg)`;
}

// ==============================
// START TEST (REAL)
// ==============================
async function startTest() {
  if (running) return;

  running = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  statusText.textContent = "Selecting server...";

  graphData = [];

  try {
    const server = await getBestServer();

    statusText.textContent = "Connecting...";

    st = new Speedtest(); // dari LibreSpeed

    st.setParameter("telemetry_level", "basic");
    st.setParameter("url_dl", server.url + "garbage.php");
    st.setParameter("url_ul", server.url + "empty.php");
    st.setParameter("url_ping", server.url + "empty.php");
    st.setParameter("url_getIp", server.url + "getIP.php");

    // ==============================
    // UPDATE LOOP
    // ==============================
    st.onupdate = function (data) {
      if (!running) return;

      const dl = Number(data.dlStatus) || 0;
      const ul = Number(data.ulStatus) || 0;
      const ping = Number(data.pingStatus) || 0;
      const jitter = Number(data.jitterStatus) || 0;

      updateMeter(dl);

      pingEl.textContent = ping.toFixed(0) + " ms";
      jitterEl.textContent = jitter.toFixed(1) + " ms";
      downloadEl.textContent = dl.toFixed(1) + " Mbps";
      uploadEl.textContent = ul.toFixed(1) + " Mbps";

      graphData.push(dl);
      if (graphData.length > 60) graphData.shift();

      drawGraph();
    };

    // ==============================
    // STATE CHANGE
    // ==============================
    st.onend = function () {
      statusText.textContent = "Finished";
      running = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
    };

    st.onstatuschange = function (s) {
      statusText.textContent = s;
    };

    st.start();

  } catch (err) {
    console.error(err);
    statusText.textContent = "Error";
    stopTest();
  }
}

// ==============================
// STOP
// ==============================
function stopTest() {
  if (!running) return;

  try {
    st.abort();
  } catch {}

  running = false;
  statusText.textContent = "Stopped";
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

// ==============================
// EVENTS
// ==============================
startBtn.addEventListener("click", startTest);
stopBtn.addEventListener("click", stopTest);

// ==============================
// INIT
// ==============================
window.addEventListener("load", () => {
  if (typeof loadNetworkInfo === "function") {
    loadNetworkInfo();
  }
});
