// Initialize the charts
const moistureCtx = document.getElementById('moistureChart').getContext('2d');
const vibrationCtx = document.getElementById('vibrationChart').getContext('2d');
const barCtx = document.getElementById('barChart').getContext('2d');
const pieCtx = document.getElementById('pieChart').getContext('2d');

// Sample Data for Moisture and Vibration Levels
const moistureData = {
    labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00'], // Time
    datasets: [{
        label: 'Moisture Level (%)',
        data: [30, 45, 50, 60, 55, 50], // Moisture levels over time
        borderColor: 'rgba(75, 192, 192, 1)', // Line color
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Fill color
        fill: true,
        tension: 0.1
    }]
};

const vibrationData = {
    labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00'], // Time
    datasets: [{
        label: 'Vibration Level (%)',
        data: [10, 15, 20, 25, 30, 35], // Vibration levels over time
        borderColor: 'rgba(255, 99, 132, 1)', // Line color
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Fill color
        fill: true,
        tension: 0.1
    }]
};

// Create Moisture Level Chart
const moistureChart = new Chart(moistureCtx, {
    type: 'line',
    data: moistureData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return tooltipItem.raw + '%'; // Format the tooltip
                    }
                }
            }
        }
    }
});

// Create Vibration Level Chart
const vibrationChart = new Chart(vibrationCtx, {
    type: 'line',
    data: vibrationData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return tooltipItem.raw + '%'; // Format the tooltip
                    }
                }
            }
        }
    }
});

// Bar Chart - Comparing Moisture and Vibration Levels
const barData = {
    labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00'], // Time
    datasets: [
        {
            label: 'Moisture Level (%)',
            data: [30, 45, 50, 60, 55, 50], // Moisture levels
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        },
        {
            label: 'Vibration Level (%)',
            data: [10, 15, 20, 25, 30, 35], // Vibration levels
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }
    ]
};

const barChart = new Chart(barCtx, {
    type: 'bar',
    data: barData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return tooltipItem.raw + '%'; // Format the tooltip
                    }
                }
            }
        }
    }
});

// Pie Chart - Distribution of Data (Example: Moisture and Vibration Proportions)
const pieData = {
    labels: ['Moisture', 'Vibration'],
    datasets: [{
        label: 'Data Distribution',
        data: [55, 45], // Example: 55% moisture, 45% vibration
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1
    }]
};

const pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: pieData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return tooltipItem.raw + '%'; // Format the tooltip
                    }
                }
            }
        }
    }
});

// Update the charts with new data
function updateCharts(moistureLevel, vibrationLevel) {
    // Update moisture chart
    moistureChart.data.datasets[0].data.push(moistureLevel);
    moistureChart.data.labels.push(getCurrentTime()); // Add current time label
    moistureChart.update();

    // Update vibration chart
    vibrationChart.data.datasets[0].data.push(vibrationLevel);
    vibrationChart.data.labels.push(getCurrentTime()); // Add current time label
    vibrationChart.update();

    // Update bar chart
    barChart.data.datasets[0].data.push(moistureLevel);
    barChart.data.datasets[1].data.push(vibrationLevel);
    barChart.data.labels.push(getCurrentTime());
    barChart.update();

    // Update pie chart (example: random distribution of data)
    pieChart.data.datasets[0].data = [Math.random() * 100, 100 - Math.random() * 100];
    pieChart.update();
}

// Dummy function for current time
function getCurrentTime() {
    let now = new Date();
    return now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
}

// Example of fetching and updating data (replace with actual data fetching)
setInterval(function() {
    let moistureLevel = Math.random() * 100; // Replace with actual data
    let vibrationLevel = Math.random() * 100; // Replace with actual data
    updateCharts(moistureLevel, vibrationLevel);
}, 5000); // Update every 5 seconds
