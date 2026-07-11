const map = L.map("map").setView([20, 0], 2);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors"
  }
).addTo(map);

const SHEET_ID = "1Z1kvIV2MKnqhfMjbn5B3i6ZcDN7Q5MIRKngYGNaKNF4";

const url =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

fetch(url)
  .then((res) => res.text())
  .then((text) => {

    const json = JSON.parse(
      text.substring(47).slice(0, -2)
    );

    const rows = json.table.rows;

    let fans = 0;
    const cities = new Set();
    const countries = new Set();

    rows.forEach((row) => {

      const status =
        (row.c[8]?.v || "").toString().trim().toLowerCase();

      if (
        status !== "added" &&
        status !== "approved"
      ) {
        return;
      }

      const lat = parseFloat(row.c[6]?.v);
      const lng = parseFloat(row.c[7]?.v);

      if (isNaN(lat) || isNaN(lng)) {
        return;
      }

      fans++;

      const city = row.c[2]?.v || "";
      const country = row.c[3]?.v || "";
      const username = row.c[1]?.v || "Anonymous";
      const moment = row.c[4]?.v || "";

      cities.add(city);
      countries.add(country);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`
          <b>${username}</b><br>
          ${city}, ${country}<br>
          ✨ ${moment}
        `);
    });

    document.getElementById("fans").textContent = fans;
    document.getElementById("cities").textContent = cities.size;
    document.getElementById("countries").textContent = countries.size;
  })
  .catch((err) => {
    console.error(err);
    alert("Sheet loading failed");
  });
