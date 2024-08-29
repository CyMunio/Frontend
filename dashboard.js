document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('networkVisualization');

    // Scene setup with sky blue background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa1f0f4); // Sky blue color

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 55);
    light.position.set(15, 15, 15).normalize();
    scene.add(light);

    const loader = new THREE.GLTFLoader();
    const nodes = [];
    const connections = [];

    // Function to add a 3D model as a node with custom scaling
    const addModel = (path, position, scale) => {
        loader.load(path, (gltf) => {
            const model = gltf.scene;
            model.scale.set(scale.x, scale.y, scale.z);
            model.position.set(position.x, position.y, position.z);
            scene.add(model);
            nodes.push(model);
        }, undefined, (error) => {
            console.error('An error happened while loading the model:', error);
        });
    };

   // Function to update dashboard components
const updateDashboard = (data) => {
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with ID "${id}" not found.`);
        }
    };

    updateElement('securityStatus', data.securityStatus);
    updateElement('totalVulnerabilities', data.totalVulnerabilities);
    updateElement('recentEvents', data.recentEvents.join(", "));
    updateElement('totalAnomalies', data.totalAnomalies);
    updateElement('protectionStatus', data.protectionStatus);

    // Update graphs and trends
    updateGraph('vulnerabilityTrends', data.vulnerabilityTrends);
    updateGraph('anomalyTrends', data.anomalyTrends);

    // More updates for other dashboard components...
};

  

    // Function to update a graph with data
    const updateGraph = (elementId, graphData) => {
        // Use a graphing library like Chart.js to render the graph
        const ctx = document.getElementById(elementId).getContext('2d');
        new Chart(ctx, {
            type: 'line', // or 'bar' for anomaly trends
            data: {
                labels: graphData.labels,
                datasets: [{
                    label: graphData.label,
                    data: graphData.data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    // Example dataset for 3D models
    const dataset = {
        "nodes": [
            { "id": 1, "type": "laptop", "position": { "x": -5, "y": 0, "z": 0 }, "scale": { "x": 3.3, "y": 3.3, "z": 3.3 } },
            { "id": 2, "type": "laptop", "position": { "x": 5, "y": 0, "z": 0 }, "scale": { "x": 3.3, "y": 3.3, "z": 3.3 } },
            { "id": 3, "type": "huawei_mate40pro", "position": { "x": 0, "y": 5, "z": 0 }, "scale": { "x": 3.2, "y": 3.2, "z": 3.2 } },
            { "id": 4, "type": "server_01", "position": { "x": 0, "y": -5, "z": 0 }, "scale": { "x": 0.2, "y": 0.2, "z": 0.2 } }
        ],
        "connections": [
            { "source": 1, "target": 2 },
            { "source": 2, "target": 3 },
            { "source": 3, "target": 4 }
        ]
    };

    // Add nodes based on dataset
    dataset.nodes.forEach(nodeData => {
        const path = `Assets/${nodeData.type}.glb`;
        addModel(path, nodeData.position, nodeData.scale);
    });

    // Add Connections based on dataset
    const addConnection = (source, target) => {
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0f969c });
        const points = [];
        points.push(source.position);
        points.push(target.position);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        connections.push(line);
    };

    // Wait for models to load before connecting
    setTimeout(() => {
        dataset.connections.forEach(conn => {
            const sourceNode = nodes.find(n => n.id === conn.source);
            const targetNode = nodes.find(n => n.id === conn.target);
            if (sourceNode && targetNode) {
                addConnection(sourceNode, targetNode);
            }
        });
    }, 1000);

    // Camera Position
    camera.position.z = 15;

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

  // Fetch and process data from API
  const fetchDataAndAnalyze = () => {
    fetch('http://localhost:3000/data')
        .then(response => response.json())
        .then(data => {
            // Check if the data object has the expected structure
            const ipInfo = data.ipInfo || {}; // Use an empty object as a fallback

            // Update dashboard components
            const categorizedData = analyzeNetworkData(data);
            updateDashboard(categorizedData);

            // Update IP information
            document.getElementById('ipAddress').textContent = ipInfo.ipAddress || 'Not available';
            document.getElementById('location').textContent = ipInfo.location || 'Not available';
            document.getElementById('organization').textContent = ipInfo.organization || 'Not available';
            document.getElementById('hostname').textContent = ipInfo.hostname || 'Not available';
        })
        .catch(error => console.error('Error fetching network infrastructure data:', error));
};



    // Function to analyze and categorize the data
   // Function to analyze and categorize the data
const analyzeNetworkData = (data) => {
    // Safeguard against undefined properties
    return {
        securityStatus: data.securityStatus || 'Good',
        totalVulnerabilities: data.vulnerabilities?.total || 0,
        recentEvents: data.events?.recent || [],
        totalAnomalies: data.anomalies?.total || 0,
        protectionStatus: data.protectionStatus || 'Active',
        vulnerabilityTrends: {
            labels: data.vulnerabilityTrends?.labels || [],
            data: data.vulnerabilityTrends?.data || [],
            label: 'Vulnerabilities Over Time'
        },
        anomalyTrends: {
            labels: data.anomalyTrends?.labels || [],
            data: data.anomalyTrends?.data || [],
            label: 'Anomalies Over Time'
        }
        // Add more processed data points here...
    };
};


    // Call the data fetch function on load
    fetchDataAndAnalyze();
});
document.addEventListener('DOMContentLoaded', function() {
    var toggleLink = document.getElementById('toggleHealthCheck');

    if (toggleLink) {
        toggleLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior

            var healthChecksSection = document.getElementById('health-checks');
            var systemHealthSection = document.querySelector('.system-health');

            // Toggle the 'show' class to slide in and out
            if (healthChecksSection.classList.contains('show')) {
                healthChecksSection.classList.remove('show');
                systemHealthSection.classList.remove('show');
            } else {
                healthChecksSection.classList.add('show');
                systemHealthSection.classList.add('show');
            }
        });
    }
});
document.getElementById('toggleAuditTrail').addEventListener('click', function() {
    const auditTrail = document.querySelector('.audit-trail');

    if (auditTrail.classList.contains('hidden')) {
        auditTrail.classList.remove('hidden');
        auditTrail.classList.add('show'); // Add show class to display smoothly
    } else {
        auditTrail.classList.add('hidden');
        auditTrail.classList.remove('show'); // Remove show class to hide smoothly
    }
});
var ctx = document.getElementById('pieChart').getContext('2d');
var pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['GDPR', 'HIPAA'],
        datasets: [{
            data: [85, 92], // Percentage values
            backgroundColor: ['#36a2eb', '#ff6384'], // Colors for each segment
            borderWidth: 1 // Border width for segments
        }]
    },
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return tooltipItem.label + ': ' + tooltipItem.raw + '%';
                    }
                }
            },
            legend: {
                display: true,
                position: 'top'
            }
        },
        cutout: '0%', // Ensure the chart is fully filled
        elements: {
            arc: {
                borderWidth: 1 // Border width for the arcs
            }
        }
    }
});