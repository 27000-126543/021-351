import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { mockProjects, getProjectById, getProjectByCode } from '@/data/projects';
import type { Project } from '@/types';
import { formatMoney, getSalaryStatusText } from '@/utils';
import { useInspectionStore } from '@/store';

const ProjectDetailPage: React.FC = () => {
  const router = useRouter();
  const { createReport, setCurrentReportById, currentReport, allReports, resetCurrent } = useInspectionStore();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { id, code } = router.params;
    console.log('[ProjectDetail] 参数:', { id, code });
    
    let foundProject: Project | undefined;
    if (id) {
      foundProject = getProjectById(id);
    } else if (code) {
      foundProject = getProjectByCode(code);
    }
    
    if (!foundProject) {
      foundProject = mockProjects[0];
    }
    
    setProject(foundProject || null);
    setLoading(false);
  }, [router.params]);

  const findDraftForProject = (projectId: string) => {
    return allReports.find(r => r.projectId === projectId && r.status === 'draft');
  };

  const handleStartInspect = () => {
    if (!project) return;
    
    const existingDraft = findDraftForProject(project.id);
    if (existingDraft) {
      setCurrentReportById(existingDraft.id);
    } else if (!currentReport || currentReport.projectId !== project.id) {
      createReportWithProjectInfo();
    }
    
    Taro.switchTab({ url: '/pages/inspect/index' });
  };

  const createReportWithProjectInfo = () => {
    if (!project) return null;

    const projectInfo = {
      bankName: project.bankName,
      bankAccount: project.bankAccount,
      generalContractor: project.generalContractor,
      subcontractors: project.subcontractors,
      recentSalary: project.recentSalary,
      totalWorkers: project.totalWorkers,
    };

    return createReport(project.id, project.name, projectInfo);
  };

  const handleGenerateReport = () => {
    if (!project) return;
    
    const existingDraft = findDraftForProject(project.id);
    
    if (existingDraft) {
      setCurrentReportById(existingDraft.id);
      Taro.navigateTo({
        url: `/pages/report-detail/index?id=${existingDraft.id}`,
      });
      return;
    }

    if (currentReport && currentReport.projectId === project.id) {
      Taro.navigateTo({
        url: `/pages/report-detail/index?id=${currentReport.id}`,
      });
      return;
    }

    const newReport = createReportWithProjectInfo();
    if (!newReport) return;

    console.log('[ProjectDetail] 已创建新纪要:', newReport.id);

    Taro.showToast({
      title: '纪要已生成',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          Taro.navigateTo({
            url: `/pages/report-detail/index?id=${newReport.id}`,
          });
        }, 800);
      },
    });
  };

  const getSalaryStatus = (status: 'normal' | 'warning' | 'error') => {
    const statusMap = {
      normal: 'success' as const,
      warning: 'warning' as const,
      error: 'error' as const,
    };
    return <StatusBadge text={getSalaryStatusText(status)} status={statusMap[status]} />;
  };

  if (loading) {
    return (
      <View className={styles.page}>
        <Text className={styles.loading}>加载中...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View className={styles.page}>
        <Text className={styles.loading}>未找到项目信息</Text>
      </View>
    );
  }

  const hasDraft = !!findDraftForProject(project.id);

  return (
    <View className={styles.page}>
      <View className={styles.projectHeader}>
        <Text className={styles.projectName}>{project.name}</Text>
        <Text className={styles.projectCode}>项目编号：{project.code}</Text>
        <Text className={styles.projectAddress}>📍 {project.address}</Text>
        {hasDraft && (
          <Text style={{ marginTop: 16, fontSize: 24, color: 'rgba(255,255,255,0.9)' }}>
            ✅ 存在未完成草稿纪要
          </Text>
        )}
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>🏦</Text>
            工资专户信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>开户银行</Text>
            <Text className={styles.infoValue}>{project.bankName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>银行账号</Text>
            <Text className={styles.infoValue}>{project.bankAccount}</Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>🏗️</Text>
            参建单位
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>总包单位</Text>
            <Text className={styles.infoValue}>{project.generalContractor}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>分包单位</Text>
            <Text className={styles.infoValue}>
              {project.subcontractors.join('\n')}
            </Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>💰</Text>
            近三月工资发放概况
          </Text>
          <View className={styles.salarySection}>
            {project.recentSalary.map((item, index) => (
              <View key={index} className={styles.salaryItem}>
                <View>
                  <Text className={styles.salaryMonth}>{item.month}</Text>
                  {getSalaryStatus(item.status)}
                </View>
                <View className={styles.salaryInfo}>
                  <Text className={styles.salaryAmount}>{formatMoney(item.totalAmount)}</Text>
                  <Text className={styles.salaryWorkers}>发放 {item.workerCount} 人</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>👥</Text>
            班组信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>工人总数</Text>
            <Text className={styles.infoValue}>{project.totalWorkers} 人</Text>
          </View>
          <View className={styles.teamTags}>
            {project.totalTeams.map((team, index) => (
              <View key={index} className={styles.teamTag}>
                {team}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.secondaryBtn} onClick={handleGenerateReport}>
          {hasDraft ? '继续草稿' : '生成纪要'}
        </View>
        <View className={styles.primaryBtn} onClick={handleStartInspect}>
          开始抽查
        </View>
      </View>
    </View>
  );
};

export default ProjectDetailPage;
