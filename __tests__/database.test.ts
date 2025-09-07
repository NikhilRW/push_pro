import databaseService from '../src/shared/services/database';

describe('Database Service', () => {
  beforeAll(async () => {
    await databaseService.initDatabase();
  });

  afterAll(async () => {
    await databaseService.closeDatabase();
  });

  test('should handle empty database gracefully', async () => {
    // Test that empty database doesn't throw errors
    const logs = await databaseService.getAllPushupLogs();
    expect(logs).toEqual([]);

    const stats = await databaseService.getDatabaseStats();
    expect(stats.totalPushups).toBe(0);
    expect(stats.totalSessions).toBe(0);
    expect(stats.averagePerSession).toBe(0);
    expect(stats.longestSession).toBe(0);
  });

  test('should insert and retrieve pushup logs', async () => {
    const testDate = new Date().toISOString().split('T')[0];
    
    // Insert a test log
    const id = await databaseService.insertPushupLog(10, 60, testDate);
    expect(typeof id).toBe('number');

    // Retrieve logs
    const logs = await databaseService.getAllPushupLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].count).toBe(10);
    expect(logs[0].duration).toBe(60);

    // Clean up
    await databaseService.deletePushupLog(id);
  });
});