import { 
  DistributionCollectorQuery, 
  DistributionCollectorSystem, 
  DistributionSchedulerGroup, 
  DistributionSchedulerSchedule,
  DistributionDistributerDistribution,
  DistributionDistributerType
} from '../types';

export const mockSystems: DistributionCollectorSystem[] = [
  { id: 'SYS001', name: 'CRM Core', department: 101, userManager: 'David Cohen', lineOfBusiness: 1, createTs: '2023-01-01T10:00:00Z' },
  { id: 'SYS002', name: 'Legacy Billing', department: 102, userManager: 'Sarah Levy', lineOfBusiness: 1, createTs: '2023-01-15T10:00:00Z' },
  { id: 'SYS003', name: 'Data Warehouse', department: 103, userManager: 'Moshe Katz', lineOfBusiness: 2, createTs: '2023-02-01T10:00:00Z' },
];

export const mockGroups: DistributionSchedulerGroup[] = [
  { id: 'GRP001', name: 'Daily Reports', department: 101, userManager: 'David Cohen', lineOfBusiness: 1, createTs: '2023-01-05T12:00:00Z' },
  { id: 'GRP002', name: 'Monthly Audits', department: 102, userManager: 'Sarah Levy', lineOfBusiness: 1, createTs: '2023-01-20T12:00:00Z' },
  { id: 'GRP003', name: 'Critical Alerts', department: 103, userManager: 'Moshe Katz', lineOfBusiness: 2, createTs: '2023-02-10T12:00:00Z' },
];

export const mockTypes: DistributionDistributerType[] = [
  { id: 'TYPE001', name: 'Email', description: 'Send via SMTP' },
  { id: 'TYPE002', name: 'SFTP', description: 'Upload to remote server' },
  { id: 'TYPE003', name: 'Kafka', description: 'Push to topic' },
];

export const mockDatabases: string[] = ['Oracle_Prod', 'SQLServer_Reporting', 'Postgres_Analytics'];

export const mockQueries: DistributionCollectorQuery[] = [
  {
    id: 'QRY001',
    systemId: 'SYS001',
    name: 'Active Customers',
    description: 'Fetch all customers active in the last 30 days',
    dataSource: 'Oracle_Prod',
    dataQuery: 'SELECT * FROM customers WHERE status = "ACTIVE"',
    dataColumns: 'id, name, email, last_login',
    maxResults: 5000,
    isActive: 1,
    system: mockSystems[0],
    createTs: new Date().toISOString()
  },
  {
    id: 'QRY002',
    systemId: 'SYS003',
    name: 'Pending Transactions',
    description: 'Transactions waiting for approval > 24h',
    dataSource: 'Postgres_Analytics',
    dataQuery: 'SELECT id, amount FROM tx WHERE state = "PENDING"',
    dataColumns: 'id, amount, created_at',
    maxResults: 100,
    isActive: 1,
    system: mockSystems[2],
    createTs: new Date().toISOString()
  }
];

export const mockSchedules: DistributionSchedulerSchedule[] = [
  {
    id: 'SCH001',
    name: 'Morning Sync',
    queryId: 'QRY001',
    group: mockGroups[0],
    cron: '0 0 8 * * ?',
    nextRun: new Date(Date.now() + 86400000).toISOString(),
    isActive: 1,
    createTs: new Date().toISOString()
  },
  {
    id: 'SCH002',
    name: 'Weekly Audit',
    queryId: 'QRY002',
    group: mockGroups[1],
    cron: '0 0 12 ? * FRI',
    nextRun: new Date(Date.now() + 172800000).toISOString(),
    isActive: 0,
    createTs: new Date().toISOString()
  }
];

export const mockDistributions: DistributionDistributerDistribution[] = [
  {
    id: 'DST001',
    distributionType: mockTypes[0],
    scheduleId: 'SCH001',
    parameters: '{"to": "managers@menora.co.il", "subject": "Daily Report"}',
    isActive: 1,
    createTs: new Date().toISOString()
  },
  {
    id: 'DST002',
    distributionType: mockTypes[1],
    scheduleId: 'SCH002',
    parameters: '{"host": "sftp.partner.com", "path": "/uploads"}',
    isActive: 1,
    createTs: new Date().toISOString()
  }
];

export const mockQueryResults = [
  { id: 'RES-001', name: 'Israel Israeli', email: 'israel@example.com', amount: 500.00, status: 'Active', created_at: '2023-10-01', last_login: '2023-10-01 10:00:00' },
  { id: 'RES-002', name: 'Moshe Cohen', email: 'moshe@example.com', amount: 1250.50, status: 'Pending', created_at: '2023-10-02', last_login: '2023-10-02 11:30:00' },
  { id: 'RES-003', name: 'Dana Levi', email: 'dana@example.com', amount: 750.00, status: 'Active', created_at: '2023-10-03', last_login: '2023-10-03 09:15:00' },
  { id: 'RES-004', name: 'Rina Katz', email: 'rina@example.com', amount: 2000.00, status: 'Closed', created_at: '2023-10-04', last_login: '2023-10-04 14:20:00' },
  { id: 'RES-005', name: 'Yossi Schwartz', email: 'yossi@example.com', amount: 100.00, status: 'Active', created_at: '2023-10-05', last_login: '2023-10-05 16:45:00' },
];
