const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect('mongodb://mongo:FdGeAgfaDd13E43bE2eE424CegF-3a45@roundhouse.proxy.rlwy.net:42383', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
app.use(cors());

// Define a User schema
const userSchema = new mongoose.Schema({
  address: String,
  balance: String,
});

const User = mongoose.model('User', userSchema);

// Express middleware to parse JSON
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Endpoint to handle MetaMask connection
app.post('/connect', async (req, res) => {
  try {
    const { address } = req.body;

    // Make a request to get user balance using MetaMask API or Ethereum Node
    const balanceResponse = await axios.get(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&apikey=YOUR_ETHERSCAN_API_KEY`);
    const balance = balanceResponse.data.result;

    // Save or update user information in MongoDB
    const existingUser = await User.findOne({ address });

    if (existingUser) {
      existingUser.balance = balance;
      await existingUser.save();
      res.json(existingUser);
    } else {
      const newUser = new User({ address, balance });
      await newUser.save();
      res.json(newUser);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
