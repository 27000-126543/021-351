import type { Worker } from '@/types';

export const mockWorkers: Worker[] = [
  {
    id: 'w001',
    name: '张建国',
    idCardTail: '****1234',
    team: '钢筋班组',
    status: 'on',
    lastSalary: 12500,
    lastSalaryMonth: '2024-03',
    entryDate: '2023-06-15',
    phone: '138****5678',
  },
  {
    id: 'w002',
    name: '李志强',
    idCardTail: '****5678',
    team: '钢筋班组',
    status: 'on',
    lastSalary: 11800,
    lastSalaryMonth: '2024-03',
    entryDate: '2023-08-20',
    phone: '139****1234',
  },
  {
    id: 'w003',
    name: '王海涛',
    idCardTail: '****9012',
    team: '钢筋班组',
    status: 'on',
    lastSalary: 13200,
    lastSalaryMonth: '2024-03',
    entryDate: '2024-01-10',
    phone: '137****4321',
  },
  {
    id: 'w004',
    name: '刘德明',
    idCardTail: '****3456',
    team: '木工班组',
    status: 'on',
    lastSalary: 14500,
    lastSalaryMonth: '2024-03',
    entryDate: '2023-05-01',
    phone: '136****8765',
  },
  {
    id: 'w005',
    name: '陈文华',
    idCardTail: '****7890',
    team: '木工班组',
    status: 'on',
    lastSalary: 13800,
    lastSalaryMonth: '2024-03',
    entryDate: '2023-09-12',
    phone: '135****2345',
  },
  {
    id: 'w006',
    name: '赵永福',
    idCardTail: '****2345',
    team: '混凝土班组',
    status: 'on',
    lastSalary: 10800,
    lastSalaryMonth: '2024-03',
    entryDate: '2024-02-15',
    phone: '134****6789',
  },
  {
    id: 'w007',
    name: '孙国栋',
    idCardTail: '****6789',
    team: '混凝土班组',
    status: 'off',
    lastSalary: 9600,
    lastSalaryMonth: '2024-02',
    entryDate: '2023-07-20',
    exitDate: '2024-03-10',
    phone: '133****0123',
  },
  {
    id: 'w008',
    name: '周志远',
    idCardTail: '****0123',
    team: '水电班组',
    status: 'on',
    lastSalary: 11200,
    lastSalaryMonth: '2024-03',
    entryDate: '2023-10-08',
    phone: '132****4567',
  },
  {
    id: 'w009',
    name: '吴明辉',
    idCardTail: '****4567',
    team: '水电班组',
    status: 'pending',
    lastSalary: 0,
    lastSalaryMonth: '',
    entryDate: '2024-03-25',
    phone: '131****8901',
  },
  {
    id: 'w010',
    name: '郑伟强',
    idCardTail: '****8901',
    team: '装饰班组',
    status: 'on',
    lastSalary: 12000,
    lastSalaryMonth: '2024-03',
    entryDate: '2023-11-15',
    phone: '130****2345',
  },
  {
    id: 'w011',
    name: '黄少华',
    idCardTail: '****3456',
    team: '装饰班组',
    status: 'on',
    lastSalary: 11500,
    lastSalaryMonth: '2024-03',
    entryDate: '2024-01-20',
    phone: '158****6789',
  },
  {
    id: 'w012',
    name: '林建平',
    idCardTail: '****7890',
    team: '装饰班组',
    status: 'on',
    lastSalary: 10800,
    lastSalaryMonth: '2024-03',
    entryDate: '2024-02-10',
    phone: '159****0123',
  },
];

export const getWorkersByTeam = (team: string): Worker[] => {
  return mockWorkers.filter(w => w.team === team);
};

export const getWorkerById = (id: string): Worker | undefined => {
  return mockWorkers.find(w => w.id === id);
};

export const searchWorkers = (keyword: string): Worker[] => {
  const lowerKeyword = keyword.toLowerCase();
  return mockWorkers.filter(
    w => w.name.toLowerCase().includes(lowerKeyword) || 
         w.team.toLowerCase().includes(lowerKeyword)
  );
};
