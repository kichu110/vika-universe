const map = L.map("map").setView([20, 0], 2);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
  }
).addTo(map);

const SHEET_ID = "1Z1kvIV2MKnqhfMjbn5B3i6ZcDN7Q5MIRKngYGNaKNF4";

fetch(
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
)
  .then((response) => response.text())
  .then((text) => {
    const json = JSON.parse(
      text.replace(
        /^\/\*O_o\*\/\s*google\.visualization\.Query\.setResponse\(/,
        ""
      ).slice(0, -2)
    );

    const rows = json.table.rows;

    let totalFans = 0;
    const cities = new Set();
    const countries = new Set();

    rows.forEach((row) => {
      const status = (row.c[8]?.v || "")
        .toString()
        .trim()
        .toLowerCase();

      if (status !== "added") {
        return;
      }

      const lat = row.c[6]?.v;
      const lng = row.c[7]?.v;

      if (lat == null || lng == null) {
        return;
      }

      totalFans++;

      const city = row.c[2]?.v || "";
      const country = row.c[3]?.v || "";
      const username = row.c[1]?.v || "Anonymous";
      const moment = row.c[4]?.v || "";

      cities.add(city);
      countries.add(country);

      const heartIcon = L.divIcon({
  className: "heart-marker",
  html: "❤️",
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

L.marker([lat, lng], {
  icon: heartIcon
})
  .addTo(map)
  .bindPopup(
    `<b>${username}</b><br>${city}, ${country}<br>✨ ${moment}`
  );
    });

    document.getElementById("fans").textContent = totalFans;
    document.getElementById("cities").textContent = cities.size;
    document.getElementById("countries").textContent = countries.size;
  })
  .catch((error) => {
    console.error(error);
    alert(error);
  });
