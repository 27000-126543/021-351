import type { InspectionReport, IssueRecord } from '@/types';

export const mockReports: InspectionReport[] = [
  {
    id: 'r001',
    projectId: 'p001',
    projectName: '市民中心建设项目',
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
      },
    ],
    projectSign: '',
    inspectorSign: '',
  },
  {
    id: 'r002',
    projectId: 'p002',
    projectName: '滨江花园住宅项目',
    inspector: '李监理',
    inspectorUnit: 'XX监理公司',
    inspectTime: '2024-03-25 14:20',
    status: 'draft',
    summary: '抽查土建班组、水电班组共6名工人，未发现明显问题。',
    issues: [],
    projectSign: '',
    inspectorSign: '',
  },
  {
    id: 'r003',
    projectId: 'p003',
    projectName: '科技园区标准厂房项目',
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
      },
    ],
    projectSign: '',
    inspectorSign: '',
  },
];

export const getReportById = (id: string): InspectionReport | undefined => {
  return mockReports.find(r => r.id === id);
};

export const getReportsByProject = (projectId: string): InspectionReport[] => {
  return mockReports.filter(r => r.projectId === projectId);
};
