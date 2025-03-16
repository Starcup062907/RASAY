document.addEventListener("DOMContentLoaded", function () {
    initializeCharts();
    initializeMap();
    fetchSensorData();
    setInterval(fetchSensorData, 5000);

    // Event listeners for buttons
    document.getElementById("refresh-btn").addEventListener("click", function() {
        console.log("Refresh button clicked");
        fetchSensorData();
    });

    document.getElementById("download-btn").addEventListener("click", function() {
        console.log("Download button clicked");
        downloadData();
    });

    document.getElementById("3d-toggle-btn").addEventListener("click", function() {
        console.log("3D toggle button clicked");
        toggle3DView();
    });
});

// Blynk API credentials
const BLYNK_AUTH_TOKEN = "aO103zCrTfgeA9WGwByZuO4eIflm63KW"; // Replace with your actual token
const BLYNK_API_URL = `https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&pin=`;

// Blynk Virtual Pins (ESP32)
const VPIN_MOISTURE1 = "V1";
const VPIN_MOISTURE2 = "V2";
const VPIN_MOISTURE3 = "V3";
const VPIN_VIBRATION = "V4";
const VPIN_ALERT = "V5";

// Variables for charts
let lineChart, barChart;
let is3DEnabled = false; // Track 3D view state

// Function to fetch real-time sensor data from Blynk
async function fetchSensorData() {
    try {
        const responses = await Promise.all([
            fetch(`${BLYNK_API_URL}${VPIN_MOISTURE1}`).then(res => res.json()).catch(() => ({ [VPIN_MOISTURE1]: "N/A" })),
            fetch(`${BLYNK_API_URL}${VPIN_MOISTURE2}`).then(res => res.json()).catch(() => ({ [VPIN_MOISTURE2]: "N/A" })),
            fetch(`${BLYNK_API_URL}${VPIN_MOISTURE3}`).then(res => res.json()).catch(() => ({ [VPIN_MOISTURE3]: "N/A" })),
            fetch(`${BLYNK_API_URL}${VPIN_VIBRATION}`).then(res => res.json()).catch(() => ({ [VPIN_VIBRATION]: "N/A" })),
            fetch(`${BLYNK_API_URL}${VPIN_ALERT}`).then(res => res.json()).catch(() => ({ [VPIN_ALERT]: "safe" })),
        ]);

        // Extracting sensor values with fallback values
        const moisture1 = responses[0][VPIN_MOISTURE1] ?? "N/A";
        const moisture2 = responses[1][VPIN_MOISTURE2] ?? "N/A";
        const moisture3 = responses[2][VPIN_MOISTURE3] ?? "N/A";
        const vibration = responses[3][VPIN_VIBRATION] ?? "N/A";
        const alertStatus = responses[4][VPIN_ALERT] ?? "safe";

        // Update the UI
        document.getElementById("moisture1-level").textContent = `${moisture1}%`;
        document.getElementById("moisture2-level").textContent = `${moisture2}%`;
        document.getElementById("moisture3-level").textContent = `${moisture3}%`;
        document.getElementById("vibration-level").textContent = vibration;

        // Update alert message
        const alertMessage = document.getElementById("alert-message");
        if (vibration > 70) {
            alertMessage.textContent = "⚠️ High Risk: Possible Landslide!";
            alertMessage.style.color = "red";
        } else if (vibration > 30) {
            alertMessage.textContent = "⚠️ Medium Risk: Monitor Conditions.";
            alertMessage.style.color = "orange";
        } else {
            alertMessage.textContent = "🟢 Safe: Conditions Stable.";
            alertMessage.style.color = "green";
        }

        // Update charts
        updateCharts([moisture1, moisture2, moisture3], vibration);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function to update the charts dynamically
function updateCharts(moistureLevels, vibration) {
    if (!lineChart || !barChart) return; // Ensure charts are initialized

    // Update Line Chart
    lineChart.data.datasets[0].data = moistureLevels;
    lineChart.update();

    // Update Bar Chart
    barChart.data.datasets[0].data = [moistureLevels[0], moistureLevels[1], moistureLevels[2], vibration];
    barChart.update();
}

// Function to initialize charts with the main website's effects
function initializeCharts() {
    const lineChartCanvas = document.getElementById("lineChart");
    const barChartCanvas = document.getElementById("barChart");

    if (!lineChartCanvas || !barChartCanvas) {
        console.error("Canvas elements for charts not found.");
        return;
    }

    const lineChartContext = lineChartCanvas.getContext("2d");
    const barChartContext = barChartCanvas.getContext("2d");

    // Destroy existing charts before reinitializing
    if (lineChart) lineChart.destroy();
    if (barChart) barChart.destroy();

    // Initialize Line Chart
    lineChart = new Chart(lineChartContext, {
        type: "line",
        data: {
            labels: ["Sensor 1", "Sensor 2", "Sensor 3"],
            datasets: [{
                label: "Moisture Level (%)",
                data: [0, 0, 0],
                borderColor: "#00A86B",
                backgroundColor: "rgba(0, 168, 107, 0.2)",
                fill: true,
                borderWidth: 3,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Initialize Bar Chart
    barChart = new Chart(barChartContext, {
        type: "bar",
        data: {
            labels: ["Moisture 1", "Moisture 2", "Moisture 3", "Vibration"],
            datasets: [{
                label: "Sensor Readings",
                data: [0, 0, 0, 0],
                backgroundColor: ["#00A86B", "#FF9800", "#2196F3", "#F44336"],
                borderRadius: 5
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Function to initialize map
function initializeMap() {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    const map = L.map("map").setView([13.153, 123.749], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.circle([13.153, 123.749], { color: "red", fillColor: "red", fillOpacity: 0.5, radius: 500 }).addTo(map).bindPopup("High Risk Zone");
    L.circle([13.154, 123.748], { color: "orange", fillColor: "orange", fillOpacity: 0.5, radius: 500 }).addTo(map).bindPopup("Medium Risk Zone");
    L.circle([13.152, 123.750], { color: "green", fillColor: "green", fillOpacity: 0.5, radius: 500 }).addTo(map).bindPopup("Safe Zone");
}

// Function to toggle between 2D and 3D views
function toggle3DView() {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    is3DEnabled = !is3DEnabled;
    mapContainer.classList.toggle("three-d");
    alert(is3DEnabled ? "3D View Enabled" : "3D View Disabled");
}

// Function to download data as CSV
function downloadData() {
    const data = [
        ["Moisture 1", "Moisture 2", "Moisture 3", "Vibration"],
        [
            document.getElementById("moisture1-level").textContent.replace("%", "").trim() || "N/A",
            document.getElementById("moisture2-level").textContent.replace("%", "").trim() || "N/A",
            document.getElementById("moisture3-level").textContent.replace("%", "").trim() || "N/A",
            document.getElementById("vibration-level").textContent.trim() || "N/A"
        ]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + data.map(row => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "sensor_data.csv";
    link.click();
}
