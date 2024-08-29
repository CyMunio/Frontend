const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Mock IP data
const mockIPData = {
    ipAddress: '192.168.1.1',
    location: 'New York, USA',
    organization: 'Example Corp',
    hostname: 'example.com'
};

// Get endpoint for network infrastructure data
app.get('/data', (req, res) => {
    res.json({
        securityStatus: 'Good',
        vulnerabilities: { total: 5 },
        events: { recent: ["Event1", "Event2", "Event3"] },
        anomalies: { total: 3 },
        protectionStatus: 'Active',
        ipInfo: mockIPData // Include IP information in the response
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
