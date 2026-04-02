async function testDashboards() {
    try {
        console.log("Logging in as Admin...");
        const adminLogin = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@college.edu', password: 'password123' })
        });
        const adminData = await adminLogin.json();
        const adminToken = adminData.token;
        console.log("Admin Token Received!");

        console.log("Fetching Admin Analytics...");
        const adminRes = await fetch('http://localhost:5000/api/v1/dashboard/admin/analytics', { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log("Admin Analytics Status:", adminRes.status);
        console.log("Admin Analytics Data:", await adminRes.json());

        console.log("Fetching All Activities...");
        const allActs = await fetch('http://localhost:5000/api/v1/activities/all', { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log("All Activities Status:", allActs.status);
        console.log("All Activities:", await allActs.json());

        console.log("Logging in as Faculty...");
        const facLogin = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'abijith2310597@ssn.edu.in', password: 'password123' })
        });
        const facData = await facLogin.json();
        const facToken = facData.token;
        console.log("Faculty Token Received!");

        console.log("Fetching Faculty Dashboard...");
        const facRes = await fetch('http://localhost:5000/api/v1/dashboard/faculty', { headers: { Authorization: `Bearer ${facToken}` } });
        console.log("Faculty Dashboard Status:", facRes.status);
        console.log("Faculty Dashboard Data:", await facRes.json());

        console.log("Fetching My Activities...");
        const myActs = await fetch('http://localhost:5000/api/v1/activities', { headers: { Authorization: `Bearer ${facToken}` } });
        console.log("My Activities Status:", myActs.status);
        console.log("My Activities Data:", await myActs.json());

        console.log("Tests Passed - Server Did Not Crash!");
    } catch (e) {
        console.error("Test Failed!", e.message);
    }
}
testDashboards();
