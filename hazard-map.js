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

    // Landslide-prone areas (Placeholder GeoJSON)
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

    // Add landslide hazard areas with hover effect
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

    // Add a legend
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create("div", "legend");
        div.innerHTML += `<strong>Legend</strong><br>`;
        div.innerHTML += `<span style="display:inline-block;width:15px;height:15px;background:red;margin-right:5px;"></span>Landslide-Prone Area<br>`;
        return div;
    };

    legend.addTo(map);

    // ===== Custom Zoom & Reset Controls =====
    const zoomControls = L.control({ position: "topleft" });

    zoomControls.onAdd = function (map) {
        let div = L.DomUtil.create("div", "zoom-controls");
        div.innerHTML = `
            <button id="zoom-in" class="zoom-btn">➕</button>
            <button id="zoom-out" class="zoom-btn">➖</button>
            <button id="reset-map" class="zoom-btn">🔄</button>
        `;
        return div;
    };

    zoomControls.addTo(map);

    // Event Listeners for Buttons
    document.getElementById("zoom-in").addEventListener("click", () => {
        map.zoomIn();
    });

    document.getElementById("zoom-out").addEventListener("click", () => {
        map.zoomOut();
    });

    document.getElementById("reset-map").addEventListener("click", () => {
        map.setView([12.6711, 123.8794], 14);
    });

    // ===== LOCATION SEARCH BAR =====
    const searchControl = new GeoSearch.GeoSearchControl({
        provider: new GeoSearch.OpenStreetMapProvider(),
        style: "bar",
        autoClose: true,
        showMarker: true,
        showPopup: false,
        keepResult: true
    });

    map.addControl(searchControl);

    // === ADDING REAL-TIME SENSOR MARKERS (Example with Blynk Data) ===
    const sensorMarker = L.marker([12.6715, 123.8792]).addTo(map)
        .bindPopup(`<b>Real-Time Sensor</b><br>🌱 Moisture: Loading...<br>⚠️ Vibration: Loading...`);

    function updateSensorData() {
        fetch("https://blynk.cloud/api/get/sensor-data")  // Replace with actual Blynk API
            .then(response => response.json())
            .then(data => {
                sensorMarker.setPopupContent(`<b>Real-Time Sensor</b><br>🌱 Moisture: ${data.moisture}%<br>⚠️ Vibration: ${data.vibration}`);
            })
            .catch(error => console.error("Error fetching sensor data:", error));
    }

    setInterval(updateSensorData, 5000); // Refresh every 5 seconds
});