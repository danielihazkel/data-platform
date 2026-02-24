import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '@/services/api';
import {
  mockQueries, mockSchedules, mockDistributions,
  mockSystems, mockGroups, mockTypes, mockDatabases,
} from '@/services/mockData';

// Capture initial state as shallow copies so mutations can be undone
const initialQueries = mockQueries.map(q => ({ ...q }));
const initialSchedules = mockSchedules.map(s => ({ ...s }));
const initialDistributions = mockDistributions.map(d => ({ ...d }));

beforeEach(() => {
  mockQueries.length = 0;
  mockQueries.push(...initialQueries.map(q => ({ ...q })));
  mockSchedules.length = 0;
  mockSchedules.push(...initialSchedules.map(s => ({ ...s })));
  mockDistributions.length = 0;
  mockDistributions.push(...initialDistributions.map(d => ({ ...d })));
});

// ---------------------------------------------------------------------------
// Read-only list methods
// ---------------------------------------------------------------------------

describe('getQueries', () => {
  it('returns an array with the correct shape', async () => {
    const queries = await apiService.getQueries();
    expect(Array.isArray(queries)).toBe(true);
    expect(queries.length).toBe(initialQueries.length);
    expect(queries[0]).toHaveProperty('id');
    expect(queries[0]).toHaveProperty('systemId');
    expect(queries[0]).toHaveProperty('dataQuery');
  });

  it('returns a copy, not the original array reference', async () => {
    const queries = await apiService.getQueries();
    expect(queries).not.toBe(mockQueries);
  });
});

describe('getSystems', () => {
  it('returns all mock systems with correct shape', async () => {
    const systems = await apiService.getSystems();
    expect(systems.length).toBe(mockSystems.length);
    expect(systems[0]).toHaveProperty('id');
    expect(systems[0]).toHaveProperty('name');
  });
});

describe('getGroups', () => {
  it('returns all mock groups', async () => {
    const groups = await apiService.getGroups();
    expect(groups.length).toBe(mockGroups.length);
    expect(groups[0]).toHaveProperty('id');
    expect(groups[0]).toHaveProperty('name');
  });
});

describe('getDistributionTypes', () => {
  it('returns the expected distribution types', async () => {
    const types = await apiService.getDistributionTypes();
    expect(types).toEqual(mockTypes);
    expect(types.some(t => t.name === 'Email')).toBe(true);
    expect(types.some(t => t.name === 'SFTP')).toBe(true);
    expect(types.some(t => t.name === 'Kafka')).toBe(true);
  });
});

describe('getAvailableDatabases', () => {
  it('returns the expected database names', async () => {
    const dbs = await apiService.getAvailableDatabases();
    expect(dbs).toEqual(mockDatabases);
    expect(dbs).toContain('Oracle_Prod');
  });
});

// ---------------------------------------------------------------------------
// saveQuery
// ---------------------------------------------------------------------------

describe('saveQuery', () => {
  it('creates a new entry when the id is not found', async () => {
    const newQuery = {
      id: 'QRY_NEW',
      systemId: 'SYS001',
      name: 'New Query',
      description: 'Test description',
      dataSource: 'Oracle_Prod',
      dataQuery: 'SELECT 1 FROM dual',
      dataColumns: 'id',
      maxResults: 100,
      isActive: 1,
      system: mockSystems[0],
      // no createTs — simulates a new entity
    };

    await apiService.saveQuery(newQuery);

    expect(mockQueries.length).toBe(initialQueries.length + 1);
    const saved = mockQueries.find(q => q.id === 'QRY_NEW');
    expect(saved).toBeDefined();
    expect(saved!.createTs).toBeDefined();
  });

  it('updates an existing entry in place', async () => {
    const updated = { ...mockQueries[0], name: 'Updated Name' };
    await apiService.saveQuery(updated);

    expect(mockQueries.length).toBe(initialQueries.length);
    expect(mockQueries[0].name).toBe('Updated Name');
  });
});

// ---------------------------------------------------------------------------
// saveSchedule
// ---------------------------------------------------------------------------

describe('saveSchedule', () => {
  it('creates a new entry when the id is not found', async () => {
    const newSchedule = {
      id: 'SCH_NEW',
      name: 'New Schedule',
      queryId: 'QRY001',
      group: mockGroups[0],
      cron: '0 0 8 * * ?',
      nextRun: new Date().toISOString(),
      isActive: 1,
      // no createTs
    };

    await apiService.saveSchedule(newSchedule);

    expect(mockSchedules.length).toBe(initialSchedules.length + 1);
    const saved = mockSchedules.find(s => s.id === 'SCH_NEW');
    expect(saved).toBeDefined();
    expect(saved!.createTs).toBeDefined();
  });

  it('updates an existing entry in place', async () => {
    const updated = { ...mockSchedules[0], name: 'Updated Schedule' };
    await apiService.saveSchedule(updated);

    expect(mockSchedules.length).toBe(initialSchedules.length);
    expect(mockSchedules[0].name).toBe('Updated Schedule');
  });
});

// ---------------------------------------------------------------------------
// saveDistribution
// ---------------------------------------------------------------------------

describe('saveDistribution', () => {
  it('creates a new entry when the id is not found', async () => {
    const newDist = {
      id: 'DST_NEW',
      distributionType: mockTypes[0],
      scheduleId: 'SCH001',
      parameters: '{}',
      isActive: 1,
      // no createTs
    };

    await apiService.saveDistribution(newDist);

    expect(mockDistributions.length).toBe(initialDistributions.length + 1);
    const saved = mockDistributions.find(d => d.id === 'DST_NEW');
    expect(saved).toBeDefined();
    expect(saved!.createTs).toBeDefined();
  });

  it('updates an existing entry in place', async () => {
    const updated = { ...mockDistributions[0], parameters: '{"updated": true}' };
    await apiService.saveDistribution(updated);

    expect(mockDistributions.length).toBe(initialDistributions.length);
    expect(mockDistributions[0].parameters).toBe('{"updated": true}');
  });
});

// ---------------------------------------------------------------------------
// deactivateDistribution
// ---------------------------------------------------------------------------

describe('deactivateDistribution', () => {
  it('sets isActive to 0 on the target distribution', async () => {
    expect(mockDistributions[0].isActive).toBe(1);

    await apiService.deactivateDistribution(mockDistributions[0].id);

    expect(mockDistributions[0].isActive).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// testQuery
// ---------------------------------------------------------------------------

describe('testQuery', () => {
  it('returns success with columns and rows for a valid query', async () => {
    const result = await apiService.testQuery({
      dataQuery: 'SELECT * FROM customers',
      dataColumns: 'id, name, email',
    });

    expect(result.success).toBe(true);
    expect(result.columns).toEqual(['id', 'name', 'email']);
    expect(Array.isArray(result.rows)).toBe(true);
    expect(result.rows!.length).toBeGreaterThan(0);
    expect(typeof result.executionTimeMs).toBe('number');
  });

  it('falls back to mock result keys when dataColumns is empty', async () => {
    const result = await apiService.testQuery({
      dataQuery: 'SELECT * FROM customers',
      dataColumns: '',
    });

    expect(result.success).toBe(true);
    expect(Array.isArray(result.columns)).toBe(true);
    expect(result.columns!.length).toBeGreaterThan(0);
  });

  it('returns success: false when the SQL contains "error"', async () => {
    const result = await apiService.testQuery({
      dataQuery: 'SELECT error FROM bad_table',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe('string');
  });
});
