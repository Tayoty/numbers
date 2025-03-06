// app.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3800;

// Enable CORS for all routes
app.use(cors());

// Function to check if a number is prime
function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  
  let i = 5;
  while (i * i <= num) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
    i += 6;
  }
  return true;
}

// Function to check if a number is perfect
// A perfect number is a positive integer that is equal to the sum of its proper positive divisors
function isPerfect(num) {
  if (num <= 1) return false;
  
  let sum = 1;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) {
      sum += i;
      if (i !== num / i) {
        sum += num / i;
      }
    }
  }
  
  return sum === num;
}

// Function to check if a number is an Armstrong number
// An Armstrong number is a number that is equal to the sum of its own digits each raised to the power of the number of digits
function isArmstrong(num) {
  const numStr = num.toString();
  const power = numStr.length;
  const sum = numStr.split('').reduce((acc, digit) => acc + Math.pow(parseInt(digit), power), 0);
  return sum === num;
}

// Function to calculate the sum of digits
function digitSum(num) {
  return num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
}

// Function to determine if a number is odd or even
function getParityProperty(num) {
  return num % 2 === 0 ? "even" : "odd";
}

// Route for the number classification endpoint
app.get('/api/classify-number', async (req, res) => {
  const { number } = req.query;
  
  // Validate input
  const parsedNumber = parseInt(number);
  
  if (isNaN(parsedNumber) || parsedNumber.toString() !== number.toString()) {
    return res.status(400).json({
      number: number,
      error: true
    });
  }
  
  try {
    // Get fun fact from Numbers API
    let funFact;
    try {
      const response = await axios.get(`http://numbersapi.com/${parsedNumber}/math`);
      funFact = response.data;
    } catch (error) {
      // If Numbers API fails, create a default fun fact
      if (isArmstrong(parsedNumber)) {
        funFact = `${parsedNumber} is an Armstrong number because ${parsedNumber.toString().split('').map((digit, _, arr) => `${digit}^${arr.length}`).join(' + ')} = ${parsedNumber}`;
      } else {
        funFact = `${parsedNumber} is ${isPrime(parsedNumber) ? 'a prime number' : 'not a prime number'}.`;
      }
    }
    
    // Calculate properties
    const properties = [];
    
    // Check if Armstrong
    if (isArmstrong(parsedNumber)) {
      properties.push('armstrong');
    }
    
    // Add parity (odd/even)
    properties.push(getParityProperty(parsedNumber));
    
    // Prepare response
    const response = {
      number: parsedNumber,
      is_prime: isPrime(parsedNumber),
      is_perfect: isPerfect(parsedNumber),
      properties: properties,
      digit_sum: digitSum(parsedNumber),
      fun_fact: funFact
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      number: parsedNumber,
      error: true,
      message: 'Internal server error'
    });
  }
});

// Root route for API information
app.get('/', (req, res) => {
  res.send(`
    <h1>Number Classification API</h1>
    <p>Use the endpoint: <code>/api/classify-number?number=YOUR_NUMBER</code> to get information about a number.</p>
    <p>Example: <a href="/api/classify-number?number=371">/api/classify-number?number=371</a></p>
  `);
});

// Start the server
app.listen(3800, () => {
  console.log(`Server running on port ${PORT}`);
});