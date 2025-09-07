import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

// Enable promise-based API
SQLite.enablePromise(true);

const DATABASE_NAME = 'pushup.db';
// const DATABASE_VERSION = '1.0';
// const DATABASE_DISPLAY_NAME = 'Pushup Tracker Database';
// const DATABASE_SIZE = 200000; // 200KB

// Connect to the database
export const connectToDatabase = async (): Promise<SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabase({
      name: DATABASE_NAME,
      createFromLocation: 1,
    });
    console.log('db', db);
    console.log('Database connected successfully');
    return db;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw new Error('Could not connect to database');
  }
};

// Close database connection
export const closeDatabase = async (db: SQLiteDatabase): Promise<void> => {
  try {
    if (db) {
      await db.close();
      console.log('Database closed successfully');
    }
  } catch (error) {
    console.error('Error closing database:', error);
  }
};
