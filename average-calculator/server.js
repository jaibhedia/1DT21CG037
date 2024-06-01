const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

const windowSize = 10;
const numbersMap = {
  primes: 'primes',
  fibo: 'fibonacci',
  even: 'even',
  rand: 'random'
};

let windowState = [];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Average Calculator Microservice!');
});

app.get('/test/:numberid', async (req, res) => {
  const numberid = req.params.numberid;
  if (!numbersMap[numberid]) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const url = `http://20.244.56.144/test/${numbersMap[numberid]}`;

  try {
    const response = await axios.get(url, { timeout: 500 });
    const numbers = response.data.numbers;
    const uniqueNumbers = [...new Set(numbers)];

    const windowPrevState = [...windowState];
    windowState = [...windowState, ...uniqueNumbers].filter((value, index, self) => self.indexOf(value) === index).slice(-windowSize);

    const avg = windowState.reduce((a, b) => a + b, 0) / windowState.length;

    res.json({
      numbers: uniqueNumbers,
      windowPrevState,
      windowCurrState: windowState,
      avg: avg.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
