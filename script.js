const map = L.map("map").setView([20, 0], 2);

// OpenStreetMap Tiles
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
    }
).addTo(map);

// Google Sheet ID
const SHEET_ID = "1Z1kvIV2MKnqhfMjbn5B3i6ZcDN7Q5MIRKngYGNaKNF4";

// Pin Marker
const pinIcon = L.divIcon({
    className: "pin-marker",
    html: "📍",
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

// Google Sheet JSON URL
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

fetch(url)
    .then(response => response.text())
    .then(text => {

        const json = JSON.parse(
            text
                .replace(/^\/\*O_o\*\/\s*google\.visualization\.Query\.setResponse\(/, "")
                .replace(/\);$/, "")
        );

        const rows = json.table.rows;

        let totalFans = 0;

        const cities = new Set();
        const countries = new Set();

        const cityGroups = {};

        rows.forEach(row => {

            const status = (row.c[8]?.v || "")
                .toString()
                .trim()
                .toLowerCase();

            if (status !== "added") return;

            const username = row.c[1]?.v || "Anonymous";
            const city = row.c[2]?.v || "";
            const country = row.c[3]?.v || "";
            const moment = row.c[4]?.v || "";
            const lat = row.c[6]?.v;
            const lng = row.c[7]?.v;

            if (lat == null || lng == null) return;

            totalFans++;

            cities.add(city);
            countries.add(country);

            const key = `${city}, ${country}`;

            if (!cityGroups[key]) {

                cityGroups[key] = {
                    lat: lat,
                    lng: lng,
                    fans: []
                };

            }

            cityGroups[key].fans.push(`
                <strong>${username}</strong><br>
                ✨ ${moment}<br><br>
            `);

        });

        // Add grouped markers
        Object.values(cityGroups).forEach(place => {

            const cityName = Object.keys(cityGroups).find(
                key => cityGroups[key] === place
            );

            L.marker(
                [place.lat, place.lng],
                {
                    icon: pinIcon
                }
            )
            .addTo(map)
            .bindPopup(`
                <h3>📍 ${cityName}</h3>
                <hr>
                ${place.fans.join("")}
            `);

        });

        // Statistics
        document.getElementById("fans").textContent = totalFans;
        document.getElementById("cities").textContent = cities.size;
        document.getElementById("countries").textContent = countries.size;

    })
    .catch(error => {
        console.error(error);
        alert("Unable to load Google Sheet data.");
    });
