import express from 'express';
import cors from 'cors';
import { setupDb } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

const PORT = process.env.PORT || 3001;

let db;

// Initialize Database
setupDb().then((database) => {
  db = database;
  console.log('Database initialized successfully.');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// -- Authentication API --

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await db.run(
      'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password] // Storing plaintext for demo brevity, though bcrypt is standard
    );
    res.status(201).json({ id: result.lastID, name, email });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await db.get('SELECT * FROM Users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Success
    res.json({ id: user.id, name: user.name, email: user.email, is_admin: Boolean(user.is_admin) });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Update User Details
app.put('/api/auth/update-details', async (req, res) => {
  const { userId, name, email } = req.body;
  
  if (!userId || !name || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await db.get('SELECT * FROM Users WHERE email = ? AND id != ?', [email, userId]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    await db.run('UPDATE Users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);
    res.json({ id: userId, name, email, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update details error:', err);
    res.status(500).json({ error: 'Failed to update profile details' });
  }
});

// Update Password
app.put('/api/auth/update-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await db.get('SELECT * FROM Users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    await db.run('UPDATE Users SET password = ? WHERE id = ?', [newPassword, userId]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// -- Bookings API --

// Create Booking
app.post('/api/bookings', async (req, res) => {
  const { user_id, flight_id, airline, source, destination, departure_time, price, seat_number, payment_status } = req.body;
  
  if (!user_id || !flight_id || !seat_number) {
    return res.status(400).json({ error: 'Missing required booking details (including seat)' });
  }

  try {
    // Check if seat is already taken
    const existing = await db.get('SELECT * FROM Bookings WHERE flight_id = ? AND seat_number = ? AND status != ?', [flight_id, seat_number, 'Cancelled']);
    if (existing) {
      return res.status(409).json({ error: 'Seat is no longer available' });
    }

    const result = await db.run(
      `INSERT INTO Bookings (user_id, flight_id, airline, source, destination, departure_time, price, seat_number, payment_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, flight_id, airline, source, destination, departure_time, price, seat_number, payment_status || 'Paid']
    );
    res.status(201).json({ id: result.lastID, message: 'Booking confirmed' });
  } catch (err) {
    console.error('Booking Creation Error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get Booked Seats for a Flight
app.get('/api/flights/:id/seats', async (req, res) => {
  try {
    const bookings = await db.all(
      'SELECT seat_number FROM Bookings WHERE flight_id = ? AND status != ?',
      [req.params.id, 'Cancelled']
    );
    const bookedSeats = bookings.map(b => b.seat_number);
    res.json(bookedSeats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

// -- Admin API --

// Get all bookings (Admin)
app.get('/api/admin/bookings', async (req, res) => {
  const { adminId } = req.query;
  try {
    const admin = await db.get('SELECT is_admin FROM Users WHERE id = ?', [adminId]);
    if (!admin || !admin.is_admin) return res.status(403).json({ error: 'Unauthorized' });

    const bookings = await db.all(`
      SELECT b.*, u.name as user_name, u.email as user_email 
      FROM Bookings b 
      JOIN Users u ON b.user_id = u.id 
      ORDER BY b.created_at DESC
    `);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin bookings' });
  }
});

// Update booking status (Admin)
app.put('/api/admin/bookings/:id/status', async (req, res) => {
  const { adminId, status } = req.body;
  try {
    const admin = await db.get('SELECT is_admin FROM Users WHERE id = ?', [adminId]);
    if (!admin || !admin.is_admin) return res.status(403).json({ error: 'Unauthorized' });

    await db.run('UPDATE Bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Get User Bookings
app.get('/api/bookings/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const bookings = await db.all(
      'SELECT * FROM Bookings WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
