import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import databaseService from '../services/database';
import { PushupLog, DatabaseStats, PushupSummary } from '../types/database';

interface DatabaseContextType {
  // Database state
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Pushup logs operations
  pushupLogs: PushupLog[];
  databaseStats: DatabaseStats | null;

  // CRUD operations
  savePushupLog: (
    count: number,
    duration: number,
    date?: string,
  ) => Promise<number>;
  getPushupLogs: () => Promise<PushupLog[]>;
  getPushupLogsByDate: (date: string) => Promise<PushupLog[]>;
  getPushupSummaryByDate: (date: string) => Promise<PushupSummary | null>;
  getDatabaseStats: () => Promise<DatabaseStats>;
  deletePushupLog: (id: number) => Promise<void>;
  updatePushupLog: (
    id: number,
    count: number,
    duration: number,
  ) => Promise<void>;

  // Utility functions
  refreshData: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined,
);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushupLogs, setPushupLogs] = useState<PushupLog[]>([]);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(
    null,
  );
  const initializeDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await databaseService.initDatabase();
      setIsInitialized(true);

      // Load initial data
      await refreshData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initialize database';
      setError(errorMessage);
      console.error('Database initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize database on mount
  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  const savePushupLog = async (
    count: number,
    duration: number,
    date?: string,
  ): Promise<number> => {
    try {
      setIsLoading(true);
      const id = await databaseService.insertPushupLog(count, duration, date);
      await refreshData();
      return id;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save pushup log';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getPushupLogs = async (): Promise<PushupLog[]> => {
    try {
      const logs = await databaseService.getAllPushupLogs();
      setPushupLogs(logs);
      return logs;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get pushup logs';
      setError(errorMessage);
      throw err;
    }
  };

  const getPushupLogsByDate = async (date: string): Promise<PushupLog[]> => {
    try {
      return await databaseService.getPushupLogsByDate(date);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to get pushup logs by date';
      setError(errorMessage);
      throw err;
    }
  };

  const getPushupSummaryByDate = async (
    date: string,
  ): Promise<PushupSummary | null> => {
    try {
      return await databaseService.getPushupSummaryByDate(date);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get pushup summary';
      setError(errorMessage);
      throw err;
    }
  };

  const getDatabaseStats = async (): Promise<DatabaseStats> => {
    try {
      const stats = await databaseService.getDatabaseStats();
      setDatabaseStats(stats);
      return stats;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get database stats';
      setError(errorMessage);
      throw err;
    }
  };

  const deletePushupLog = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      await databaseService.deletePushupLog(id);
      await refreshData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete pushup log';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePushupLog = async (
    id: number,
    count: number,
    duration: number,
  ): Promise<void> => {
    try {
      setIsLoading(true);
      await databaseService.updatePushupLog(id, count, duration);
      await refreshData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update pushup log';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Refresh logs and stats
      const [logs, stats] = await Promise.all([
        databaseService.getAllPushupLogs(),
        databaseService.getDatabaseStats(),
      ]);

      setPushupLogs(logs);
      setDatabaseStats(stats);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      console.error('Error refreshing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: DatabaseContextType = {
    isInitialized,
    isLoading,
    error,
    pushupLogs,
    databaseStats,
    savePushupLog,
    getPushupLogs,
    getPushupLogsByDate,
    getPushupSummaryByDate,
    getDatabaseStats,
    deletePushupLog,
    updatePushupLog,
    refreshData,
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};