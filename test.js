// test.js
async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/auth/update-details', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 1,
        name: 'Test',
        email: 'test@test.com'
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (e) {
    console.error(e);
  }
}

test();
