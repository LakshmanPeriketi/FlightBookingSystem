import { setupDb } from './db.js';

async function seedAdmin() {
  try {
    const db = await setupDb();
    
    // Check if admin already exists
    const admin = await db.get('SELECT * FROM Users WHERE email = ?', ['admin@flight.com']);
    
    if (!admin) {
      await db.run(
        'INSERT INTO Users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
        ['System Administrator', 'admin@flight.com', 'admin123', 1]
      );
      console.log('Admin user successfully seeded. (admin@flight.com / admin123)');
    } else {
      console.log('Admin user already exists.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err);
    process.exit(1);
  }
}

seedAdmin();
