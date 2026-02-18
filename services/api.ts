import { APP_CONFIG } from '../constants';
import { 
  mockQueries, mockSchedules, mockDistributions, 
  mockSystems, mockGroups, mockTypes, mockDatabases 
} from './mockData';
import { 
  DistributionCollectorQuery, 
  DistributionSchedulerSchedule, 
  DistributionDistributerDistribution,
  DistributionCollectorSystem,
  DistributionSchedulerGroup,
  DistributionDistributerType
} from '../types';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Implementation ---

class ApiService {
  
  // --- Queries ---
  async getQueries(): Promise<DistributionCollectorQuery[]> {
    if (APP_CONFIG.USE_MOCK_API) {
      await delay(400);
      return [...mockQueries];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/queries`);
    return res.json();
  }

  async saveQuery(query: DistributionCollectorQuery): Promise<DistributionCollectorQuery> {
    if (APP_CONFIG.USE_MOCK_API) {
      await delay(400);
      const index = mockQueries.findIndex(q => q.id === query.id);
      if (index >= 0) {
        mockQueries[index] = query;
      } else {
        mockQueries.push({ ...query, createTs: new Date().toISOString() });
      }
      return query;
    }
    const method = query.createTs ? 'PUT' : 'POST'; // Naive check for update vs create
    const url = query.createTs ? `${APP_CONFIG.API_BASE_URL}/queries/${query.id}` : `${APP_CONFIG.API_BASE_URL}/queries`;
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });
    return res.json();
  }

  // --- Schedules ---
  async getSchedules(): Promise<DistributionSchedulerSchedule[]> {
    if (APP_CONFIG.USE_MOCK_API) {
      await delay(400);
      return [...mockSchedules];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/schedules`);
    return res.json();
  }

  async saveSchedule(schedule: DistributionSchedulerSchedule): Promise<DistributionSchedulerSchedule> {
    if (APP_CONFIG.USE_MOCK_API) {
      await delay(400);
      const index = mockSchedules.findIndex(s => s.id === schedule.id);
      if (index >= 0) {
        mockSchedules[index] = schedule;
      } else {
        mockSchedules.push({ ...schedule, createTs: new Date().toISOString() });
      }
      return schedule;
    }
    const method = schedule.createTs ? 'PUT' : 'POST';
    const url = schedule.createTs ? `${APP_CONFIG.API_BASE_URL}/schedules/${schedule.id}` : `${APP_CONFIG.API_BASE_URL}/schedules`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    });
    return res.json();
  }

  // --- Distributions ---
  async getDistributions(): Promise<DistributionDistributerDistribution[]> {
    if (APP_CONFIG.USE_MOCK_API) {
      await delay(400);
      return [...mockDistributions];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/distributions`);
    return res.json();
  }

  async saveDistribution(dist: DistributionDistributerDistribution): Promise<DistributionDistributerDistribution> {
    if (APP_CONFIG.USE_MOCK_API) {
      await delay(400);
      const index = mockDistributions.findIndex(d => d.id === dist.id);
      if (index >= 0) {
        mockDistributions[index] = dist;
      } else {
        mockDistributions.push({ ...dist, createTs: new Date().toISOString() });
      }
      return dist;
    }
    const method = dist.createTs ? 'PUT' : 'POST';
    const url = dist.createTs ? `${APP_CONFIG.API_BASE_URL}/distributions/${dist.id}` : `${APP_CONFIG.API_BASE_URL}/distributions`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dist)
    });
    return res.json();
  }

  async deactivateDistribution(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK_API) {
      await delay(200);
      const index = mockDistributions.findIndex(d => d.id === id);
      if (index >= 0) mockDistributions[index].isActive = 0;
      return;
    }
    await fetch(`${APP_CONFIG.API_BASE_URL}/distributions/${id}/deactivate`, { method: 'PATCH' });
  }

  // --- Aux Data ---
  async getSystems(): Promise<DistributionCollectorSystem[]> {
    if (APP_CONFIG.USE_MOCK_API) return mockSystems;
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/systems`);
    return res.json();
  }

  async getGroups(): Promise<DistributionSchedulerGroup[]> {
    if (APP_CONFIG.USE_MOCK_API) return mockGroups;
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/groups`);
    return res.json();
  }

  async getDistributionTypes(): Promise<DistributionDistributerType[]> {
    if (APP_CONFIG.USE_MOCK_API) return mockTypes;
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/distribution-types`);
    return res.json();
  }

  async getAvailableDatabases(): Promise<string[]> {
    if (APP_CONFIG.USE_MOCK_API) return mockDatabases;
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/queries/databases`);
    return res.json();
  }
}

export const apiService = new ApiService();
