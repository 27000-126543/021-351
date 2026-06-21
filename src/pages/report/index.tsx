import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { useInspectionStore } from '@/store';
import type { InspectionReport } from '@/types';

const statusFilters = [
  { label: '全部', value: 'all' },
  { label: '草稿', value: 'draft' },
  { label: '已完成', value: 'completed' },
];

const ReportPage: React.FC = () => {
  const { allReports, initReports, setCurrentReportById } = useInspectionStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  useDidShow(() => {
    initReports();
  });

  const filteredReports = useMemo(() => {
    let reports = [...allReports];

    if (activeFilter !== 'all') {
      reports = reports.filter(r => r.status === activeFilter);
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      reports = reports.filter(r =>
        r.projectName.toLowerCase().includes(keyword) ||
        r.inspector.toLowerCase().includes(keyword) ||
        r.projectId.toLowerCase().includes(keyword)
      );
    }

    return reports;
  }, [allReports, activeFilter, searchKeyword]);

  const handleReportClick = (reportId: string) => {
    setCurrentReportById(reportId);
    Taro.navigateTo({
      url: `/pages/report-detail/index?id=${reportId}`,
    });
  };

  const handleNewReport = () => {
    Taro.switchTab({ url: '/pages/home/index' });
  };

  const getStatusBadge = (status: InspectionReport['status']) => {
    if (status === 'completed') {
      return <StatusBadge text="已完成" status="success" />;
    }
    return <StatusBadge text="草稿" status="warning" />;
  };

  return (
    <View className={styles.page}>
      <View className={styles.searchBar}>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索项目名、检查人"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.filterBar}>
        {statusFilters.map(option => (
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
        <View className={styles.reportCount}>
          共 {filteredReports.length} 条
        </View>
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

                {report.projectInfo && (
                  <View className={styles.projectInfoRow}>
                    <Text className={styles.projectInfoText}>
                      🏦 {report.projectInfo.bankName} · 总包：{report.projectInfo.generalContractor}
                    </Text>
                  </View>
                )}

                <Text className={styles.reportSummary}>
                  {report.issues.length > 0
                    ? `发现 ${report.issues.length} 个问题：${report.issues.map(i => i.tags.join(',')).filter(Boolean).join('、')}`
                    : '未发现问题'
                  }
                </Text>

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
                    {report.projectSign && report.inspectorSign && (
                      <View className={classnames(styles.issueTag, styles.issueTagGreen)}>
                        已签字
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
            <Text className={styles.emptyText}>
              {searchKeyword ? '未找到匹配的纪要' : '暂无核验纪要'}
            </Text>
            <View className={styles.newBtn} onClick={handleNewReport}>
              去扫码新建
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ReportPage;
