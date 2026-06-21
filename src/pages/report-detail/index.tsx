import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import StatusBadge from '@/components/StatusBadge';
import { getReportById } from '@/data/reports';
import { mockWorkers } from '@/data/workers';
import type { InspectionReport, IssueType } from '@/types';
import { useInspectionStore } from '@/store';

const ReportDetailPage: React.FC = () => {
  const router = useRouter();
  const { currentReport, setCurrentReport, sampledWorkerIds } = useInspectionStore();
  
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [loading, setLoading] = useState(true);

  useDidShow(() => {
    const { id } = router.params;
    loadReport(id);
  });

  const loadReport = (id?: string) => {
    console.log('[ReportDetail] 加载纪要, id:', id, 'store中currentReport:', currentReport?.id);

    if (currentReport) {
      setReport(currentReport);
      setLoading(false);
      return;
    }

    if (id) {
      const found = getReportById(id);
      if (found) {
        setCurrentReport(found);
        setReport(found);
      } else {
        setReport(null);
      }
    } else {
      setReport(null);
    }
    setLoading(false);
  };

  const getIssueTypeText = (type: IssueType): string => {
    const map = {
      salary: '工资问题',
      info: '信息问题',
      material: '资料问题',
      other: '其他问题',
    };
    return map[type];
  };

  const handleSign = (role: 'project' | 'inspector') => {
    if (!report) return;
    Taro.navigateTo({
      url: `/pages/signature/index?role=${role}&reportId=${report.id}`,
    });
  };

  const handleShare = () => {
    Taro.showToast({
      title: '分享功能开发中',
      icon: 'none',
    });
  };

  const handleComplete = () => {
    if (!report) return;
    
    Taro.showModal({
      title: '确认完成',
      content: '确认完成本次核验纪要？完成后将无法修改。',
      success: (res) => {
        if (res.confirm) {
          const updatedReport: InspectionReport = {
            ...report,
            status: 'completed',
          };
          setCurrentReport(updatedReport);
          setReport(updatedReport);
          
          Taro.showToast({
            title: '核验已完成',
            icon: 'success',
          });
        }
      },
    });
  };

  const getSampledWorkerNames = () => {
    if (sampledWorkerIds.length === 0) return '暂无抽查记录';
    const workers = mockWorkers.filter(w => sampledWorkerIds.includes(w.id));
    if (workers.length === 0) return '暂无抽查记录';
    const names = workers.map(w => `${w.name}(${w.team})`).join('、');
    return `共抽查 ${workers.length} 人：${names}`;
  };

  if (loading) {
    return (
      <View className={styles.page}>
        <Text className={styles.loading}>加载中...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View className={styles.page}>
        <Text className={styles.loading}>未找到纪要信息，请先生成核验纪要</Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.content}>
        <View className={styles.reportHeader}>
          <Text className={styles.reportTitle}>{report.projectName}</Text>
          <Text className={styles.reportNo}>核验纪要 · {report.inspectTime}</Text>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>👤</Text>
            检查信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>检查人员</Text>
            <Text className={styles.infoValue}>{report.inspector}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>所属单位</Text>
            <Text className={styles.infoValue}>{report.inspectorUnit}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>检查时间</Text>
            <Text className={styles.infoValue}>{report.inspectTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>核验状态</Text>
            <View className={styles.infoValue}>
              {report.status === 'completed' ? (
                <StatusBadge text="已完成" status="success" />
              ) : (
                <StatusBadge text="草稿" status="warning" />
              )}
            </View>
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>👥</Text>
            抽查人员
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoValue} style={{ textAlign: 'left', lineHeight: 1.8 }}>
              {getSampledWorkerNames()}
            </Text>
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>⚠️</Text>
            发现问题 ({report.issues.length})
          </Text>
          {report.issues.length > 0 ? (
            <View className={styles.issueList}>
              {report.issues.map((issue, index) => (
                <View key={issue.id} className={styles.issueCard}>
                  <View className={styles.issueHeader}>
                    <Text className={styles.issueType}>
                      问题 {index + 1}：{getIssueTypeText(issue.type)}
                    </Text>
                    <Text className={styles.issueTime}>{issue.createTime}</Text>
                  </View>
                  {issue.workerName && (
                    <Text className={styles.issueWorker}>涉事工人：{issue.workerName}</Text>
                  )}
                  <Text className={styles.issueDesc}>{issue.description}</Text>
                  {issue.tags.length > 0 && (
                    <View className={styles.issueTags}>
                      {issue.tags.map((tag, i) => (
                        <Tag key={i} text={tag} type="red" />
                      ))}
                    </View>
                  )}
                  {issue.photos && issue.photos.length > 0 && (
                    <View style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {issue.photos.map((photo, i) => (
                        <Image
                          key={i}
                          src={photo}
                          mode="aspectFill"
                          style={{ width: 120, height: 120, borderRadius: 8 }}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text className={styles.infoValue}>本次检查未发现问题</Text>
          )}
        </View>

        <View className={styles.summaryCard}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>📝</Text>
            检查小结
          </Text>
          <Text className={styles.summaryText}>
            {report.summary || `本次在${report.projectName}现场核验，抽查工人信息，${report.issues.length > 0 ? `发现${report.issues.length}个问题，已现场记录并拍照留证。` : '工资发放及人员信息未发现明显异常。'}`}
          </Text>
        </View>

        <View className={styles.signatureSection}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>✍️</Text>
            签字确认
          </Text>
          <View className={styles.signatureRow}>
            <View className={styles.signatureItem}>
              <Text className={styles.signatureLabel}>项目部签字</Text>
              <View className={styles.signatureBox}>
                {report.projectSign ? (
                  <Text className={styles.signatureSigned}>{report.projectSign}</Text>
                ) : (
                  <Text className={styles.signatureText}>未签字</Text>
                )}
              </View>
              <View className={styles.signBtn} onClick={() => handleSign('project')}>
                {report.projectSign ? '重新签字' : '去签字'}
              </View>
            </View>
            <View className={styles.signatureItem}>
              <Text className={styles.signatureLabel}>检查人员签字</Text>
              <View className={styles.signatureBox}>
                {report.inspectorSign ? (
                  <Text className={styles.signatureSigned}>{report.inspectorSign}</Text>
                ) : (
                  <Text className={styles.signatureText}>未签字</Text>
                )}
              </View>
              <View className={styles.signBtn} onClick={() => handleSign('inspector')}>
                {report.inspectorSign ? '重新签字' : '去签字'}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.secondaryBtn} onClick={handleShare}>
          分享
        </View>
        <View
          className={styles.primaryBtn}
          onClick={handleComplete}
        >
          {report.status === 'completed' ? '已完成核验' : '完成核验'}
        </View>
      </View>
    </View>
  );
};

export default ReportDetailPage;
