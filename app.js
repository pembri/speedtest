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

const canvas = document.getElementById("speedChart");
const ctx = canvas.getContext("2d");

// ==============================
// STATE
// ==============================
let worker = null;
let running = false;
let graphData = [];

// ==============================
// GRAPH
// ==============================
function drawGraph() {
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = canvas.offsetHeight;

  ctx.clearRect(0, 0, w, h);

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff2a2a";

  graphData.forEach((val, i) => {
    const x = (i / graphData.length) * w;
    const y = h - (val / 200) * h;

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
  const deg = Math.min(speed * 2, 360);
  meter.style.transform = `rotate(${deg / 10}deg)`;
}

// ==============================
// START TEST (WORKING)
// ==============================
function startTest() {
  if (running) return;

  running = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  statusText.textContent = "Starting...";

  graphData = [];

  // 🔥 WORKER RESMI LIBRESPEED (PUBLIC)
  worker = new Worker("https://librespeed.org/backend/garbage.js");

  worker.postMessage({
    url: "https://librespeed.org/backend/"
  });

  worker.onmessage = (e) => {
    const d = e.data;

    if (!running) return;

    const dl = parseFloat(d.dlStatus) || 0;
    const ul = parseFloat(d.ulStatus) || 0;
    const ping = parseFloat(d.pingStatus) || 0;
    const jitter = parseFloat(d.jitterStatus) || 0;

    statusText.textContent = d.testState || "Testing...";

    updateMeter(dl);

    pingEl.textContent = ping.toFixed(0) + " ms";
    jitterEl.textContent = jitter.toFixed(1) + " ms";
    downloadEl.textContent = dl.toFixed(1) + " Mbps";
    uploadEl.textContent = ul.toFixed(1) + " Mbps";

    graphData.push(dl);
    if (graphData.length > 60) graphData.shift();

    drawGraph();
  };

  // auto stop (biar nggak stuck)
  setTimeout(stopTest, 15000);
}

// ==============================
// STOP
// ==============================
function stopTest() {
  if (!running) return;

  running = false;

  try {
    worker.terminate();
  } catch {}

  statusText.textContent = "Finished";
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

// ==============================
// EVENTS
// ==============================
startBtn.onclick = startTest;
stopBtn.onclick = stopTest;

// ==============================
// INIT
// ==============================
window.onload = () => {
  if (typeof loadNetworkInfo === "function") {
    loadNetworkInfo();
  }
};
