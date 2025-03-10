document.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map").setView([12.6711, 123.8794], 15);
    let tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    let userMarker = null;
    let is3DMode = false;

    function trackLocation() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`User's Location: ${latitude}, ${longitude}`);

                if (userMarker) {
                    userMarker.setLatLng([latitude, longitude]);
                } else {
                    userMarker = L.marker([latitude, longitude], {
                        icon: L.icon({
                            iconUrl: "gps-icon.png", // Ensure this file exists or provide a fallback
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

        if (moisture > 70 || vibration > 50) {
            alertMessage.textContent = "🚨 High Risk: Landslide Possible!";
            alertMessage.style.color = "red";
        } else {
            alertMessage.textContent = "✅ Safe Conditions";
            alertMessage.style.color = "green";
        }
    }

    const ctx = document.getElementById("lineChart").getContext("2d");
    const lineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Moisture Level (%)",
                    borderColor: "#FF8C00",
                    backgroundColor: "rgba(255, 140, 0, 0.2)",
                    data: [],
                    fill: true,
                },
                {
                    label: "Vibration Level (%)",
                    borderColor: "#FFA500",
                    backgroundColor: "rgba(255, 165, 0, 0.2)",
                    data: [],
                    fill: true,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });

    function updateChart(timestamp, moisture, vibration) {
        lineChart.data.labels.push(timestamp);
        lineChart.data.datasets[0].data.push(moisture);
        lineChart.data.datasets[1].data.push(vibration);

        if (lineChart.data.labels.length > 10) {
            lineChart.data.labels.shift();
            lineChart.data.datasets[0].data.shift();
            lineChart.data.datasets[1].data.shift();
        }

        lineChart.update();
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

            updateChart(timestamp, moistureValue, vibrationValue);
            updateTable(timestamp, moistureValue, vibrationValue);
            updateAlertMessage(moistureValue, vibrationValue);

        } catch (error) {
            console.error("Error fetching data:", error);
            document.getElementById("moisture-level").textContent = "Error";
            document.getElementById("vibration-level").textContent = "Error";
        }
    }

    function downloadData() {
        let csvContent = "Timestamp,Moisture Level (%),Vibration Level (%)\n";
        lineChart.data.labels.forEach((label, index) => {
            csvContent += `${label},${lineChart.data.datasets[0].data[index]},${lineChart.data.datasets[1].data[index]}\n`;
        });

        let blob = new Blob([csvContent], { type: "text/csv" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "sensor_data.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function resetData() {
        lineChart.data.labels = [];
        lineChart.data.datasets[0].data = [];
        lineChart.data.datasets[1].data = [];
        lineChart.update();

        document.getElementById("data-table").innerHTML = `<tr>
            <th>Timestamp</th>
            <th>Moisture Level (%)</th>
            <th>Vibration Level (%)</th>
            <th>Alert Status</th>
        </tr>`;

        document.getElementById("alert-message").textContent = "⚠️ Monitoring...";
        document.getElementById("alert-message").style.color = "black";
    }

    setInterval(fetchSensorData, 5000);

    window.trackLocation = trackLocation;
    window.toggle3DMode = toggle3DMode;
    window.fetchSensorData = fetchSensorData;
    window.downloadData = downloadData;
    window.resetData = resetData;

    // Handle report submission
    const reportForm = document.getElementById("report-form");
    const reportList = document.getElementById("report-list");

    reportForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const location = document.getElementById("location").value;
        const description = document.getElementById("description").value;
        const severity = document.getElementById("severity").value;

        const reportItem = document.createElement("li");
        reportItem.classList.add(severity.toLowerCase() + "-risk");

        reportItem.innerHTML = `
            <span>${location}</span>
            <p>${description}</p>
            <p><strong>Severity:</strong> ${severity}</p>
        `;

        reportList.appendChild(reportItem);
        reportForm.reset();
    });
});
