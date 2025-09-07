import SQLite from 'react-native-sqlite-storage';
import { PushupLog, DatabaseStats, PushupSummary } from '../types/database';

// Enable promise-based API
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DATABASE_NAME = 'pushup.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAY_NAME = 'Pushup Tracker Database';
const DATABASE_SIZE = 200000; // 200KB

class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null;

  // Initialize database and create tables
  async initDatabase(): Promise<void> {
    try {
      console.log('Initializing database...');
      this.database = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: 'default',
      });

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // Create tables if they don't exist
  private async createTables(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const createPushupLogsTable = `
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
      await this.database.executeSql(createPushupLogsTable);
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  // Insert a new pushup log
  async insertPushupLog(
    count: number,
    duration: number,
    date?: string,
  ): Promise<number> {
    if (!this.database) {
      console.error('Database not initialized - attempting to initialize...');
      await this.initDatabase();
    }

    const currentDate = date || new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const insertQuery = `
      INSERT INTO pushup_logs (date, pushup_count, duration, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    try {
      console.log('Inserting pushup log:', {
        currentDate,
        count,
        duration,
        now,
      });
      const result = await this.database!.executeSql(insertQuery, [
        currentDate,
        count,
        duration,
        now,
        now,
      ]);

      console.log('Insert result:', result);

      const insertId = result[0].insertId || result[0].rowsAffected;
      console.log('Pushup log inserted successfully:', insertId);

      // Verify the insertion by fetching the latest log
      const verifyResult = await this.database!.executeSql(
        'SELECT * FROM pushup_logs',
      );
      console.log(verifyResult);

      // if (verifyResult.rows.length > 0) {
      //   console.log('Verified saved log:', verifyResult.rows.item(0));
      // }

      return insertId;
    } catch (error) {
      console.error('Error inserting pushup log:', error);
      throw error;
    }
  }

  // Get all pushup logs
  async getAllPushupLogs(): Promise<PushupLog[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const selectQuery = `
      SELECT id, date, pushup_count, duration, created_at, updated_at
      FROM pushup_logs
      ORDER BY date DESC, created_at DESC
    `;

    try {
      const result = await this.database.executeSql(selectQuery);
      const logs: PushupLog[] = [];

      // Handle empty database gracefully
      if (!result || !result.rows || result.rows.length === 0) {
        return [];
      }

      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        logs.push({
          id: row.id,
          date: row.date,
          pushup_count: row.count,
          duration: row.duration,
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
      }

      return logs;
    } catch (error) {
      console.error('Error getting pushup logs:', error);
      throw error;
    }
  }

  // Get pushup logs for a specific date
  async getPushupLogsByDate(date: string): Promise<PushupLog[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const selectQuery = `
      SELECT id, date, pushup_count, duration, created_at, updated_at
      FROM pushup_logs
      WHERE date = ?
      ORDER BY created_at DESC
    `;

    try {
      const result = await this.database.executeSql(selectQuery, [date]);
      const logs: PushupLog[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        logs.push({
          id: row.id,
          date: row.date,
          pushup_count: row.count,
          duration: row.duration,
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
      }

      return logs;
    } catch (error) {
      console.error('Error getting pushup logs by date:', error);
      throw error;
    }
  }

  // Get pushup summary by date
  async getPushupSummaryByDate(date: string): Promise<PushupSummary | null> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const selectQuery = `
      SELECT 
        date,
        SUM(pushup_count) as totalCount,
        SUM(duration) as totalDuration,
        COUNT(*) as sessionCount
      FROM pushup_logs
      WHERE date = ?
      GROUP BY date
    `;

    try {
      const result = await this.database.executeSql(selectQuery, [date]);

      if (result.rows.length > 0) {
        const row = result.rows.item(0);
        return {
          date: row.date,
          totalCount: row.totalCount,
          totalDuration: row.totalDuration,
          sessionCount: row.sessionCount,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting pushup summary:', error);
      throw error;
    }
  }

  // Get database statistics
  async getDatabaseStats(): Promise<DatabaseStats> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      // Total pushups and sessions
      const totalResult = await this.database.executeSql(`
        SELECT 
          SUM(pushup_count) as totalPushups,
          COUNT(*) as totalSessions,
          AVG(pushup_count) as averagePerSession,
          MAX(duration) as longestSession
        FROM pushup_logs
      `);
      console.log('totalResult', totalResult);

      // Handle NULL values from empty database
      let totalPushups = 0;
      let totalSessions = 0;
      let averagePerSession = 0;
      let longestSession = 0;

      if (totalResult && totalResult.rows && totalResult.rows.length > 0) {
        const totals = totalResult.rows.item(0);
        totalPushups = totals.totalPushups || 0;
        totalSessions = totals.totalSessions || 0;
        averagePerSession = totals.averagePerSession || 0;
        longestSession = totals.longestSession || 0;
      }

      // Get streak data
      const streakResult = await this.database.executeSql(`
        SELECT date FROM pushup_logs
        GROUP BY date
        ORDER BY date DESC
      `);

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate = null;

      const today = new Date().toISOString().split('T')[0];

      // Handle empty streak data gracefully
      if (
        !streakResult ||
        !streakResult.rows ||
        streakResult.rows.length === 0
      ) {
        return {
          totalPushups: totalPushups || 0,
          totalSessions: totalSessions || 0,
          averagePerSession: Math.round(averagePerSession || 0),
          longestSession: longestSession || 0,
          currentStreak: 0,
          longestStreak: 0,
        };
      }

      for (let i = 0; i < streakResult.rows.length; i++) {
        const row = streakResult.rows.item(i);
        const currentDate = new Date(row.date);

        if (lastDate === null) {
          // First date
          lastDate = currentDate;
          tempStreak = 1;
        } else {
          const dayDiff = Math.floor(
            (lastDate.getTime() - currentDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          if (dayDiff === 1) {
            // Consecutive day
            tempStreak++;
          } else if (dayDiff > 1) {
            // Broken streak
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }

          lastDate = currentDate;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);

      // Check if today is part of current streak
      try {
        const todayLogs = await this.getPushupLogsByDate(today);
        if (todayLogs && todayLogs.length > 0) {
          currentStreak = tempStreak;
        } else {
          // Check if yesterday was part of streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const yesterdayLogs = await this.getPushupLogsByDate(yesterdayStr);

          if (yesterdayLogs && yesterdayLogs.length > 0) {
            currentStreak = tempStreak;
          } else {
            currentStreak = 0;
          }
        }
      } catch (error) {
        console.warn('Error checking streak dates:', error);
        currentStreak = 0;
      }

      return {
        totalPushups: totalPushups || 0,
        totalSessions: totalSessions || 0,
        averagePerSession: Math.round(averagePerSession || 0),
        longestSession: longestSession || 0,
        currentStreak,
        longestStreak,
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  // Delete a pushup log
  async deletePushupLog(id: number): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const deleteQuery = 'DELETE FROM pushup_logs WHERE id = ?';

    try {
      await this.database.executeSql(deleteQuery, [id]);
      console.log('Pushup log deleted successfully:', id);
    } catch (error) {
      console.error('Error deleting pushup log:', error);
      throw error;
    }
  }

  // Update a pushup log
  async updatePushupLog(
    id: number,
    count: number,
    duration: number,
  ): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const updateQuery = `
      UPDATE pushup_logs 
      SET pushup_count = ?, duration = ?, updated_at = ?
      WHERE id = ?
    `;

    try {
      await this.database.executeSql(updateQuery, [
        count,
        duration,
        new Date().toISOString(),
        id,
      ]);
      console.log('Pushup log updated successfully:', id);
    } catch (error) {
      console.error('Error updating pushup log:', error);
      throw error;
    }
  }

  // Close database connection
  async closeDatabase(): Promise<void> {
    if (this.database) {
      try {
        await this.database.close();
        this.database = null;
        console.log('Database closed successfully');
      } catch (error) {
        console.error('Error closing database:', error);
        throw error;
      }
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService;
