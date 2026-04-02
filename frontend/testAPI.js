const axios = require('axios');

async function testDashboards() {
    try {
        console.log("Logging in as Admin...");
        const adminLogin = await axios.post('http://localhost:5000/api/v1/auth/login', { email: 'admin@college.edu', password: 'password123' });
        const adminToken = adminLogin.data.token;
        console.log("Admin Token Received!");

        console.log("Fetching Admin Analytics...");
        const adminRes = await axios.get('http://localhost:5000/api/v1/dashboard/admin/analytics', { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log("Admin Analytics Data:", adminRes.data);

        console.log("Logging in as Faculty...");
        const facLogin = await axios.post('http://localhost:5000/api/v1/auth/login', { email: 'abijith2310597@ssn.edu.in', password: 'password123' });
        const facToken = facLogin.data.token;
        console.log("Faculty Token Received!");

        console.log("Fetching Faculty Dashboard...");
        const facRes = await axios.get('http://localhost:5000/api/v1/dashboard/faculty', { headers: { Authorization: `Bearer ${facToken}` } });
        console.log("Faculty Data:", facRes.data);

    } catch (e) {
        console.error("Test Failed!", e.response ? e.response.data : e.message);
    }
}
testDashboards();
