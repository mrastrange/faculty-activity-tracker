const axios = require('axios');

async function testApproval() {
    try {
        console.log("Logging in as Admin...");
        const res = await axios.post('http://localhost:5000/api/v1/auth/login', { email: 'admin@college.edu', password: 'password123' });
        const token = res.data.token;

        console.log("Testing Approval on ID 3...");
        const approveRes = await axios.put('http://localhost:5000/api/v1/activities/3/review',
            { status: 'Approved', review_comments: 'Good', assigned_score: 25 },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Approve Status:", approveRes.status);
        console.log("Approve Data:", approveRes.data);
    } catch (e) {
        console.error("Test Failed!", e.response ? e.response.data : e.message);
    }
}
testApproval();
