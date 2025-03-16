// Blynk API Credentials
const BLYNK_AUTH_TOKEN = "sA1clm0yz8WgHkO7u68xRkx30LUx5qyj";
const BLYNK_API_URL = `https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}`;

// Define Virtual Pins for Each Sensor
const VPINS = {
    moisture1: "V1",
    moisture2: "V2",
    moisture3: "V3",
    vibration: "V4"
};

// Map Coordinates (Brgy. Gate, Bulan, Sorsogon)
const LOCATION = [12.6711, 123.8794];

// Initialize Leaflet Map with a Delay (Ensures Proper Loading)
let map;
let marker;

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initMap, 100);
    fetchSensorData();  // Fetch data initially
    setInterval(fetchSensorData, 10000);  // Fetch data every 10 seconds
});

// Function to Initialize Map
function initMap() {
    if (!map) {
        map = L.map("map").setView(LOCATION, 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        }).addTo(map);

        marker = L.marker(LOCATION).addTo(map);
        marker.bindPopup("<b>Loading Sensor Data...</b>").openPopup();
    }
}

// Function to Fetch Sensor Data from Blynk
async function fetchSensorData() {
    try {
        // Fetch all sensor values in a single request
        const response = await fetch(`${BLYNK_API_URL}&V1&V2&V3&V4`);
        const data = await response.json();

        // Extract sensor values, default to 0 if no value is found
        const moisture1 = data[VPINS.moisture1] ?? 0;
        const moisture2 = data[VPINS.moisture2] ?? 0;
        const moisture3 = data[VPINS.moisture3] ?? 0;
        const vibration = data[VPINS.vibration] ?? 0;
        const lastUpdated = new Date().toLocaleTimeString();

        // Update Sensor UI
        updateSensorUI("moisture-level-1", moisture1);
        updateSensorUI("moisture-level-2", moisture2);
        updateSensorUI("moisture-level-3", moisture3);
        updateSensorUI("vibration-level", vibration);

        // Update Table Data
        updateTable("moisture-level-1", moisture1, lastUpdated);
        updateTable("moisture-level-2", moisture2, lastUpdated);
        updateTable("moisture-level-3", moisture3, lastUpdated);
        updateTable("vibration-level", vibration, lastUpdated);

        // Update Alerts
        updateAlertMessage(vibration);

        // Update Map Marker Based on Vibration Level
        updateMapMarker(vibration);
    } catch (error) {
        console.error("Error fetching sensor data:", error);
    }
}

// Function to Update Sensor UI
function updateSensorUI(id, value) {
    document.getElementById(id).textContent = `${value}%`;
}

// Function to Update Table Data
function updateTable(id, value, lastUpdated) {
    document.getElementById(`${id}-table`).textContent = `${value}%`;
    document.getElementById(`${id.replace('level', 'status')}`).textContent = value > 50 ? "✅ Normal" : "⚠️ Warning";
    document.getElementById(`${id.replace('level', 'last-updated')}`).textContent = lastUpdated;
}

// Function to Update Alerts
function updateAlertMessage(vibration) {
    const alertMessage = document.getElementById("alert-message");
    let message = "🟢 Safe: Conditions Stable.";
    let color = "green";

    if (vibration > 70) {
        message = "⚠️ High Risk: Possible Landslide!";
        color = "red";
    } else if (vibration > 30) {
        message = "⚠️ Medium Risk: Monitor Conditions.";
        color = "orange";
    }

    alertMessage.textContent = message;
    alertMessage.style.color = color;
}

// Function to Update Map Marker Based on Vibration Level
function updateMapMarker(vibration) {
    if (!marker) return; // Ensure marker exists before updating

    const color = getAlertColor(vibration);
    
    marker.setIcon(L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${color}; border-radius: 50%; width: 30px; height: 30px;"></div>`,
        iconSize: [30, 30]
    }));

    marker.bindPopup(`
        <b>Vibration Level: ${document.getElementById("vibration-level").textContent}</b><br>
        Moisture 1: ${document.getElementById("moisture-level-1").textContent}<br>
        Moisture 2: ${document.getElementById("moisture-level-2").textContent}<br>
        Moisture 3: ${document.getElementById("moisture-level-3").textContent}
    `).openPopup();
}

// Function to Get Alert Color Based on Vibration Level
function getAlertColor(vibration) {
    if (vibration > 70) return "red";
    if (vibration > 30) return "orange";
    return "green";
}

// Auto-refresh sensor data every 10 seconds
setInterval(fetchSensorData, 10000);

// Fetch data on page load
document.addEventListener("DOMContentLoaded", fetchSensorData);
