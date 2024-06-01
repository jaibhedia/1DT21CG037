const express = require('express');
const axios = require('axios');

const app = express();
const port = 3001;

app.use(express.json());

app.post('/register', async (req, res) => {
  const url = 'http://20.244.56.144/test/register';
  const payload = {
    companyName: "DSATM",
    ownerName: "Shantanu Swami",
    rollNo: "1DT21CG037",
    ownerEmail: "shannswami1234@gmail.com",
    accessCode: "sMYzGa"
  };

  try {
    const response = await axios.post(url, payload);
    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
