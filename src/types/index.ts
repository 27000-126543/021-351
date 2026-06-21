export interface Project {
  id: string;
  name: string;
  code: string;
  bankName: string;
  bankAccount: string;
  generalContractor: string;
  subcontractors: string[];
  address: string;
  recentSalary: RecentSalary[];
  totalWorkers: number;
  totalTeams: string[];
}

export interface RecentSalary {
  month: string;
  totalAmount: number;
  workerCount: number;
  status: 'normal' | 'warning' | 'error';
}

export interface Worker {
  id: string;
  name: string;
  idCardTail: string;
  team: string;
  status: 'on' | 'off' | 'pending';
  lastSalary: number;
  lastSalaryMonth: string;
  entryDate: string;
  exitDate?: string;
  phone?: string;
}

export interface IssueRecord {
  id: string;
  workerId?: string;
  workerName?: string;
  type: IssueType;
  description: string;
  photos: string[];
  tags: string[];
  createTime: string;
  inspector: string;
}

export type IssueType = 'salary' | 'info' | 'material' | 'other';

export interface InspectionReport {
  id: string;
  projectId: string;
  projectName: string;
  inspector: string;
  inspectorUnit: string;
  inspectTime: string;
  issues: IssueRecord[];
  summary: string;
  projectSign?: string;
  inspectorSign?: string;
  status: 'draft' | 'completed';
}

export interface UserInfo {
  name: string;
  unit: string;
  role: string;
  phone: string;
}

export const ISSUE_TAGS = [
  { value: '未按月足额发放', type: 'red' as const },
  { value: '人员信息不一致', type: 'orange' as const },
  { value: '专户资料缺失', type: 'blue' as const },
  { value: '考勤记录不全', type: 'gray' as const },
  { value: '其他问题', type: 'gray' as const },
];
