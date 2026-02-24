
export interface DistributionCollectorSystem {
  id: string;
  name: string;
  department?: number;
  userManager?: string;
  lineOfBusiness?: number;
  createTs?: string;
}

export interface DistributionCollectorQuery {
  id: string;
  systemId: string;
  name: string;
  description: string;
  dataSource: string;
  dataQuery: string;
  dataColumns: string;
  maxResults: number;
  isActive: number;
  system?: DistributionCollectorSystem;
  createTs?: string;
}

export interface DistributionSchedulerGroup {
  id: string;
  name: string;
  department?: number;
  userManager?: string;
  lineOfBusiness?: number;
  createTs?: string;
}

export interface DistributionSchedulerSchedule {
  id: string;
  name: string;
  queryId: string;
  parameters?: string;
  nextRun?: string; // ISO string
  cron: string;
  group?: DistributionSchedulerGroup;
  isActive: number;
  createTs?: string;
}

export interface DistributionDistributerType {
  id: string;
  name: string;
  description?: string;
}

export interface DistributionDistributerDistribution {
  id: string;
  distributionType?: DistributionDistributerType;
  scheduleId: string;
  parameters?: string;
  isActive: number;
  createTs?: string;
}

export interface QueryTestResult {
  success: boolean;
  columns?: string[];
  rows?: any[];
  error?: string;
  executionTimeMs?: number;
}

// Helper types for UI
export type EntityType = 'query' | 'schedule' | 'distribution';
