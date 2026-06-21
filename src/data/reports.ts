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
          logs: [
            {
              time: '2024-03-29T14:20:00.000Z',
              operator: '张督查',
              fromStatus: 'pending',
              toStatus: 'processing',
              note: '状态由「待整改」改为「整改中」；更新复查说明',
            },
            {
              time: '2024-03-28T11:00:00.000Z',
              operator: '张督查',
              toStatus: 'pending',
              note: '创建整改跟踪，状态：待整改',
            },
          ],
        },
      },
    ],
    sampledWorkerNames: ['张建国(钢筋班组)', '李志强(钢筋班组)', '刘德明(木工班组)', '陈文华(木工班组)'],
    projectSign: '王建国',
    inspectorSign: '张督查',
  },
  {
    id: 'r002',
    projectId: 'p002',
    projectName: '阳光花园小区二期',
    projectInfo: {
      bankName: '中国工商银行 XX 支行',
      bankAccount: '6222 **** **** 6666',
      generalContractor: 'XX 建工集团',
      subcontractors: ['XX 建筑劳务有限公司'],
      recentSalary: [
        { month: '2024-03', totalAmount: 1850000, workerCount: 185, status: 'warning' },
        { month: '2024-02', totalAmount: 1920000, workerCount: 192, status: 'normal' },
        { month: '2024-01', totalAmount: 2050000, workerCount: 205, status: 'normal' },
      ],
      totalWorkers: 185,
    },
    inspector: '李主任',
    inspectorUnit: '区住建局',
    inspectTime: '2024-03-25 14:20',
    status: 'completed',
    summary: '抽查发现2个问题，其中专户资料缺失问题已整改完成，人员信息不一致问题待复核。',
    issues: [
      {
        id: 'i002',
        type: 'material',
        description: '现场检查发现2024年1月份工资发放明细表缺失，无法核对发放情况。',
        photos: [],
        tags: ['专户资料缺失'],
        createTime: '2024-03-25 14:45',
        inspector: '李主任',
        tracking: {
          responsibleUnit: 'XX 建工集团',
          deadline: '2024-03-28',
          status: 'verified',
          reviewNote: '已补交1月份工资发放明细表及银行代发凭证，资料齐全。',
          updateTime: '2024-03-27 09:30',
          logs: [
            {
              time: '2024-03-27T09:30:00.000Z',
              operator: '李主任',
              fromStatus: 'completed',
              toStatus: 'verified',
              note: '状态由「已整改」改为「已复核」',
            },
            {
              time: '2024-03-26T16:00:00.000Z',
              operator: '王经理',
              fromStatus: 'processing',
              toStatus: 'completed',
              note: '状态由「整改中」改为「已整改」；资料已补交',
            },
            {
              time: '2024-03-25T15:00:00.000Z',
              operator: '李主任',
              toStatus: 'processing',
              note: '创建整改跟踪，状态：整改中',
            },
          ],
        },
      },
      {
        id: 'i003',
        workerId: 'w005',
        workerName: '赵天明',
        type: 'info',
        description: '工人赵天明的身份证信息与工资专户登记信息不一致，需核实。',
        photos: [],
        tags: ['人员信息不一致'],
        createTime: '2024-03-25 15:10',
        inspector: '李主任',
        tracking: {
          responsibleUnit: 'XX 建筑劳务有限公司',
          deadline: '2024-04-01',
          status: 'completed',
          reviewNote: '已核实并更新工人身份信息，系统已同步。',
          updateTime: '2024-03-29 11:00',
          logs: [
            {
              time: '2024-03-29T11:00:00.000Z',
              operator: '李主任',
              fromStatus: 'processing',
              toStatus: 'completed',
              note: '状态由「整改中」改为「已整改」；身份信息已更新',
            },
            {
              time: '2024-03-25T15:30:00.000Z',
              operator: '李主任',
              toStatus: 'pending',
              note: '创建整改跟踪，状态：待整改',
            },
          ],
        },
      },
    ],
    sampledWorkerNames: ['赵天明(瓦工班组)', '钱宝山(瓦工班组)', '孙大力(水电班组)', '周建平(水电班组)'],
    projectSign: '刘经理',
    inspectorSign: '李主任',
  },
  {
    id: 'r003',
    projectId: 'p003',
    projectName: '科技创新产业园',
    projectInfo: {
      bankName: '中国银行 XX 支行',
      bankAccount: '6217 **** **** 9999',
      generalContractor: 'XX 建设工程有限公司',
      subcontractors: ['XX 劳务服务有限公司', 'XX 机电安装有限公司'],
      recentSalary: [
        { month: '2024-03', totalAmount: 3200000, workerCount: 320, status: 'normal' },
        { month: '2024-02', totalAmount: 3100000, workerCount: 310, status: 'normal' },
        { month: '2024-01', totalAmount: 3000000, workerCount: 300, status: 'normal' },
      ],
      totalWorkers: 320,
    },
    inspector: '王科长',
    inspectorUnit: '市人社局',
    inspectTime: '2024-03-20 09:00',
    status: 'draft',
    summary: '',
    issues: [
      {
        id: 'i004',
        type: 'other',
        description: '现场考勤设备损坏，部分工人考勤记录不全。',
        photos: [],
        tags: ['考勤记录不全', '其他问题'],
        createTime: '2024-03-20 09:30',
        inspector: '王科长',
      },
    ],
    sampledWorkerNames: ['吴大勇(架子工)', '郑小波(架子工)', '冯志强(钢筋班组)'],
    projectSign: '',
    inspectorSign: '',
  },
];

export const mergeReportsWithLocal = (localReports: InspectionReport[]): InspectionReport[] => {
  const map = new Map<string, InspectionReport>();
  
  mockReports.forEach(r => {
    map.set(r.id, r);
  });
  
  localReports.forEach(r => {
    map.set(r.id, r);
  });
  
  return Array.from(map.values());
};
