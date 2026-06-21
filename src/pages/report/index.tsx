import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { mockReports } from '@/data/reports';
import type { InspectionReport } from '@/types';

const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'completed' },
  { label: '草稿', value: 'draft' },
];

const ReportPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredReports = useMemo(() => {
    if (activeFilter === 'all') return mockReports;
    return mockReports.filter(r => r.status === activeFilter);
  }, [activeFilter]);

  const handleReportClick = (reportId: string) => {
    Taro.navigateTo({
      url: `/pages/report-detail/index?id=${reportId}`,
    });
  };

  const handleNewReport = () => {
    Taro.showToast({
      title: '请先扫码进入项目',
      icon: 'none',
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
      <View className={styles.filterBar}>
        {filterOptions.map(option => (
          <View
            key={option.value}
            className={classnames(
              styles.filterItem,
              activeFilter === option.value && styles.filterItemActive
            )}
            onClick={() => setActiveFilter(option.value)}
          >
            {option.label}
          </View>
        ))}
      </View>

      <ScrollView scrollY>
        {filteredReports.length > 0 ? (
          <View className={styles.reportList}>
            {filteredReports.map(report => (
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
                  <View className={styles.metaItem}>
                    <Text className={styles.metaIcon}>👤</Text>
                    <Text>{report.inspector}</Text>
                  </View>
                  <View className={styles.metaItem}>
                    <Text className={styles.metaIcon}>🏢</Text>
                    <Text>{report.inspectorUnit}</Text>
                  </View>
                  <View className={styles.metaItem}>
                    <Text className={styles.metaIcon}>🕐</Text>
                    <Text>{report.inspectTime}</Text>
                  </View>
                </View>

                <Text className={styles.reportSummary}>{report.summary}</Text>

                <View className={styles.reportFooter}>
                  <View className={styles.issueCount}>
                    {report.issues.length > 0 ? (
                      <View className={classnames(styles.issueTag, styles.issueTagRed)}>
                        发现 {report.issues.length} 个问题
                      </View>
                    ) : (
                      <View className={classnames(styles.issueTag, styles.issueTagGray)}>
                        未发现问题
                      </View>
                    )}
                  </View>
                  <Text className={styles.viewDetail}>查看详情 ›</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无核验纪要</Text>
            <View className={styles.newBtn} onClick={handleNewReport}>
              新建核验纪要
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ReportPage;
