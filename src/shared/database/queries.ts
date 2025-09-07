import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { PushupLog, DatabaseStats, PushupSummary } from '../types/database';

// Insert a new pushup log
export const insertPushupLog = async (
  db: SQLiteDatabase,
  count: number,
  duration: number,
  date?: string,
): Promise<number> => {
  const currentDate = date || new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const insertQuery = `
    INSERT INTO pushup_logs (date, pushup_count, duration, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    console.log('Inserting pushup log:', { currentDate, count, duration, now });
    const result = await db.executeSql(insertQuery, [
      currentDate,
      count,
      duration,
      now,
      now,
    ]);

    const insertId = result.insertId || result.rowsAffected;
    console.log('Pushup log inserted successfully:', insertId);
    return insertId;
  } catch (error) {
    console.error('Error inserting pushup log:', error);
    throw error;
  }
};

// Get all pushup logs
export const getAllPushupLogs = async (db: SQLiteDatabase): Promise<PushupLog[]> => {
  const selectQuery = `
    SELECT id, date, pushup_count, duration, created_at, updated_at
    FROM pushup_logs
    ORDER BY date DESC, created_at DESC
  `;

  try {
    const result = await db.executeSql(selectQuery);
    const logs: PushupLog[] = [];

    // Handle empty database gracefully
    if (!result || !result[0].rows || result[0].rows.length === 0) {
      return [];
    }

    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      logs.push({
        id: row.id,
        date: row.date,
        pushup_count: row.pushup_count,
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
};

// Get pushup logs for a specific date
export const getPushupLogsByDate = async (
  db: SQLiteDatabase,
  date: string,
): Promise<PushupLog[]> => {
  const selectQuery = `
    SELECT id, date, pushup_count, duration, created_at, updated_at
    FROM pushup_logs
    WHERE date = ?
    ORDER BY created_at DESC
  `;

  try {
    const result = await db.executeSql(selectQuery, [date]);
    const logs: PushupLog[] = [];

    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      logs.push({
        id: row.id,
        date: row.date,
        pushup_count: row.pushup_count,
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
};

// Get pushup summary by date
export const getPushupSummaryByDate = async (
  db: SQLiteDatabase,
  date: string,
): Promise<PushupSummary | null> => {
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
    const result = await db.executeSql(selectQuery, [date]);

    if (result[0].rows.length > 0) {
      const row = result[0].rows.item(0);
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
};

// Get database statistics
export const getDatabaseStats = async (db: SQLiteDatabase): Promise<DatabaseStats> => {
  try {
    // Total pushups and sessions
    const totalResult = await db.executeSql(`
      SELECT 
        SUM(pushup_count) as totalPushups,
        COUNT(*) as totalSessions,
        AVG(pushup_count) as averagePerSession,
        MAX(duration) as longestSession
      FROM pushup_logs
    `);

    // Handle NULL values from empty database
    let totalPushups = 0;
    let totalSessions = 0;
    let averagePerSession = 0;
    let longestSession = 0;

    if (totalResult && totalResult[0].rows && totalResult[0].rows.length > 0) {
      const totals = totalResult[0].rows.item(0);
      totalPushups = totals.totalPushups || 0;
      totalSessions = totals.totalSessions || 0;
      averagePerSession = totals.averagePerSession || 0;
      longestSession = totals.longestSession || 0;
    }

    // Get streak data
    const streakResult = await db.executeSql(`
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
    if (!streakResult || !streakResult[0].rows || streakResult[0].rows.length === 0) {
      return {
        totalPushups: totalPushups || 0,
        totalSessions: totalSessions || 0,
        averagePerSession: Math.round(averagePerSession || 0),
        longestSession: longestSession || 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    for (let i = 0; i < streakResult[0].rows.length; i++) {
      const row = streakResult[0].rows.item(i);
      const currentDate = new Date(row.date);

      if (lastDate === null) {
        // First date
        lastDate = currentDate;
        tempStreak = 1;
      } else {
        const dayDiff = Math.floor(
          (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        lastDate = currentDate;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak
    if (streakResult.rows.length > 0) {
      const latestDate = new Date(streakResult.rows.item(0).date);
      const todayDate = new Date(today);
      const dayDiff = Math.floor(
        (todayDate.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayDiff <= 1) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
    }

    return {
      totalPushups: totalPushups || 0,
      totalSessions: totalSessions || 0,
      averagePerSession: Math.round(averagePerSession || 0),
      longestSession: longestSession || 0,
      currentStreak: currentStreak,
      longestStreak: longestStreak,
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
};

// Delete a pushup log by ID
export const deletePushupLog = async (db: SQLiteDatabase, id: number): Promise<void> => {
  const deleteQuery = `DELETE FROM pushup_logs WHERE id = ?`;

  try {
    await db.executeSql(deleteQuery, [id]);
    console.log(`Pushup log ${id} deleted successfully`);
  } catch (error) {
    console.error('Error deleting pushup log:', error);
    throw error;
  }
};

// Update a pushup log
export const updatePushupLog = async (
  db: SQLiteDatabase,
  id: number,
  count: number,
  duration: number,
): Promise<void> => {
  const now = new Date().toISOString();
  const updateQuery = `
    UPDATE pushup_logs 
    SET pushup_count = ?, duration = ?, updated_at = ?
    WHERE id = ?
  `;

  try {
    await db.executeSql(updateQuery, [count, duration, now, id]);
    console.log(`Pushup log ${id} updated successfully`);
  } catch (error) {
    console.error('Error updating pushup log:', error);
    throw error;
  }
};