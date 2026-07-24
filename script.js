const map = L.map("map").setView([20, 0], 2);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
  }
).addTo(map);

const SHEET_ID = "1Z1kvIV2MKnqhfMjbn5B3i6ZcDN7Q5MIRKngYGNaKNF4";

const pinIcon = L.divIcon({
  className: "pin-marker",
  html: "📍",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

fetch(
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
)
  .then((response) => response.text())
  .then((text) => {
    const json = JSON.parse(
      text
        .replace(
          /^\/\*O_o\*\/\s*google\.visualization\.Query\.setResponse\(/,
          ""
        )
        .slice(0, -2)
    );

    const rows = json.table.rows;

    let totalFans = 0;

    const cities = new Set();
    const countries = new Set();

    const cityGroups = {};

    rows.forEach((row) => {
      const status = (row.c[8]?.v || "")
        .toString()
        .trim()
        .toLowerCase();

      if (status !== "added") return;

      const lat = row.c[6]?.v;
      const lng = row.c[7]?.v;

      if (lat == null || lng == null) return;

      totalFans++;

      const city = row.c[2]?.v || "";
      const country = row.c[3]?.v || "";
      const username = row.c[1]?.v || "Anonymous";
      const moment = row.c[4]?.v || "";

      cities.add(city);
      countries.add(country);

      const key = `${city}, ${country}`;

      if (!cityGroups[key]) {
        cityGroups[key] = {
          lat,
          lng,
          fans: [],
        };
      }

      cityGroups[key].fans.push(
        `<b>${username}</b><br>✨ ${moment}<br><br>`
      );
    });

    // Add map pins
    Object.keys(cityGroups).forEach((key) => {
      const place = cityGroups[key];

      L.marker([place.lat, place.lng], {
        icon: pinIcon,
      })
        .addTo(map)
        .bindPopup(`
          <h3>📍 ${key}</h3>
          <hr>
          ${place.fans.join("")}
        `);
    });

    // Update statistics
    document.getElementById("fans").textContent = totalFans;
    document.getElementById("cities").textContent = cities.size;
    document.getElementById("countries").textContent = countries.size;
// Display countries list
const countryList = document.getElementById("country-list");

countryList.innerHTML = "";

const sortedCountries = [...countries].sort();

sortedCountries.forEach(country => {
    const chip = document.createElement("div");
    chip.className = "country-chip";
    chip.textContent = "🌍 " + country;
    countryList.appendChild(chip);
});

console.log("Countries:", sortedCountries);
    // Show countries list
    const countryList = document.getElementById("country-list");

    countryList.innerHTML = "";

    const sortedCountries = Array.from(countries).sort();

if (sortedCountries.length === 0) {
    countryList.innerHTML = "<p>No countries found.</p>";
} else {
    sortedCountries.forEach((country) => {
        countryList.innerHTML += `
            <div class="country-chip">🌍 ${country}</div>
        `;
    });
}
  })
  .catch((error) => {
    console.error(error);
    alert(error);
  });
