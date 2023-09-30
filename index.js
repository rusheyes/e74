const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Import mysql2/promise for connection pooling
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust the connection limit as needed
  queueLimit: 0
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/api/blogs', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT image, id, description, subImage1, subImage2, subImage3, subImage4, learnMoreLink FROM db_capstone.tbl_blog');
    res.json(results);
  } catch (error) {
    console.error('Error querying MySQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/register', upload.single('image'), async (req, res) => {
  const { Email, Password, TPN, BTN, TIN, BAD, NUM } = req.body;
  const IMG = req.file.buffer; // Image data as a buffer

  try {
    const [results] = await pool.query(
      'INSERT INTO tbl_registration (Email, Password, TPN, BTN, TIN, BAD, NUM, IMG) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [Email, Password, TPN, BTN, TIN, BAD, NUM, IMG]
    );
    res.status(201).json({ message: 'Registration successful', registrationId: results.insertId });
  } catch (error) {
    console.error('Error inserting data into tbl_registration:', error);
    res.status(500).json({ error: 'Database Error' });
  }
});

app.post('/api/login', (req, res) => {
  const { Email, Password } = req.body;

  const query = `
    SELECT * FROM tbl_registration 
    WHERE Email = ? AND Password = ?
  `;

  db.query(query, [Email, Password], (err, results) => {
    if (err) {
      console.error('Error querying tbl_registration:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length > 0) {
      // User found, login successful
      res.json({ message: 'Login successful', userData: results[0] });
    } else {
      // No matching user found, login failed
      res.status(401).json({ error: 'Invalid email or password' });
    }
  });
});

app.get('/api/user/:email/:tpn', async (req, res) => {
  const { email, tpn } = req.params;

  const query = `
    SELECT * FROM tbl_registration 
    WHERE Email = ? AND TPN = ?
  `;

  try {
    const [results] = await pool.query(query, [email, tpn]);

    if (results.length > 0) {
      // User found, send user data
      res.json({ userData: results[0] });
    } else {
      // No matching user found
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error querying tbl_registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

