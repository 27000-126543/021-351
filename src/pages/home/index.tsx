import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { mockReports } from '@/data/reports';
import type { InspectionReport } from '@/types';

const HomePage: React.FC = () => {
  const [recentReports] = useState<InspectionReport[]>(mockReports.slice(0, 3));

  const handleScan = () => {
    Taro.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        console.log('[Home] 扫码结果:', res.result);
        Taro.navigateTo({
          url: `/pages/project-detail/index?code=${res.result}`,
        });
      },
      fail: (err) => {
        console.error('[Home] 扫码失败:', err);
        Taro.showToast({
          title: '扫码失败，请重试',
          icon: 'none',
        });
      },
    });
  };

  const handleQuickAction = (action: string) => {
    console.log('[Home] 快捷操作:', action);
    switch (action) {
      case 'inspect':
        Taro.switchTab({ url: '/pages/inspect/index' });
        break;
      case 'issue':
        Taro.navigateTo({ url: '/pages/issue-record/index' });
        break;
      case 'report':
        Taro.switchTab({ url: '/pages/report/index' });
        break;
      case 'projects':
        Taro.navigateTo({ url: '/pages/project-detail/index?id=p001' });
        break;
      default:
        break;
    }
  };

  const handleReportClick = (reportId: string) => {
    Taro.navigateTo({
      url: `/pages/report-detail/index?id=${reportId}`,
    });
  };

  const getStatusBadge = (status: InspectionReport['status']) => {
    if (status === 'completed') {
      return <StatusBadge text="已完成" status="success" />;
    }
    return <StatusBadge text="草稿" status="warning" />;
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.greeting}>您好，检查人员</Text>
        <Text className={styles.subInfo}>XX市住建局 · 质量安全监督站</Text>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.scanCard} onClick={handleScan}>
          <View className={styles.scanIcon}>
            <Text className={styles.scanIconText}>📷</Text>
          </View>
          <Text className={styles.scanTitle}>扫一扫 查项目</Text>
          <Text className={styles.scanDesc}>扫描施工现场公示牌项目码</Text>
        </View>

        <View className={styles.quickActions}>
          <View className={styles.actionItem} onClick={() => handleQuickAction('inspect')}>
            <View className={styles.actionCard}>
              <View className={`${styles.actionIcon} ${styles.actionIconBlue}`}>
                <Text>👥</Text>
              </View>
              <Text className={styles.actionText}>随机抽查</Text>
            </View>
          </View>
          <View className={styles.actionItem} onClick={() => handleQuickAction('issue')}>
            <View className={styles.actionCard}>
              <View className={`${styles.actionIcon} ${styles.actionIconOrange}`}>
                <Text>📝</Text>
              </View>
              <Text className={styles.actionText}>问题记录</Text>
            </View>
          </View>
          <View className={styles.actionItem} onClick={() => handleQuickAction('report')}>
            <View className={styles.actionCard}>
              <View className={`${styles.actionIcon} ${styles.actionIconGreen}`}>
                <Text>📋</Text>
              </View>
              <Text className={styles.actionText}>核验纪要</Text>
            </View>
          </View>
          <View className={styles.actionItem} onClick={() => handleQuickAction('projects')}>
            <View className={styles.actionCard}>
              <View className={`${styles.actionIcon} ${styles.actionIconPurple}`}>
                <Text>🏗️</Text>
              </View>
              <Text className={styles.actionText}>项目名录</Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>最近核验</Text>
          <Text className={styles.sectionMore}>查看全部</Text>
        </View>

        <View className={styles.reportList}>
          {recentReports.length > 0 ? (
            recentReports.map((report) => (
              <View
                key={report.id}
                className={styles.reportCard}
                onClick={() => handleReportClick(report.id)}
              >
                <View className={styles.reportHeader}>
                  <Text className={styles.projectName}>{report.projectName}</Text>
                  {getStatusBadge(report.status)}
                </View>
                <View className={styles.reportMeta}>
                  <Text className={styles.metaItem}>检查人：{report.inspector}</Text>
                  <Text className={styles.metaItem}>{report.inspectTime}</Text>
                </View>
                <Text className={styles.reportSummary}>{report.summary}</Text>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无核验记录</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomePage;
