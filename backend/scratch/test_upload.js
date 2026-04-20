const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Attempt login with a known user if the above fails
    // But since db was reset and seeded, let's register a user first.
    return loginRes;
  } catch (e) {
    if (e.response && e.response.status === 401) {
       // Register
       await axios.post('http://localhost:5000/api/auth/register', {
         name: 'Test User',
         email: 'test@example.com',
         password: 'password123',
         phone: '123456789'
       });
       return axios.post('http://localhost:5000/api/auth/login', {
         email: 'test@example.com',
         password: 'password123'
       });
    }
    throw e;
  }
}

testUpload().then(async (loginRes) => {
    const cookies = loginRes.headers['set-cookie'];
    const user = loginRes.data.data.user;
    
    // Create a dummy image
    fs.writeFileSync('dummy_test.jpg', 'fake image content');
    
    const form = new FormData();
    form.append('name', 'Test User Updated');
    form.append('profileImage', fs.createReadStream('dummy_test.jpg'));
    
    const config = {
      headers: {
        ...form.getHeaders(),
        Cookie: cookies.join('; ')
      }
    };
    
    const updateRes = await axios.put(`http://localhost:5000/api/users/${user.id}`, form, config);
    console.log("UPDATE SUCCESS:", updateRes.data);
}).catch(err => {
    console.error("ERROR:", err.response ? err.response.data : err.message);
});
