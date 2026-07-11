const map = L.map('map').setView([20, 0], 2);

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);

function loadSheet() {

    Tabletop.init({

        key: SHEET_URL,

        simpleSheet: true,

        callback: showFans

    });
}

function showFans(data) {

    const cities = new Set();
    const countries = new Set();

    let totalFans = 0;

    data.forEach(row => {

        const status =
            (row["Status"] || "").trim().toLowerCase();

        if (
            status !== "added" &&
            status !== "approved"
        ) {
            return;
        }

        const lat = parseFloat(row["Latitude"]);
        const lng = parseFloat(row["Longitude"]);

        if (isNaN(lat) || isNaN(lng)) {
            return;
        }

        totalFans++;

        cities.add(row["City"]);
        countries.add(row["Country"]);

        const username =
            row["Instagram Username"] || "Anonymous";

        const popup = `
            <b>${username}</b><br>
            ${row["City"]}, ${row["Country"]}<br>
            ✨ ${row["Favourite ViKa Moment"] || ""}
        `;

        L.marker([lat, lng])
            .addTo(map)
            .bindPopup(popup);
    });

    document.getElementById("fans").textContent =
        totalFans;

    document.getElementById("cities").textContent =
        cities.size;

    document.getElementById("countries").textContent =
        countries.size;
}

loadSheet();
