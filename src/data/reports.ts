import type { InspectionReport, IssueRecord } from '@/types';

export const mockReports: InspectionReport[] = [
  {
    id: 'r001',
    projectId: 'p001',
    projectName: '市民中心建设项目',
    projectInfo: {
      bankName: '中国建设银行 XX 支行',
      bankAccount: '6227 **** **** 8888',
      generalContractor: 'XX 建设集团有限公司',
      subcontractors: ['XX 劳务有限公司', 'XX 装饰工程有限公司'],
      recentSalary: [
        { month: '2024-03', totalAmount: 2580000, workerCount: 256, status: 'normal' },
        { month: '2024-02', totalAmount: 2450000, workerCount: 248, status: 'normal' },
        { month: '2024-01', totalAmount: 2620000, workerCount: 260, status: 'normal' },
      ],
      totalWorkers: 256,
    },
    inspector: '张督查',
    inspectorUnit: '市住建局',
    inspectTime: '2024-03-28 10:30',
    status: 'completed',
    summary: '本次抽查钢筋班组、木工班组共8名工人，工资发放基本正常，发现1名工人反映工资延迟到账问题。',
    issues: [
      {
        id: 'i001',
        workerId: 'w001',
        workerName: '张建国',
        type: 'salary',
        description: '工人反映3月份工资尚未到账，银行流水显示尚未发放记录。',
        photos: [],
        tags: ['未按月足额发放'],
        createTime: '2024-03-28 10:45',
        inspector: '张督查',
        tracking: {
          responsibleUnit: 'XX 建设集团有限公司',
          deadline: '2024-04-15',
          status: 'processing',
          reviewNote: '正在协调补发，预计4月10日前到账。',
          updateTime: '2024-03-29 14:20',
        },
      },
    ],
    sampledWorkerNames: ['张建国(钢筋班组)', '李志强(钢筋班组)', '刘德明(木工班组)', '陈文华(木工班组)'],
    projectSign: '张总',
    inspectorSign: '张督查',
  },
  {
    id: 'r002',
    projectId: 'p002',
    projectName: '滨江花园住宅项目',
    projectInfo: {
      bankName: '中国工商银行 XX 支行',
      bankAccount: '6222 **** **** 6666',
      generalContractor: 'XX 建工集团股份有限公司',
      subcontractors: ['XX 建筑劳务有限公司'],
      recentSalary: [
        { month: '2024-03', totalAmount: 1890000, workerCount: 189, status: 'warning' },
        { month: '2024-02', totalAmount: 1820000, workerCount: 185, status: 'normal' },
        { month: '2024-01', totalAmount: 1950000, workerCount: 192, status: 'normal' },
      ],
      totalWorkers: 189,
    },
    inspector: '李监理',
    inspectorUnit: 'XX监理公司',
    inspectTime: '2024-03-25 14:20',
    status: 'draft',
    summary: '抽查土建班组、水电班组共6名工人，未发现明显问题。',
    issues: [],
    sampledWorkerNames: ['周志远(水电班组)', '吴明辉(水电班组)'],
    projectSign: '',
    inspectorSign: '',
  },
  {
    id: 'r003',
    projectId: 'p003',
    projectName: '科技园区标准厂房项目',
    projectInfo: {
      bankName: '中国农业银行 XX 支行',
      bankAccount: '6228 **** **** 9999',
      generalContractor: 'XX 建设工程有限公司',
      subcontractors: ['XX 劳务服务有限公司', 'XX 钢结构工程有限公司'],
      recentSalary: [
        { month: '2024-03', totalAmount: 0, workerCount: 0, status: 'error' },
        { month: '2024-02', totalAmount: 1420000, workerCount: 145, status: 'normal' },
        { month: '2024-01', totalAmount: 1380000, workerCount: 140, status: 'normal' },
      ],
      totalWorkers: 145,
    },
    inspector: '王主任',
    inspectorUnit: '区人社局',
    inspectTime: '2024-03-20 09:15',
    status: 'completed',
    summary: '发现该项目3月份工资尚未发放，存在专户资料缺失问题。',
    issues: [
      {
        id: 'i002',
        type: 'material',
        description: '项目工资专户银行对账单缺失，无法核实工资发放情况。',
        photos: [],
        tags: ['专户资料缺失'],
        createTime: '2024-03-20 09:30',
        inspector: '王主任',
        tracking: {
          responsibleUnit: 'XX 建设工程有限公司',
          deadline: '2024-04-05',
          status: 'pending',
          reviewNote: '',
          updateTime: '2024-03-20 09:30',
        },
      },
      {
        id: 'i003',
        workerId: 'w006',
        workerName: '赵永福',
        type: 'info',
        description: '工人身份证信息与花名册登记信息不一致。',
        photos: [],
        tags: ['人员信息不一致'],
        createTime: '2024-03-20 10:00',
        inspector: '王主任',
        tracking: {
          responsibleUnit: 'XX 劳务服务有限公司',
          deadline: '2024-04-10',
          status: 'completed',
          reviewNote: '已核对身份信息，更新花名册。',
          updateTime: '2024-03-22 16:30',
        },
      },
    ],
    sampledWorkerNames: ['赵永福(混凝土班组)'],
    projectSign: '李经理',
    inspectorSign: '王主任',
  },
];

export const getReportById = (id: string): InspectionReport | undefined => {
  return mockReports.find(r => r.id === id);
};

export const getReportsByProject = (projectId: string): InspectionReport[] => {
  return mockReports.filter(r => r.projectId === projectId);
};

export const mergeReportsWithLocal = (localReports: InspectionReport[]): InspectionReport[] => {
  const allIds = new Set(localReports.map(r => r.id));
  const missingMock = mockReports.filter(r => !allIds.has(r.id));
  return [...localReports, ...missingMock];
};
