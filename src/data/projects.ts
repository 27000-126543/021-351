import type { Project } from '@/types';

export const mockProjects: Project[] = [
  {
    id: 'p001',
    name: '市民中心建设项目',
    code: 'PRJ-2024-001',
    bankName: '中国建设银行 XX 支行',
    bankAccount: '6227 **** **** 8888',
    generalContractor: 'XX 建设集团有限公司',
    subcontractors: ['XX 劳务有限公司', 'XX 装饰工程有限公司'],
    address: 'XX 市 XX 区 XX 路 100 号',
    totalWorkers: 256,
    totalTeams: ['钢筋班组', '木工班组', '混凝土班组', '水电班组', '装饰班组'],
    recentSalary: [
      { month: '2024-03', totalAmount: 2580000, workerCount: 256, status: 'normal' },
      { month: '2024-02', totalAmount: 2450000, workerCount: 248, status: 'normal' },
      { month: '2024-01', totalAmount: 2620000, workerCount: 260, status: 'normal' },
    ],
  },
  {
    id: 'p002',
    name: '滨江花园住宅项目',
    code: 'PRJ-2024-002',
    bankName: '中国工商银行 XX 支行',
    bankAccount: '6222 **** **** 6666',
    generalContractor: 'XX 建工集团股份有限公司',
    subcontractors: ['XX 建筑劳务有限公司'],
    address: 'XX 市 XX 区滨江大道 88 号',
    totalWorkers: 189,
    totalTeams: ['土建班组', '水电班组', '防水班组'],
    recentSalary: [
      { month: '2024-03', totalAmount: 1890000, workerCount: 189, status: 'warning' },
      { month: '2024-02', totalAmount: 1820000, workerCount: 185, status: 'normal' },
      { month: '2024-01', totalAmount: 1950000, workerCount: 192, status: 'normal' },
    ],
  },
  {
    id: 'p003',
    name: '科技园区标准厂房项目',
    code: 'PRJ-2024-003',
    bankName: '中国农业银行 XX 支行',
    bankAccount: '6228 **** **** 9999',
    generalContractor: 'XX 建设工程有限公司',
    subcontractors: ['XX 劳务服务有限公司', 'XX 钢结构工程有限公司'],
    address: 'XX 市 XX 区科技园区 12 号',
    totalWorkers: 145,
    totalTeams: ['钢结构班组', '土建班组', '安装班组'],
    recentSalary: [
      { month: '2024-03', totalAmount: 0, workerCount: 0, status: 'error' },
      { month: '2024-02', totalAmount: 1420000, workerCount: 145, status: 'normal' },
      { month: '2024-01', totalAmount: 1380000, workerCount: 140, status: 'normal' },
    ],
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find(p => p.id === id);
};

export const getProjectByCode = (code: string): Project | undefined => {
  return mockProjects.find(p => p.code === code);
};
