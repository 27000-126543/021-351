import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { InspectionReport, IssueRecord, ProjectInfo, IssueTracking } from '@/types';
import { generateId } from '@/utils';
import { mergeReportsWithLocal } from '@/data/reports';

const STORAGE_KEY = 'salary_inspect_reports';

const loadReportsFromStorage = (): InspectionReport[] => {
  try {
    const stored = Taro.getStorageSync(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('[Store] 从本地加载纪要:', parsed.length, '条');
      const merged = mergeReportsWithLocal(parsed);
      if (merged.length !== parsed.length) {
        console.log('[Store] 合并历史mock数据，共', merged.length, '条');
        Taro.setStorageSync(STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
    console.log('[Store] 本地无存储，使用历史mock数据');
    const merged = mergeReportsWithLocal([]);
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('[Store] 读取本地存储失败:', e);
  }
  return [];
};

const saveReportsToStorage = (reports: InspectionReport[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(reports));
    console.log('[Store] 已保存到本地:', reports.length, '条');
  } catch (e) {
    console.error('[Store] 保存本地存储失败:', e);
  }
};

interface InspectionStore {
  currentReport: InspectionReport | null;
  allReports: InspectionReport[];

  initReports: () => void;
  createReport: (projectId: string, projectName: string, projectInfo?: ProjectInfo) => InspectionReport;
  setCurrentReport: (report: InspectionReport | null) => void;
  setCurrentReportById: (id: string) => void;
  addIssue: (issue: IssueRecord) => void;
  updateIssue: (issueId: string, updates: Partial<IssueRecord>) => void;
  updateIssueTracking: (issueId: string, tracking: IssueTracking) => void;
  deleteIssue: (issueId: string) => void;
  setProjectSign: (sign: string) => void;
  setInspectorSign: (sign: string) => void;
  completeReport: () => void;
  resetCurrent: () => void;
  saveCurrent: () => void;
}

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  currentReport: null,
  allReports: [],

  initReports: () => {
    const stored = loadReportsFromStorage();
    set({ allReports: stored });
  },

  createReport: (projectId: string, projectName: string, projectInfo?: ProjectInfo) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newReport: InspectionReport = {
      id: generateId(),
      projectId,
      projectName,
      projectInfo,
      inspector: '张督查',
      inspectorUnit: 'XX市住建局',
      inspectTime: timeStr,
      issues: [],
      summary: '',
      status: 'draft',
      sampledWorkerNames: [],
    };

    const { allReports } = get();
    const updated = [newReport, ...allReports];
    set({ currentReport: newReport, allReports: updated });
    saveReportsToStorage(updated);

    console.log('[Store] 创建新纪要:', newReport.id, newReport.projectName);
    return newReport;
  },

  setCurrentReport: (report) => {
    if (!report) {
      set({ currentReport: null });
      return;
    }

    const { allReports } = get();
    const existsIdx = allReports.findIndex(r => r.id === report.id);
    let updated: InspectionReport[];
    
    if (existsIdx >= 0) {
      updated = allReports.map(r => r.id === report.id ? report : r);
    } else {
      updated = [report, ...allReports];
    }

    set({ currentReport: report, allReports: updated });
    saveReportsToStorage(updated);
    console.log('[Store] 设置当前纪要并保存:', report.id);
  },

  setCurrentReportById: (id: string) => {
    const { allReports } = get();
    const found = allReports.find(r => r.id === id);
    if (found) {
      set({ currentReport: found });
      console.log('[Store] 设置当前纪要:', found.id, found.projectName);
    } else {
      console.warn('[Store] 未找到纪要:', id);
    }
  },

  addIssue: (issue: IssueRecord) => {
    const { currentReport, allReports } = get();
    if (!currentReport) {
      console.warn('[Store] 没有当前纪要，无法添加问题');
      return;
    }

    const updatedReport: InspectionReport = {
      ...currentReport,
      issues: [...currentReport.issues, issue],
    };

    const updatedReports = allReports.map(r => r.id === updatedReport.id ? updatedReport : r);
    set({ currentReport: updatedReport, allReports: updatedReports });
    saveReportsToStorage(updatedReports);
    console.log('[Store] 添加问题成功，当前问题数:', updatedReport.issues.length);
  },

  updateIssue: (issueId: string, updates: Partial<IssueRecord>) => {
    const { currentReport, allReports } = get();
    if (!currentReport) return;

    const updatedIssues = currentReport.issues.map(issue =>
      issue.id === issueId ? { ...issue, ...updates } : issue
    );

    const updatedReport: InspectionReport = {
      ...currentReport,
      issues: updatedIssues,
    };

    const updatedReports = allReports.map(r => r.id === updatedReport.id ? updatedReport : r);
    set({ currentReport: updatedReport, allReports: updatedReports });
    saveReportsToStorage(updatedReports);
    console.log('[Store] 更新问题:', issueId);
  },

  updateIssueTracking: (issueId: string, tracking: IssueTracking) => {
    const { currentReport, allReports } = get();
    if (!currentReport) return;

    const updatedIssues = currentReport.issues.map(issue =>
      issue.id === issueId ? { ...issue, tracking } : issue
    );

    const updatedReport: InspectionReport = {
      ...currentReport,
      issues: updatedIssues,
    };

    const updatedReports = allReports.map(r => r.id === updatedReport.id ? updatedReport : r);
    set({ currentReport: updatedReport, allReports: updatedReports });
    saveReportsToStorage(updatedReports);
    console.log('[Store] 更新问题整改跟踪:', issueId);
  },

  deleteIssue: (issueId: string) => {
    const { currentReport, allReports } = get();
    if (!currentReport) return;

    const updatedIssues = currentReport.issues.filter(issue => issue.id !== issueId);

    const updatedReport: InspectionReport = {
      ...currentReport,
      issues: updatedIssues,
    };

    const updatedReports = allReports.map(r => r.id === updatedReport.id ? updatedReport : r);
    set({ currentReport: updatedReport, allReports: updatedReports });
    saveReportsToStorage(updatedReports);
    console.log('[Store] 删除问题:', issueId, '剩余:', updatedIssues.length);
  },

  setProjectSign: (sign: string, signImage?: string) => {
    const { currentReport, allReports } = get();
    if (!currentReport) return;

    const updatedReport: InspectionReport = {
      ...currentReport,
      projectSign: sign,
      projectSignImage: signImage,
    };

    const updatedReports = allReports.map(r => r.id === updatedReport.id ? updatedReport : r);
    set({ currentReport: updatedReport, allReports: updatedReports });
    saveReportsToStorage(updatedReports);
    console.log('[Store] 保存项目部签字', signImage ? '（含图片）' : '');
  },

  setInspectorSign: (sign: string, signImage?: string) => {
    const { currentReport, allReports } = get();
    if (!currentReport) return;

    const updatedReport: InspectionReport = {
      ...currentReport,
      inspectorSign: sign,
      inspectorSignImage: signImage,
    };

    const updatedReports = allReports.map(r => r.id === updatedReport.id ? updatedReport : r);
    set({ currentReport: updatedReport, allReports: updatedReports });
    saveReportsToStorage(updatedReports);
    console.log('[Store] 保存检查人员签字', signImage ? '（含图片）' : '');
  },

  completeReport: () => {
    const { currentReport, allReports } = get();
    if (!currentReport) return;

    const updatedReport: InspectionReport = {
      ...currentReport,
      status: 'completed',
    };

    const updatedReports = allReports.map(r => r.id === updatedReport.id ? updatedReport : r);
    set({ currentReport: updatedReport, allReports: updatedReports });
    saveReportsToStorage(updatedReports);
    console.log('[Store] 完成核验纪要');
  },

  resetCurrent: () => set({ currentReport: null }),

  saveCurrent: () => {
    const { currentReport, allReports } = get();
    if (!currentReport) return;
    
    const updatedReports = allReports.map(r => r.id === currentReport.id ? currentReport : r);
    saveReportsToStorage(updatedReports);
    console.log('[Store] 手动保存当前纪要');
  },
}));
