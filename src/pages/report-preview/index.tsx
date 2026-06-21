import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useInspectionStore } from '@/store';
import type { InspectionReport, IssueType } from '@/types';
import { formatMoney, getSalaryStatusText } from '@/utils';
import { ISSUE_TRACK_STATUS } from '@/types';

const ReportPreviewPage: React.FC = () => {
  const router = useRouter();
  const { currentReport, setCurrentReportById } = useInspectionStore();
  const [report, setReport] = useState<InspectionReport | null>(null);

  useDidShow(() => {
    const { id } = router.params;
    if (currentReport) {
      setReport(currentReport);
    } else if (id) {
      setCurrentReportById(id);
      const store = useInspectionStore.getState();
      if (store.currentReport) {
        setReport(store.currentReport);
      }
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

  const getTrackStatusText = (status: string) => {
    return ISSUE_TRACK_STATUS.find(s => s.value === status)?.label || status;
  };

  const generateSummary = (r: InspectionReport): string => {
    if (r.summary) return r.summary;
    const issueCount = r.issues.length;
    let text = `本次在${r.projectName}现场核验，`;
    if (r.sampledWorkerNames && r.sampledWorkerNames.length > 0) {
      text += `抽查${r.sampledWorkerNames.length}名工人（${r.sampledWorkerNames.join('、')}），`;
    }
    if (issueCount === 0) {
      text += '工资发放及人员信息未发现明显异常。';
    } else {
      text += `共发现${issueCount}个问题，已现场记录并拍照留证，整改跟踪已落实。`;
    }
    return text;
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleExport = () => {
    Taro.showToast({
      title: '导出功能开发中',
      icon: 'none',
    });
  };

  if (!report) {
    return (
      <View className={styles.page}>
        <Text style={{ textAlign: 'center', padding: 100, color: '#86909c' }}>未找到纪要信息</Text>
      </View>
    );
  }

  const pi = report.projectInfo;

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.previewWrap}>
          <Text className={styles.reportTitle}>建设工程工资专户核验纪要</Text>
          <Text className={styles.reportMeta}>
            编号：{report.id.toUpperCase()} · {report.inspectTime}
          </Text>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>一、项目基本信息</Text>
            <View className={styles.infoTable}>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>项目名称</Text>
                <Text className={styles.infoValue}>{report.projectName}</Text>
              </View>
              {pi && (
                <>
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
                </>
              )}
            </View>
          </View>

          {pi && pi.recentSalary.length > 0 && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>二、近三月工资发放</Text>
              <View className={styles.salaryTable}>
                <View className={styles.salaryHeader}>
                  <Text className={styles.salaryCell}>月份</Text>
                  <Text className={styles.salaryCell}>发放金额</Text>
                  <Text className={styles.salaryCell}>发放人数</Text>
                  <Text className={styles.salaryCell}>状态</Text>
                </View>
                {pi.recentSalary.map((item, idx) => (
                  <View key={idx} className={styles.salaryRow}>
                    <Text className={styles.salaryData}>{item.month}</Text>
                    <Text className={classnames(styles.salaryData, styles.salaryDataHighlight)}>
                      {formatMoney(item.totalAmount)}
                    </Text>
                    <Text className={styles.salaryData}>{item.workerCount} 人</Text>
                    <Text className={styles.salaryData}>{getSalaryStatusText(item.status)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>三、抽查人员名单</Text>
            {report.sampledWorkerNames && report.sampledWorkerNames.length > 0 ? (
              <View className={styles.workerList}>
                {report.sampledWorkerNames.map((name, idx) => (
                  <View key={idx} className={styles.workerTag}>
                    {idx + 1}. {name}
                  </View>
                ))}
              </View>
            ) : (
              <Text className={styles.noIssue}>暂无抽查记录</Text>
            )}
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>四、发现问题清单</Text>
            {report.issues.length > 0 ? (
              report.issues.map((issue, idx) => (
                <View key={issue.id} className={styles.issueItem}>
                  <View className={styles.issueHeader}>
                    <Text className={styles.issueType}>
                      问题 {idx + 1}：{getIssueTypeText(issue.type)}
                    </Text>
                    <Text className={styles.issueTime}>{issue.createTime}</Text>
                  </View>
                  {issue.workerName && (
                    <Text className={styles.issueContent}>
                      涉事工人：{issue.workerName}
                    </Text>
                  )}
                  <Text className={styles.issueContent}>{issue.description}</Text>
                  {issue.tags.length > 0 && (
                    <View className={styles.issueTags}>
                      {issue.tags.map((tag, i) => (
                        <Text key={i} className={styles.issueTag}>{tag}</Text>
                      ))}
                    </View>
                  )}
                  {issue.tracking && (
                    <View className={styles.trackingSection}>
                      <Text className={styles.trackingTitle}>整改跟踪</Text>
                      <View className={styles.trackingInfo}>
                        <Text>责任单位：{issue.tracking.responsibleUnit}{'\n'}</Text>
                        <Text>整改期限：{issue.tracking.deadline}{'\n'}</Text>
                        <Text>处理状态：{getTrackStatusText(issue.tracking.status)}{'\n'}</Text>
                        {issue.tracking.reviewNote && (
                          <Text>复查说明：{issue.tracking.reviewNote}{'\n'}</Text>
                        )}
                        <Text>更新时间：{issue.tracking.updateTime}</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text className={styles.noIssue}>本次检查未发现问题</Text>
            )}
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>五、检查小结</Text>
            <Text className={styles.summaryText}>{generateSummary(report)}</Text>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>六、签字确认</Text>
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
                <Text className={styles.signatureDate}>
                  {report.projectSign ? report.inspectTime : ''}
                </Text>
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
                <Text className={styles.signatureDate}>
                  {report.inspectorSign ? report.inspectTime : ''}
                </Text>
              </View>
            </View>
          </View>

          <View className={styles.footer}>
            <Text>本纪要一式两份，项目部、检查组各执一份</Text>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.backBtn} onClick={handleBack}>
          返回
        </View>
        <View className={styles.exportBtn} onClick={handleExport}>
          导出纪要
        </View>
      </View>
    </View>
  );
};

export default ReportPreviewPage;
