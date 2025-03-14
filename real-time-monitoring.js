// Initialize the map
const map = L.map('map').setView([12.6711, 123.8794], 15); // Center the map on a location

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Global variable to hold the marker
let marker = null;

// Sample function to simulate real-time data (replace this with actual sensor data fetching logic)
function getRealTimeData() {
    return {
        latitude: 12.6711,
        longitude: 123.8794,
        vibration: Math.floor(Math.random() * 100), // Simulate a vibration level
        moisture: Math.floor(Math.random() * 100),   // Simulate a moisture level
        lastUpdated: new Date().toLocaleTimeString() // Time of last update
    };
}

// Function to update the map and the data info
function updateMonitoringData() {
    const data = getRealTimeData();  // Get real-time data

    // If marker exists, update it; if not, create a new one
    if (marker) {
        marker.setLatLng([data.latitude, data.longitude]); // Update position
    } else {
        marker = L.marker([data.latitude, data.longitude]).addTo(map); // Create new marker
    }

    // Change the marker color based on the data (for example, vibration level)
    let color = 'green'; // Default color
    if (data.vibration > 70) {
        color = 'red'; // High vibration -> Red
    } else if (data.vibration > 30) {
        color = 'orange'; // Medium vibration -> Orange
    }

    marker.setIcon(L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; border-radius: 50%; width: 30px; height: 30px;"></div>`,
        iconSize: [30, 30]
    }));

    // Optionally, you can show the data in a popup
    marker.bindPopup(`<b>Vibration: ${data.vibration}%</b><br>Moisture: ${data.moisture}%`)
          .openPopup();

    // Update the data displayed on the page
    document.getElementById("vibration-level").textContent = data.vibration + "%";
    document.getElementById("moisture-level").textContent = data.moisture + "%";

    // Update the sensor data table
    document.getElementById("moisture-level-table").textContent = data.moisture + "%";
    document.getElementById("vibration-level-table").textContent = data.vibration + "%";
    document.getElementById("moisture-status").textContent = "✔️ Updated";
    document.getElementById("vibration-status").textContent = "✔️ Updated";
    document.getElementById("moisture-last-updated").textContent = data.lastUpdated;
    document.getElementById("vibration-last-updated").textContent = data.lastUpdated;
}

// Function to fetch sensor data (Example)
function fetchSensorData() {
    updateMonitoringData(); // Refresh the monitoring data
}

// Function to close real-time monitoring (Example)
function closeRealTimeMonitoring() {
    window.location.href = 'index.html'; // Redirect to the homepage (or another page of your choice)
}

// Optional: You can initialize the page to load the initial data
function initializePage() {
    // Call fetchSensorData on page load to display the initial data
    fetchSensorData();

    // Optionally, you can display the current time (could be real-time, here it's just static)
    const currentTimeElement = document.getElementById('current-time');
    setInterval(() => {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString(); // Formats the current time
        currentTimeElement.innerText = `⏰ Current Time: ${formattedTime}`;
    }, 1000); // Update time every second
}

// Call updateMonitoringData every 5 seconds (to simulate real-time updates)
setInterval(updateMonitoringData, 5000);

// Call initializePage when the page loads
window.onload = initializePage;
