import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useInspectionStore } from '@/store';
import { 
  IssueTrackStatus, 
  ISSUE_TRACK_STATUS, 
  IssueRecord,
  IssueTracking,
  TrackLog
} from '@/types';

const IssueTrackingPage: React.FC = () => {
  const router = useRouter();
  const issueId = router.params.issueId || '';
  const reportId = router.params.reportId || '';
  const { currentReport, updateIssueTracking, setCurrentReportById, userInfo } = useInspectionStore();

  const [issue, setIssue] = useState<IssueRecord | null>(null);
  const [responsibleUnit, setResponsibleUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<IssueTrackStatus>('pending');
  const [reviewNote, setReviewNote] = useState('');
  const [logs, setLogs] = useState<TrackLog[]>([]);
  const [hasTracking, setHasTracking] = useState(false);

  useDidShow(() => {
    if (reportId) {
      setCurrentReportById(reportId);
    }
    
    const report = useInspectionStore.getState().currentReport;
    if (!report) return;
    
    const found = report.issues.find(i => i.id === issueId);
    if (found) {
      setIssue(found);
      if (found.tracking) {
        setHasTracking(true);
        setResponsibleUnit(found.tracking.responsibleUnit);
        setDeadline(found.tracking.deadline);
        setStatus(found.tracking.status);
        setReviewNote(found.tracking.reviewNote);
        setLogs(found.tracking.logs || []);
      } else {
        setResponsibleUnit(report.projectInfo?.generalContractor || '');
        setDeadline('');
        setStatus('pending');
        setReviewNote('');
        setLogs([]);
      }
    }
  });

  const handleSave = () => {
    if (!issueId) return;
    
    const now = new Date().toISOString();
    const statusLabel = ISSUE_TRACK_STATUS.find(s => s.value === status)?.label || '';
    
    let newLogs: TrackLog[] = [...logs];
    
    if (hasTracking) {
      const prevTracking = currentReport?.issues.find(i => i.id === issueId)?.tracking;
      const prevStatus = prevTracking?.status;
      
      if (prevStatus !== status || reviewNote !== (prevTracking?.reviewNote || '')) {
        const logNote: string[] = [];
        if (prevStatus !== status) {
          const prevLabel = ISSUE_TRACK_STATUS.find(s => s.value === prevStatus)?.label || '';
          logNote.push(`状态由「${prevLabel}」改为「${statusLabel}」`);
        }
        if (reviewNote && reviewNote !== prevTracking?.reviewNote) {
          logNote.push('更新复查说明');
        }
        
        newLogs.unshift({
          time: now,
          operator: userInfo?.name || '检查人员',
          fromStatus: prevStatus,
          toStatus: status,
          note: logNote.join('；') || '更新整改信息',
        });
      }
    } else {
      newLogs.unshift({
        time: now,
        operator: userInfo?.name || '检查人员',
        fromStatus: undefined,
        toStatus: status,
        note: `创建整改跟踪，状态：${statusLabel}`,
      });
    }
    
    const tracking: IssueTracking = {
      responsibleUnit,
      deadline,
      status,
      reviewNote,
      updateTime: now,
      logs: newLogs,
    };
    
    updateIssueTracking(issueId, tracking);
    setLogs(newLogs);
    setHasTracking(true);
    
    Taro.showToast({
      title: '保存成功',
      icon: 'success',
    });
    
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  const getStatusColor = (statusValue: string) => {
    const statusItem = ISSUE_TRACK_STATUS.find(s => s.value === statusValue);
    return statusItem?.color || 'default';
  };

  const getStatusLabel = (statusValue: string) => {
    const statusItem = ISSUE_TRACK_STATUS.find(s => s.value === statusValue);
    return statusItem?.label || statusValue;
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const mon = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${mon}-${day} ${h}:${m}`;
    } catch {
      return iso;
    }
  };

  if (!issue) {
    return (
      <View className={styles.empty}>
        <Text>未找到问题记录</Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.issueCard}>
        <View className={styles.issueHeader}>
          <Text className={styles.issueTitle}>问题描述</Text>
          <Text className={classnames(styles.statusBadge, styles[`status-${getStatusColor(status)}`])}>
            {getStatusLabel(status)}
          </Text>
        </View>
        <Text className={styles.issueDesc}>{issue.description}</Text>
        <View className={styles.issueMeta}>
          <Text className={styles.issueMetaItem}>类型：{issue.type}</Text>
          <Text className={styles.issueMetaItem}>检查人：{issue.inspector}</Text>
        </View>
      </View>

      <View className={styles.sectionTitle}>整改跟踪</View>

      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>责任单位</Text>
          <Input
            className={styles.formInput}
            value={responsibleUnit}
            onInput={(e) => setResponsibleUnit(e.detail.value)}
            placeholder="请输入责任单位"
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>整改期限</Text>
          <Input
            className={styles.formInput}
            value={deadline}
            onInput={(e) => setDeadline(e.detail.value)}
            placeholder="例如：2026-06-30"
            type="text"
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>处理状态</Text>
          <View className={styles.statusSelect}>
            {ISSUE_TRACK_STATUS.map(item => (
              <View
                key={item.value}
                className={classnames(
                  styles.statusOption,
                  status === item.value && styles[`statusOption-${item.color}`],
                  status === item.value && styles.statusOptionActive
                )}
                onClick={() => setStatus(item.value as IssueTrackStatus)}
              >
                {item.label}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>复查说明</Text>
          <Textarea
            className={styles.formTextarea}
            value={reviewNote}
            onInput={(e) => setReviewNote(e.detail.value)}
            placeholder="请输入复查说明"
            maxlength={500}
          />
        </View>
      </View>

      {logs.length > 0 && (
        <>
          <View className={styles.sectionTitle}>复查记录</View>
          <View className={styles.timelineCard}>
            {logs.map((log, index) => (
              <View key={index} className={styles.timelineItem}>
                <View className={styles.timelineDot}></View>
                <View className={styles.timelineLine}></View>
                <View className={styles.timelineContent}>
                  <View className={styles.timelineHeader}>
                    <Text className={styles.timelineOperator}>{log.operator}</Text>
                    <Text className={styles.timelineTime}>{formatTime(log.time)}</Text>
                  </View>
                  <Text className={styles.timelineNote}>{log.note}</Text>
                  <View className={styles.timelineStatus}>
                    <Text className={classnames(
                      styles.timelineStatusBadge,
                      styles[`status-${getStatusColor(log.toStatus)}`]
                    )}>
                      {getStatusLabel(log.toStatus)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <View className={styles.bottomBar}>
        <View className={styles.saveBtn} onClick={handleSave}>
          保存整改信息
        </View>
      </View>
    </View>
  );
};

export default IssueTrackingPage;
