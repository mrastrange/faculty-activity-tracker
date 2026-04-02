async function testApproval() {
    try {
        console.log("Logging in as Admin...");
        const res = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@college.edu', password: 'password123' })
        });
        const data = await res.json();
        const token = data.token;

        console.log("Testing Approval on ID 3...");
        const approveRes = await fetch('http://localhost:5000/api/v1/activities/3/review', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Approved', review_comments: 'Good', assigned_score: 25 })
        });

        console.log("Approve Status:", approveRes.status);
        console.log("Approve Data:", await approveRes.text());
    } catch (e) {
        console.error("Test Failed!", e.message);
    }
}
testApproval();
