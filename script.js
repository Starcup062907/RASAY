// Firebase configuration (Replace with your actual credentials)
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to database
const dbRef = firebase.database().ref("landslide");

// Function to update UI with Firebase data
dbRef.on("value", (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        // Update the DOM with the Firebase data
        document.getElementById("moisture1").innerText = data.moisture1;
        document.getElementById("moisture2").innerText = data.moisture2;
        document.getElementById("vibration").innerText = data.vibration ? "Detected" : "No Vibration";
        
        // Update alert levels based on vibration data
        const alertMessage = document.getElementById('alert-message');
        if (data.vibration > 70) {
            alertMessage.textContent = "⚠️ High Risk: Possible Landslide!";
            alertMessage.style.color = "red";
        } else if (data.vibration > 30) {
            alertMessage.textContent = "⚠️ Medium Risk: Monitor Conditions.";
            alertMessage.style.color = "orange";
        } else {
            alertMessage.textContent = "🟢 Safe: Conditions Stable.";
            alertMessage.style.color = "green";
        }
    } else {
        console.log("No data found");
    }
});

// Toggle theme function for dark mode
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.dataset.alertLevel;

    if (currentTheme === "safe") {
        body.dataset.alertLevel = "danger";
        body.style.backgroundColor = "#111";
    } else {
        body.dataset.alertLevel = "safe";
        body.style.backgroundColor = "#fff";
    }
}

// Fetch real-time sensor data (simulate fetching from Blynk or similar API)
function fetchSensorData() {
    // Example simulated data, replace with actual Blynk API calls if available
    const moistureLevel = Math.floor(Math.random() * 100);
    const vibrationLevel = Math.floor(Math.random() * 100);

    // Update the page with new data
    document.getElementById('moisture-level').textContent = moistureLevel;
    document.getElementById('vibration-level').textContent = vibrationLevel;

    // Update the alert message based on vibration level (simulate danger levels)
    const alertMessage = document.getElementById('alert-message');
    if (vibrationLevel > 70) {
        alertMessage.textContent = "⚠️ High Risk: Possible Landslide!";
        alertMessage.style.color = "red";
    } else if (vibrationLevel > 30) {
        alertMessage.textContent = "⚠️ Medium Risk: Monitor Conditions.";
        alertMessage.style.color = "orange";
    } else {
        alertMessage.textContent = "🟢 Safe: Conditions Stable.";
        alertMessage.style.color = "green";
    }
}

// Download data (simple functionality)
function downloadData() {
    const table = document.getElementById('data-table');
    const newRow = table.insertRow();

    const timestampCell = newRow.insertCell(0);
    const moistureCell = newRow.insertCell(1);
    const vibrationCell = newRow.insertCell(2);
    const statusCell = newRow.insertCell(3);

    timestampCell.textContent = new Date().toLocaleString();
    moistureCell.textContent = document.getElementById('moisture-level').textContent;
    vibrationCell.textContent = document.getElementById('vibration-level').textContent;
    statusCell.textContent = document.getElementById('alert-message').textContent;

    const csvContent = [];
    const rows = table.querySelectorAll("tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td, th");
        const rowContent = Array.from(cells).map(cell => cell.textContent).join(",");
        csvContent.push(rowContent);
    });

    const csvData = csvContent.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sensor_data.csv";
    link.click();
}

// Toggle 3D view (Placeholder functionality)
function toggle3DMode() {
    alert("3D view toggled (functionality to be added later).");
}

// Initialize the charts for data visualization (Line and Bar Chart)
function initializeCharts() {
    const lineChartContext = document.getElementById('lineChart').getContext('2d');
    const barChartContext = document.getElementById('barChart').getContext('2d');

    // Line Chart for data visualization
    const lineChart = new Chart(lineChartContext, {
        type: 'line',
        data: {
            labels: ['0', '1', '2', '3', '4', '5'],  // Time or sample points
            datasets: [{
                label: 'Moisture Level (%)',
                data: [65, 59, 80, 81, 56, 55],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            }
        }
    });

    // Bar Chart for comparison (e.g., Moisture vs Vibration)
    const barChart = new Chart(barChartContext, {
        type: 'bar',
        data: {
            labels: ['Moisture', 'Vibration'],
            datasets: [{
                label: 'Levels',
                data: [65, 75],  // Example static values, replace with real data
                backgroundColor: ['#4CAF50', '#FF9800'],
                borderColor: ['#388E3C', '#F57C00'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Initialize the map with Leaflet.js (for hazard monitoring map)
function initializeMap() {
    const map = L.map('map').setView([13.153, 123.749], 13);  // Adjust to actual coordinates for Brgy. Gate, Bulan

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Example of adding marker for different risk zones
    L.marker([13.153, 123.749]).addTo(map)  // Coordinates for Brgy. Gate, Bulan
        .bindPopup('<b>High Risk Zone</b><br>Warning: Potential landslide detected.')
        .openPopup();

    // Example of different risk zone layers
    const highRiskZone = L.circle([13.153, 123.749], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);

    const mediumRiskZone = L.circle([13.154, 123.748], {
        color: 'orange',
        fillColor: 'orange',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);

    const safeZone = L.circle([13.152, 123.750], {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);

    // Create a map legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const riskLevels = ['High Risk', 'Medium Risk', 'Safe Zone'];
        const colors = ['red', 'orange', 'green'];
        for (let i = 0; i < riskLevels.length; i++) {
            div.innerHTML +=
                `<p><span class="legend-box" style="background-color:${colors[i]}"></span> ${riskLevels[i]}</p>`;
        }
        return div;
    };
    legend.addTo(map);
}

// Initialize all features on page load
document.addEventListener("DOMContentLoaded", function () {
    initializeCharts();
    initializeMap();
});
