import { SQLiteDatabase } from 'react-native-sqlite-storage';

// Create pushup_logs table
export const createPushupLogsTable = async (db: SQLiteDatabase): Promise<void> => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS pushup_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      pushup_count INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  try {
    await db.executeSql(createTableQuery);
    console.log('Pushup logs table created successfully');
  } catch (error) {
    console.error('Error creating pushup logs table:', error);
    throw new Error('Failed to create pushup logs table');
  }
};

// Initialize all tables
export const createTables = async (db: SQLiteDatabase): Promise<void> => {
  try {
    await createPushupLogsTable(db);
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw new Error('Failed to create tables');
  }
};

// Drop tables (for development/testing purposes)
export const dropTables = async (db: SQLiteDatabase): Promise<void> => {
  const dropQuery = `DROP TABLE IF EXISTS pushup_logs`;
  
  try {
    await db.executeSql(dropQuery);
    console.log('Tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw new Error('Failed to drop tables');
  }
};