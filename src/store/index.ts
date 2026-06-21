import { create } from 'zustand';
import type { InspectionReport, IssueRecord } from '@/types';
import { generateId } from '@/utils';

interface InspectionStore {
  currentReport: InspectionReport | null;
  sampledWorkerIds: string[];
  projectSign: string;
  inspectorSign: string;

  createReport: (projectId: string, projectName: string) => InspectionReport;
  setCurrentReport: (report: InspectionReport | null) => void;
  addIssue: (issue: IssueRecord) => void;
  setSampledWorkers: (ids: string[]) => void;
  setProjectSign: (sign: string) => void;
  setInspectorSign: (sign: string) => void;
  resetAll: () => void;
}

const defaultReport: InspectionReport | null = null;

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  currentReport: defaultReport,
  sampledWorkerIds: [],
  projectSign: '',
  inspectorSign: '',

  createReport: (projectId: string, projectName: string) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newReport: InspectionReport = {
      id: generateId(),
      projectId,
      projectName,
      inspector: '张督查',
      inspectorUnit: 'XX市住建局',
      inspectTime: timeStr,
      issues: [],
      summary: '',
      status: 'draft',
    };

    set({ currentReport: newReport });
    return newReport;
  },

  setCurrentReport: (report) => set({ currentReport: report }),

  addIssue: (issue) => {
    const { currentReport } = get();
    if (!currentReport) {
      console.warn('[Store] 没有当前纪要，无法添加问题');
      return;
    }

    const updatedReport: InspectionReport = {
      ...currentReport,
      issues: [...currentReport.issues, issue],
    };

    set({ currentReport: updatedReport });
    console.log('[Store] 添加问题成功，当前问题数:', updatedReport.issues.length);
  },

  setSampledWorkers: (ids) => set({ sampledWorkerIds: ids }),

  setProjectSign: (sign) => {
    set({ projectSign: sign });
    const { currentReport } = get();
    if (currentReport) {
      set({
        currentReport: {
          ...currentReport,
          projectSign: sign,
        },
      });
    }
  },

  setInspectorSign: (sign) => {
    set({ inspectorSign: sign });
    const { currentReport } = get();
    if (currentReport) {
      set({
        currentReport: {
          ...currentReport,
          inspectorSign: sign,
        },
      });
    }
  },

  resetAll: () => set({
    currentReport: null,
    sampledWorkerIds: [],
    projectSign: '',
    inspectorSign: '',
  }),
}));
