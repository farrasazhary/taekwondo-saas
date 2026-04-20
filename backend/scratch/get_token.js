require('dotenv').config();
const axios = require('axios');

async function getToken() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'member@test.com',
      password: 'password123'
    });
    // Axios might not show cookies in response.data, but they are in headers
    console.log("HEADERS:", res.headers['set-cookie']);
  } catch (err) {
    console.error("LOGIN ERROR:", err.response?.data || err.message);
  }
}

getToken();
