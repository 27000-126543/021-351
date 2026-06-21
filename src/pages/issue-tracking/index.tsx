import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import { ISSUE_TRACK_STATUS, type IssueRecord, type IssueType, type IssueTracking } from '@/types';
import { useInspectionStore } from '@/store';

const IssueTrackingPage: React.FC = () => {
  const router = useRouter();
  const { currentReport, updateIssueTracking, setCurrentReportById } = useInspectionStore();

  const [issue, setIssue] = useState<IssueRecord | null>(null);
  const [responsibleUnit, setResponsibleUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    const { issueId, reportId } = router.params;
    console.log('[IssueTracking] 参数:', { issueId, reportId });

    if (reportId) {
      setCurrentReportById(reportId);
    }

    if (issueId && currentReport) {
      const found = currentReport.issues.find(i => i.id === issueId);
      if (found) {
        setIssue(found);
        if (found.tracking) {
          setResponsibleUnit(found.tracking.responsibleUnit);
          setDeadline(found.tracking.deadline);
          setStatus(found.tracking.status);
          setReviewNote(found.tracking.reviewNote);
        } else {
          const defaultUnit = currentReport.projectInfo?.generalContractor || '';
          setResponsibleUnit(defaultUnit);
        }
      }
    }
  }, [router.params, currentReport]);

  const getIssueTypeText = (type: IssueType): string => {
    const map: Record<IssueType, string> = {
      salary: '工资问题',
      info: '信息问题',
      material: '资料问题',
      other: '其他问题',
    };
    return map[type];
  };

  const getStatusClass = (value: string) => {
    const map: Record<string, string> = {
      pending: styles.statusPending,
      processing: styles.statusProcessing,
      completed: styles.statusCompleted,
      verified: styles.statusVerified,
    };
    return map[value] || '';
  };

  const handleSave = () => {
    if (!issue) return;
    if (!responsibleUnit.trim()) {
      Taro.showToast({ title: '请填写责任单位', icon: 'none' });
      return;
    }
    if (!deadline) {
      Taro.showToast({ title: '请选择整改期限', icon: 'none' });
      return;
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const tracking: IssueTracking = {
      responsibleUnit: responsibleUnit.trim(),
      deadline,
      status: status as IssueTracking['status'],
      reviewNote: reviewNote.trim(),
      updateTime: timeStr,
    };

    console.log('[IssueTracking] 保存整改跟踪:', tracking);
    updateIssueTracking(issue.id, tracking);

    Taro.showToast({
      title: '保存成功',
      icon: 'success',
      success: () => {
        setTimeout(() => Taro.navigateBack(), 1000);
      },
    });
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  if (!issue) {
    return (
      <View className={styles.page}>
        <View className={styles.content}>
          <Text style={{ textAlign: 'center', padding: 100, color: '#86909c' }}>未找到问题信息</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.content}>
        <View className={styles.issueCard}>
          <View className={styles.issueHeader}>
            <Text className={styles.issueType}>问题：{getIssueTypeText(issue.type)}</Text>
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
          {issue.tracking && (
            <View style={{ marginTop: 16, paddingTop: 16, borderTop: '1rpx solid #f2f3f5' }}>
              <Text style={{ fontSize: 26, color: '#4e5969', marginBottom: 8, display: 'block' }}>
                上次更新：{issue.tracking.updateTime}
              </Text>
              <Tag text={ISSUE_TRACK_STATUS.find(s => s.value === issue.tracking!.status)?.label || ''} type="orange" size="md" />
            </View>
          )}
        </View>

        <View className={styles.sectionCard}>
          <Text className={classnames(styles.sectionTitle, styles.sectionTitleRequired)}>
            整改跟踪
          </Text>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>责任单位</Text>
            <Input
              className={styles.formInput}
              placeholder="请填写责任单位"
              value={responsibleUnit}
              onInput={(e) => setResponsibleUnit(e.detail.value)}
              maxlength={50}
            />
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>整改期限</Text>
            <Input
              className={styles.formInput}
              type="number"
              placeholder="例如：2024-04-15"
              value={deadline}
              onInput={(e) => setDeadline(e.detail.value)}
            />
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>处理状态</Text>
            <View className={styles.statusSelector}>
              {ISSUE_TRACK_STATUS.map(item => (
                <View
                  key={item.value}
                  className={classnames(
                    styles.statusItem,
                    status === item.value && classnames(styles.statusItemActive, getStatusClass(item.value))
                  )}
                  onClick={() => setStatus(item.value)}
                >
                  {item.label}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formRow}>
            <Text className={styles.formLabel}>复查说明</Text>
            <View className={styles.textareaWrap}>
              <Textarea
                className={styles.textarea}
                placeholder="请填写复查情况说明..."
                value={reviewNote}
                onInput={(e) => setReviewNote(e.detail.value)}
                maxlength={500}
                autoHeight
              />
            </View>
            <Text className={styles.wordCount}>{reviewNote.length}/500</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </View>
        <View className={styles.submitBtn} onClick={handleSave}>
          保存整改
        </View>
      </View>
    </View>
  );
};

export default IssueTrackingPage;
