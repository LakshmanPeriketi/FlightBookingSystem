import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function setupDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Create Users table (updated for Phase 4)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Bookings table (updated for Phase 4)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      flight_id TEXT NOT NULL,
      airline TEXT NOT NULL,
      source TEXT NOT NULL,
      destination TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      price REAL NOT NULL,
      seat_number TEXT,
      payment_status TEXT DEFAULT 'Pending',
      status TEXT DEFAULT 'Confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users (id)
    )
  `);

  // Simple schema migration block (adds columns to existing tables if needed)
  try {
    const userCols = await db.all("PRAGMA table_info(Users)");
    if (!userCols.find(c => c.name === 'is_admin')) {
      await db.exec("ALTER TABLE Users ADD COLUMN is_admin BOOLEAN DEFAULT 0");
    }

    const bookingCols = await db.all("PRAGMA table_info(Bookings)");
    if (!bookingCols.find(c => c.name === 'seat_number')) {
      await db.exec("ALTER TABLE Bookings ADD COLUMN seat_number TEXT");
      await db.exec("ALTER TABLE Bookings ADD COLUMN payment_status TEXT DEFAULT 'Pending'");
    }
  } catch (err) {
    console.error("Migration check failed:", err);
  }

  return db;
}
