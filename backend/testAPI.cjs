const axios = require('axios');

async function testDashboards() {
    try {
        console.log("Logging in as Admin...");
        const adminLogin = await axios.post('http://localhost:5000/api/v1/auth/login', { email: 'admin@college.edu', password: 'password123' });
        const adminToken = adminLogin.data.token;
        console.log("Admin Token Received!");

        console.log("Fetching Admin Analytics...");
        const adminRes = await axios.get('http://localhost:5000/api/v1/dashboard/admin/analytics', { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log("Admin Analytics Status:", adminRes.status);

        console.log("Fetching All Activities...");
        const allActs = await axios.get('http://localhost:5000/api/v1/activities/all', { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log("All Activities Status:", allActs.status);

        console.log("Logging in as Faculty...");
        const facLogin = await axios.post('http://localhost:5000/api/v1/auth/login', { email: 'abijith2310597@ssn.edu.in', password: 'password123' });
        const facToken = facLogin.data.token;
        console.log("Faculty Token Received!");

        console.log("Fetching Faculty Dashboard...");
        const facRes = await axios.get('http://localhost:5000/api/v1/dashboard/faculty', { headers: { Authorization: `Bearer ${facToken}` } });
        console.log("Faculty Dashboard Status:", facRes.status);

        console.log("Fetching My Activities...");
        const myActs = await axios.get('http://localhost:5000/api/v1/activities', { headers: { Authorization: `Bearer ${facToken}` } });
        console.log("My Activities Status:", myActs.status);

        console.log("Tests Passed - Server Did Not Crash!");
    } catch (e) {
        console.error("Test Failed!", e.response ? e.response.data : e.message);
    }
}
testDashboards();
