import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import StatusBadge from '@/components/StatusBadge';
import type { InspectionReport, IssueType, IssueRecord } from '@/types';
import { ISSUE_TRACK_STATUS } from '@/types';
import { useInspectionStore } from '@/store';
import { formatMoney, getSalaryStatusText } from '@/utils';

const ReportDetailPage: React.FC = () => {
  const router = useRouter();
  const { 
    currentReport, 
    setCurrentReportById, 
    deleteIssue, 
    completeReport 
  } = useInspectionStore();
  
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [loading, setLoading] = useState(true);

  useDidShow(() => {
    const { id } = router.params;
    console.log('[ReportDetail] useDidShow, id:', id, 'currentReport:', currentReport?.id);

    if (currentReport) {
      setReport(currentReport);
      setLoading(false);
      return;
    }

    if (id) {
      setCurrentReportById(id);
      setTimeout(() => {
        const store = useInspectionStore.getState();
        if (store.currentReport) {
          setReport(store.currentReport);
        } else {
          setReport(null);
        }
        setLoading(false);
      }, 100);
    } else {
      setReport(null);
      setLoading(false);
    }
  });

  const getIssueTypeText = (type: IssueType): string => {
    const map: Record<IssueType, string> = {
      salary: '工资问题',
      info: '信息问题',
      material: '资料问题',
      other: '其他问题',
    };
    return map[type];
  };

  const getTrackStatusBadge = (status: string) => {
    const config = ISSUE_TRACK_STATUS.find(s => s.value === status);
    if (!config) return null;
    return <StatusBadge text={config.label} status={config.color as any} />;
  };

  const handleSign = (role: 'project' | 'inspector') => {
    if (!report) return;
    Taro.navigateTo({
      url: `/pages/signature/index?role=${role}&reportId=${report.id}`,
    });
  };

  const handleTrackIssue = (issue: IssueRecord) => {
    if (!report) return;
    Taro.navigateTo({
      url: `/pages/issue-tracking/index?issueId=${issue.id}&reportId=${report.id}`,
    });
  };

  const handlePreview = () => {
    if (!report) return;
    Taro.navigateTo({
      url: `/pages/report-preview/index?id=${report.id}`,
    });
  };

  const handleEditIssue = (issue: IssueRecord) => {
    if (!report || report.status === 'completed') return;
    Taro.navigateTo({
      url: `/pages/issue-record/index?issueId=${issue.id}&reportId=${report.id}`,
    });
  };

  const handleDeleteIssue = (issueId: string) => {
    if (!report || report.status === 'completed') return;
    
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条问题记录吗？删除后无法恢复。',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          deleteIssue(issueId);
          const store = useInspectionStore.getState();
          setReport(store.currentReport);
        }
      },
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
      content: '确认完成本次核验纪要？完成后将无法修改问题和签字。',
      success: (res) => {
        if (res.confirm) {
          completeReport();
          const store = useInspectionStore.getState();
          setReport(store.currentReport);
          
          Taro.showToast({
            title: '核验已完成',
            icon: 'success',
          });
        }
      },
    });
  };

  const generateSummary = (r: InspectionReport): string => {
    if (r.summary) return r.summary;
    const issueCount = r.issues.length;
    const salaryIssues = r.issues.filter(i => i.type === 'salary').length;
    const infoIssues = r.issues.filter(i => i.type === 'info').length;
    const materialIssues = r.issues.filter(i => i.type === 'material').length;
    
    let text = `本次在${r.projectName}现场核验，`;
    if (r.sampledWorkerNames && r.sampledWorkerNames.length > 0) {
      text += `抽查${r.sampledWorkerNames.length}名工人（${r.sampledWorkerNames.join('、')}），`;
    }
    
    if (issueCount === 0) {
      text += '工资发放及人员信息未发现明显异常。';
    } else {
      text += `共发现${issueCount}个问题`;
      const parts: string[] = [];
      if (salaryIssues > 0) parts.push(`工资类${salaryIssues}项`);
      if (infoIssues > 0) parts.push(`信息类${infoIssues}项`);
      if (materialIssues > 0) parts.push(`资料类${materialIssues}项`);
      if (parts.length > 0) text += `（${parts.join('、')}）`;
      text += '，已现场记录并拍照留证。';
    }
    return text;
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

  if (!report) {
    return (
      <View className={styles.page}>
        <Text className={styles.loading}>未找到纪要信息，请先生成核验纪要</Text>
      </View>
    );
  }

  const pi = report.projectInfo;
  const isDraft = report.status === 'draft';

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.content}>
        <View className={styles.reportHeader}>
          <Text className={styles.reportTitle}>{report.projectName}</Text>
          <Text className={styles.reportNo}>核验纪要 · {report.inspectTime}</Text>
        </View>

        {pi && (
          <View className={styles.infoCard}>
            <Text className={styles.cardTitle}>
              <Text className={styles.cardTitleIcon}>🏦</Text>
              项目资料
            </Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>开户银行</Text>
              <Text className={styles.infoValue}>{pi.bankName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>银行账号</Text>
              <Text className={styles.infoValue}>{pi.bankAccount}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>总包单位</Text>
              <Text className={styles.infoValue}>{pi.generalContractor}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>分包单位</Text>
              <Text className={styles.infoValue}>{pi.subcontractors.join('、')}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>工人总数</Text>
              <Text className={styles.infoValue}>{pi.totalWorkers} 人</Text>
            </View>
            {pi.recentSalary.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 28, color: '#4e5969', marginBottom: 12, display: 'block' }}>近三月工资发放</Text>
                {pi.recentSalary.map((item, idx) => (
                  <View key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12rpx 0', borderBottom: '1rpx solid #f2f3f5' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 28, color: '#1d2129', fontWeight: 500 }}>{item.month}</Text>
                      {getSalaryStatus(item.status)}
                    </View>
                    <View style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: 32, fontWeight: 600, color: '#165dff', display: 'block' }}>{formatMoney(item.totalAmount)}</Text>
                      <Text style={{ fontSize: 24, color: '#86909c' }}>发放 {item.workerCount} 人</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

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

        {report.sampledWorkerNames && report.sampledWorkerNames.length > 0 && (
          <View className={styles.infoCard}>
            <Text className={styles.cardTitle}>
              <Text className={styles.cardTitleIcon}>👥</Text>
              抽查人员 ({report.sampledWorkerNames.length}人)
            </Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoValue} style={{ textAlign: 'left', lineHeight: 1.8 }}>
                {report.sampledWorkerNames.join('、')}
              </Text>
            </View>
          </View>
        )}

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
                  {issue.tracking && (
                    <View className={styles.trackingInfo}>
                      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 26, fontWeight: 500, color: '#1d2129' }}>整改跟踪</Text>
                        {getTrackStatusBadge(issue.tracking.status)}
                      </View>
                      <Text style={{ fontSize: 24, color: '#4e5969', lineHeight: 1.6 }}>
                        责任单位：{issue.tracking.responsibleUnit}{'\n'}
                        整改期限：{issue.tracking.deadline}{'\n'}
                        {issue.tracking.reviewNote ? `复查说明：${issue.tracking.reviewNote}` : ''}
                      </Text>
                    </View>
                  )}
                  {!issue.tracking && isDraft && (
                    <View className={styles.trackingInfo} style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: 24, color: '#86909c' }}>尚未设置整改跟踪</Text>
                    </View>
                  )}
                  <View className={styles.issueActions}>
                    <View
                      className={styles.issueActionBtn}
                      onClick={() => handleTrackIssue(issue)}
                    >
                      整改跟踪
                    </View>
                    {isDraft && (
                      <>
                        <View
                          className={styles.issueActionBtn}
                          onClick={() => handleEditIssue(issue)}
                        >
                          编辑
                        </View>
                        <View
                          className={classnames(styles.issueActionBtn, styles.issueActionDelete)}
                          onClick={() => handleDeleteIssue(issue.id)}
                        >
                          删除
                        </View>
                      </>
                    )}
                  </View>
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
          <Text className={styles.summaryText}>{generateSummary(report)}</Text>
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
        <View className={styles.secondaryBtn} onClick={handlePreview}>
          预览纪要
        </View>
        <View
          className={classnames(styles.primaryBtn, !isDraft && styles.primaryBtnDisabled)}
          onClick={isDraft ? handleComplete : undefined}
        >
          {report.status === 'completed' ? '已完成核验' : '完成核验'}
        </View>
      </View>
    </View>
  );
};

export default ReportDetailPage;
