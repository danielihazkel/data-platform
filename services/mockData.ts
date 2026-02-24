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
  },
  {
    id: 'QRY003',
    systemId: 'SYS002',
    name: 'Monthly Revenue Report',
    description: 'Aggregated revenue per product line for reporting',
    dataSource: 'SQLServer_Reporting',
    dataQuery: 'SELECT product_line, SUM(revenue) FROM sales GROUP BY product_line',
    dataColumns: 'product_line, revenue',
    maxResults: 200,
    isActive: 1,
    system: mockSystems[1],
    createTs: new Date().toISOString()
  },
  {
    id: 'QRY004',
    systemId: 'SYS003',
    name: 'User Behavior Analytics',
    description: 'Clickstream and session data for product analytics',
    dataSource: 'Postgres_Analytics',
    dataQuery: 'SELECT session_id, user_id, duration FROM sessions WHERE created_at > NOW() - INTERVAL 7 DAY',
    dataColumns: 'session_id, user_id, duration, page_count',
    maxResults: 10000,
    isActive: 0,
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
    group: mockGroups[0],
    cron: '0 0 12 ? * FRI',
    nextRun: new Date(Date.now() + 172800000).toISOString(),
    isActive: 0,
    createTs: new Date().toISOString()
  },
  {
    id: 'SCH003',
    name: 'End of Day Summary',
    queryId: 'QRY003',
    group: mockGroups[1],
    cron: '0 0 18 * * MON-FRI',
    nextRun: new Date(Date.now() + 86400000).toISOString(),
    isActive: 1,
    createTs: new Date().toISOString()
  },
  {
    id: 'SCH004',
    name: 'Nightly Cleanup',
    queryId: 'QRY001',
    group: mockGroups[2],
    cron: '0 30 2 * * *',
    nextRun: new Date(Date.now() + 43200000).toISOString(),
    isActive: 1,
    createTs: new Date().toISOString()
  },
  {
    id: 'SCH005',
    name: 'Monthly Billing',
    queryId: 'QRY003',
    group: mockGroups[1],
    cron: '0 0 9 1 * ?',
    nextRun: new Date(Date.now() + 604800000).toISOString(),
    isActive: 1,
    createTs: new Date().toISOString()
  },
  {
    id: 'SCH006',
    name: 'Midday Check',
    queryId: 'QRY002',
    group: mockGroups[0],
    cron: '0 0 12 * * MON,WED,FRI',
    nextRun: new Date(Date.now() + 259200000).toISOString(),
    isActive: 0,
    createTs: new Date().toISOString()
  },
  {
    id: 'SCH007',
    name: 'Morning Alerts',
    queryId: 'QRY004',
    group: mockGroups[2],
    cron: '0 0 8 * * MON-FRI',
    nextRun: new Date(Date.now() + 86400000).toISOString(),
    isActive: 1,
    createTs: new Date().toISOString()
  }
];

export const mockDistributions: DistributionDistributerDistribution[] = [
  {
    id: 'DST001',
    distributionType: mockTypes[0],
    scheduleId: 'SCH001',
    parameters: '{"to": "managers@men.co.il", "subject": "Daily Report"}',
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
  },
  {
    id: 'DST003',
    distributionType: mockTypes[2],
    scheduleId: 'SCH003',
    parameters: '{"topic": "eod-summary", "broker": "kafka-prod:9092"}',
    isActive: 1,
    createTs: new Date().toISOString()
  },
  {
    id: 'DST004',
    distributionType: mockTypes[0],
    scheduleId: 'SCH004',
    parameters: '{"to": "ops@men.co.il", "subject": "Nightly Cleanup Report"}',
    isActive: 0,
    createTs: new Date().toISOString()
  },
  {
    id: 'DST005',
    distributionType: mockTypes[1],
    scheduleId: 'SCH005',
    parameters: '{"host": "sftp.billing.com", "path": "/monthly"}',
    isActive: 1,
    createTs: new Date().toISOString()
  },
  {
    id: 'DST006',
    distributionType: mockTypes[2],
    scheduleId: 'SCH006',
    parameters: '{"topic": "midday-alerts", "broker": "kafka-prod:9092"}',
    isActive: 0,
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
