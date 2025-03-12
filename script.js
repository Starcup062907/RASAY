document.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map").setView([12.6711, 123.8794], 15);
    let tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    let userMarker = null;
    let is3DMode = false;

    let lastAlertStatus = "✅ Safe"; // Track the last alert status

    function trackLocation() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                if (userMarker) {
                    userMarker.setLatLng([latitude, longitude]);
                } else {
                    userMarker = L.marker([latitude, longitude], {
                        icon: L.icon({
                            iconUrl: "gps-icon.png",
                            iconSize: [30, 30],
                            iconAnchor: [15, 30],
                        })
                    }).addTo(map);
                }
                map.setView([latitude, longitude], 15);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Unable to retrieve your location.");
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );
    }

    function toggle3DMode() {
        if (tileLayer) map.removeLayer(tileLayer);
        tileLayer = L.tileLayer(
            is3DMode
                ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                : "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
            { attribution: "© OpenStreetMap contributors" }
        );
        tileLayer.addTo(map);
        is3DMode = !is3DMode;
    }

    function updateTable(timestamp, moisture, vibration) {
        const dataTable = document.getElementById("data-table");
        const alertStatus = (moisture > 70 || vibration > 50) ? "🚨 High Risk" : "✅ Safe";
        const row = `<tr>
                        <td>${timestamp}</td>
                        <td>${moisture}%</td>
                        <td>${vibration}%</td>
                        <td>${alertStatus}</td>
                    </tr>`;
        dataTable.innerHTML += row;
    }

    function updateAlertMessage(moisture, vibration) {
        const alertMessage = document.getElementById("alert-message");
        
        // Check if conditions have changed
        if (moisture > 70 || vibration > 50) {
            if (lastAlertStatus !== "🚨 High Risk") {
                lastAlertStatus = "🚨 High Risk";
                alertMessage.textContent = "🚨 High Risk: Landslide Possible!";
                alertMessage.style.color = "red";
            }
        } else {
            if (lastAlertStatus !== "✅ Safe") {
                lastAlertStatus = "✅ Safe";
                alertMessage.textContent = "✅ Safe Conditions";
                alertMessage.style.color = "green";
            }
        }
    }

    // 📈 Line Chart
    const lineCtx = document.getElementById("lineChart").getContext("2d");
    const lineChart = new Chart(lineCtx, {
        type: "line",
        data: { labels: [], datasets: [
            {
                label: "Moisture Level (%)",
                borderColor: "#00aaff",
                backgroundColor: "rgba(0, 170, 255, 0.2)",
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: "#00aaff",
                fill: true,
                data: [],
            },
            {
                label: "Vibration Level (%)",
                borderColor: "#ff1744",
                backgroundColor: "rgba(255, 23, 68, 0.2)",
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: "#ff1744",
                fill: true,
                data: [],
            }
        ]},
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 📊 Bar Chart
    const barCtx = document.getElementById("barChart").getContext("2d");
    const barChart = new Chart(barCtx, {
        type: "bar",
        data: { labels: [], datasets: [
            {
                label: "Moisture Level (%)",
                backgroundColor: "#007bff",
                borderColor: "#0056b3",
                borderWidth: 1,
                data: [],
            },
            {
                label: "Vibration Level (%)",
                backgroundColor: "#dc3545",
                borderColor: "#b21f2d",
                borderWidth: 1,
                data: [],
            }
        ]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: "top" } },
            scales: { y: { beginAtZero: true } }
        }
    });

    function updateCharts(timestamp, moisture, vibration) {
        lineChart.data.labels.push(timestamp);
        lineChart.data.datasets[0].data.push(moisture);
        lineChart.data.datasets[1].data.push(vibration);

        barChart.data.labels.push(timestamp);
        barChart.data.datasets[0].data.push(moisture);
        barChart.data.datasets[1].data.push(vibration);

        if (lineChart.data.labels.length > 10) {
            lineChart.data.labels.shift();
            lineChart.data.datasets[0].data.shift();
            lineChart.data.datasets[1].data.shift();
        }

        if (barChart.data.labels.length > 10) {
            barChart.data.labels.shift();
            barChart.data.datasets[0].data.shift();
            barChart.data.datasets[1].data.shift();
        }

        lineChart.update();
        barChart.update();
    }

    const BLYNK_AUTH_TOKEN = "FkuNUN5h20yMXgAxSr3nagEy52lfF0rz";
    const BLYNK_VPIN_MOISTURE = "V1";
    const BLYNK_VPIN_VIBRATION = "V2";

    async function fetchSensorData() {
        try {
            let moistureResponse = await fetch(`https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&V${BLYNK_VPIN_MOISTURE}`);
            let moistureValue = await moistureResponse.text();
            moistureValue = parseInt(moistureValue) || 0;

            let vibrationResponse = await fetch(`https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&V${BLYNK_VPIN_VIBRATION}`);
            let vibrationValue = await vibrationResponse.text();
            vibrationValue = parseInt(vibrationValue) || 0;

            const timestamp = new Date().toLocaleTimeString();

            document.getElementById("moisture-level").textContent = moistureValue + "%";
            document.getElementById("vibration-level").textContent = vibrationValue;

            updateCharts(timestamp, moistureValue, vibrationValue);
            updateTable(timestamp, moistureValue, vibrationValue);
            updateAlertMessage(moistureValue, vibrationValue);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function downloadData() {
        const dataTable = document.getElementById("data-table");
        let csvContent = "Timestamp,Moisture Level (%),Vibration Level (%)\n";

        if (dataTable.rows.length <= 1) {
            alert("No data available for download.");
            return;
        }

        for (let i = 1; i < dataTable.rows.length; i++) {
            let row = dataTable.rows[i];
            let timestamp = row.cells[0].textContent;
            let moisture = row.cells[1].textContent.replace("%", "");
            let vibration = row.cells[2].textContent.replace("%", "");
            csvContent += `${timestamp},${moisture},${vibration}\n`;
        }

        let blob = new Blob([csvContent], { type: "text/csv" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "sensor_data.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    setInterval(fetchSensorData, 5000); // Fetch new data every 5 seconds

    window.trackLocation = trackLocation;
    window.toggle3DMode = toggle3DMode;
    window.fetchSensorData = fetchSensorData;
    window.downloadData = downloadData;
});
