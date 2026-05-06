// ==============================
// NETWORK INFO (FINAL - REAL)
// ==============================

async function loadNetworkInfo() {
  try {
    // API utama
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("API utama gagal");

    const data = await res.json();

    setData({
      ip: data.ip,
      isp: data.org,
      city: data.city,
      country: data.country_name,
      timezone: data.timezone
    });

  } catch (err) {
    console.warn("Fallback ke API kedua...");

    try {
      // fallback API kedua
      const res2 = await fetch("https://ipinfo.io/json");
      const data2 = await res2.json();

      const [city, country] = (data2.loc || "").split(",");

      setData({
        ip: data2.ip,
        isp: data2.org,
        city: data2.city || "-",
        country: data2.country || "-",
        timezone: data2.timezone || "-"
      });

    } catch (err2) {
      console.error("Semua API gagal:", err2);
    }
  }
}

// ==============================
// SET DATA KE UI
// ==============================
function setData({ ip, isp, city, country, timezone }) {
  document.getElementById("ip").textContent = ip || "-";
  document.getElementById("isp").textContent = isp || "-";
  document.getElementById("location").textContent =
    (city || "-") + ", " + (country || "-");
  document.getElementById("timezone").textContent = timezone || "-";
}

// ==============================
// AUTO LOAD
// ==============================
window.addEventListener("load", loadNetworkInfo);
