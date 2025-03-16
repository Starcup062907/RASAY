// Blynk API Token & URL
const BLYNK_AUTH_TOKEN = "aO103zCrTfgeA9WGwByZuO4eIflm63KW";  // Replace with your actual token
const BLYNK_API_URL = `https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}`;

// Virtual Pins
const MOISTURE_1_PIN = "V1";  
const MOISTURE_2_PIN = "V2";  
const MOISTURE_3_PIN = "V3";  
const VIBRATION_PIN = "V4";  

// Chart.js Instances
let moistureChart, vibrationChart, barChart, pieChart;

// Function to Initialize Charts
function initializeCharts() {
    const ctxMoisture = document.getElementById('moistureChart').getContext('2d');
    const ctxVibration = document.getElementById('vibrationChart').getContext('2d');
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const ctxPie = document.getElementById('pieChart').getContext('2d');

    moistureChart = new Chart(ctxMoisture, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Moisture 1', data: [], borderColor: '#42A5F5', backgroundColor: 'rgba(66, 165, 245, 0.2)', fill: true },
                { label: 'Moisture 2', data: [], borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.2)', fill: true },
                { label: 'Moisture 3', data: [], borderColor: '#FFC107', backgroundColor: 'rgba(255, 193, 7, 0.2)', fill: true }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } }
    });

    vibrationChart = new Chart(ctxVibration, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{ label: 'Vibration Level', data: [], borderColor: '#FFA726', backgroundColor: 'rgba(255, 167, 38, 0.2)', fill: true }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } }
    });

    barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ["Moisture 1", "Moisture 2", "Moisture 3", "Vibration"],
            datasets: [{ label: 'Sensor Levels', data: [0, 0, 0, 0], backgroundColor: ['#42A5F5', '#4CAF50', '#FFC107', '#FFA726'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ["Moisture 1", "Moisture 2", "Moisture 3", "Vibration"],
            datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#42A5F5', '#4CAF50', '#FFC107', '#FFA726'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}

// Function to Fetch Data from Blynk
async function fetchData() {
    try {
        const responses = await Promise.all([
            fetch(`${BLYNK_API_URL}&${MOISTURE_1_PIN}`),
            fetch(`${BLYNK_API_URL}&${MOISTURE_2_PIN}`),
            fetch(`${BLYNK_API_URL}&${MOISTURE_3_PIN}`),
            fetch(`${BLYNK_API_URL}&${VIBRATION_PIN}`)
        ]);

        const [moisture1Data, moisture2Data, moisture3Data, vibrationData] = await Promise.all(responses.map(res => res.text()));

        const moisture1 = parseFloat(moisture1Data) || 0;
        const moisture2 = parseFloat(moisture2Data) || 0;
        const moisture3 = parseFloat(moisture3Data) || 0;
        const vibration = parseFloat(vibrationData) || 0;

        updateCharts(moisture1, moisture2, moisture3, vibration);
    } catch (error) {
        console.error("Error fetching Blynk data:", error);
    }
}

// Function to Update Charts
function updateCharts(moisture1, moisture2, moisture3, vibration) {
    const timestamp = new Date().toLocaleTimeString();

    // Update Moisture Chart
    if (moistureChart.data.labels.length >= 10) {
        moistureChart.data.labels.shift();
        moistureChart.data.datasets[0].data.shift();
        moistureChart.data.datasets[1].data.shift();
        moistureChart.data.datasets[2].data.shift();
    }
    moistureChart.data.labels.push(timestamp);
    moistureChart.data.datasets[0].data.push(moisture1);
    moistureChart.data.datasets[1].data.push(moisture2);
    moistureChart.data.datasets[2].data.push(moisture3);
    moistureChart.update();

    // Update Vibration Chart
    if (vibrationChart.data.labels.length >= 10) {
        vibrationChart.data.labels.shift();
        vibrationChart.data.datasets[0].data.shift();
    }
    vibrationChart.data.labels.push(timestamp);
    vibrationChart.data.datasets[0].data.push(vibration);
    vibrationChart.update();

    // Update Bar Chart
    barChart.data.datasets[0].data = [moisture1, moisture2, moisture3, vibration];
    barChart.update();

    // Update Pie Chart
    pieChart.data.datasets[0].data = [moisture1, moisture2, moisture3, vibration];
    pieChart.update();
}

// Initialize Charts and Start Fetching Data
initializeCharts();
fetchData();
setInterval(fetchData, 10000); // Fetch Data Every 10 Seconds
