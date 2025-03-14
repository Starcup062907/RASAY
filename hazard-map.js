document.addEventListener("DOMContentLoaded", () => {
    // Initialize the map
    const map = L.map("hazard-map").setView([12.6711, 123.8794], 14);

    // Define different base layers
    const baseLayers = {
        "Street Map": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        }),
        "Satellite View": L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        }),
        "Terrain Map": L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        })
    };

    // Add default layer (Street Map)
    baseLayers["Street Map"].addTo(map);

    // Add control to switch layers
    L.control.layers(baseLayers).addTo(map);

    // === 3D Mode Toggle ===
    let is3DMode = false;
    function toggle3DMode() {
        if (is3DMode) {
            baseLayers["Street Map"].addTo(map);
        } else {
            baseLayers["Terrain Map"].addTo(map);
        }
        is3DMode = !is3DMode;
    }
    window.toggle3DMode = toggle3DMode;

    // === User Location Tracking ===
    function locateUser() {
        map.locate({ setView: true, maxZoom: 16 });

        map.on("locationfound", (e) => {
            L.marker(e.latlng).addTo(map)
                .bindPopup("📍 You are here!")
                .openPopup();
        });

        map.on("locationerror", () => {
            alert("⚠️ Location access denied or unavailable.");
        });
    }
    window.locateUser = locateUser;

    // === Landslide Hazard Areas (GeoJSON) ===
    const landslideAreas = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": { "name": "Landslide Zone 1" },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [123.8780, 12.6700], 
                        [123.8795, 12.6705], 
                        [123.8805, 12.6695], 
                        [123.8790, 12.6690], 
                        [123.8780, 12.6700]
                    ]]
                }
            }
        ]
    };

    L.geoJSON(landslideAreas, {
        style: {
            color: "red",
            fillColor: "rgba(255, 0, 0, 0.5)",
            weight: 2
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<b>${feature.properties.name}</b><br>⚠️ Landslide-Prone Area`);

            layer.on("mouseover", function () {
                this.setStyle({ fillColor: "rgba(255, 0, 0, 0.8)" });
            });

            layer.on("mouseout", function () {
                this.setStyle({ fillColor: "rgba(255, 0, 0, 0.5)" });
            });
        }
    }).addTo(map);

    // === Custom Zoom & Reset Controls ===
    const zoomControls = L.control({ position: "topleft" });

    zoomControls.onAdd = function (map) {
        let div = L.DomUtil.create("div", "zoom-controls");
        div.innerHTML = `
            <button onclick="map.zoomIn()" class="zoom-btn">➕</button>
            <button onclick="map.zoomOut()" class="zoom-btn">➖</button>
            <button onclick="map.setView([12.6711, 123.8794], 14)" class="zoom-btn">🔄</button>
        `;
        return div;
    };
    zoomControls.addTo(map);

    // === Location Search Bar ===
    const searchControl = new GeoSearch.GeoSearchControl({
        provider: new GeoSearch.OpenStreetMapProvider(),
        style: "bar",
        autoClose: true,
        showMarker: true,
        showPopup: false,
        keepResult: true
    });
    map.addControl(searchControl);

    // === Real-Time Sensor Data from Blynk ===
    const BLYNK_AUTH_TOKEN = "FkuNUN5h20yMXgAxSr3nagEy52lfF0rz";
    const BLYNK_VPIN_MOISTURE = "V1";
    const BLYNK_VPIN_VIBRATION = "V2";

    const sensorMarker = L.marker([12.6715, 123.8792]).addTo(map)
        .bindPopup(`<b>Real-Time Sensor</b><br>🌱 Moisture: Loading...<br>⚠️ Vibration: Loading...`);

    async function fetchSensorData() {
        try {
            let moistureResponse = await fetch(`https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&V${BLYNK_VPIN_MOISTURE}`);
            let moistureValue = await moistureResponse.text();
            moistureValue = parseInt(moistureValue) || 0;

            let vibrationResponse = await fetch(`https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&V${BLYNK_VPIN_VIBRATION}`);
            let vibrationValue = await vibrationResponse.text();
            vibrationValue = parseInt(vibrationValue) || 0;

            sensorMarker.setPopupContent(`<b>Real-Time Sensor</b><br>🌱 Moisture: ${moistureValue}%<br>⚠️ Vibration: ${vibrationValue}`);
        } catch (error) {
            console.error("Error fetching sensor data:", error);
        }
    }

    setInterval(fetchSensorData, 5000); // Refresh every 5 seconds
});
