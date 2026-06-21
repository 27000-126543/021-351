import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockReports } from '@/data/reports';

const MinePage: React.FC = () => {
  const totalReports = mockReports.length;
  const completedReports = mockReports.filter(r => r.status === 'completed').length;
  const totalIssues = mockReports.reduce((sum, r) => sum + r.issues.length, 0);

  const handleMenuClick = (menu: string) => {
    console.log('[Mine] 点击菜单:', menu);
    Taro.showToast({
      title: '功能开发中',
      icon: 'none',
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>检</Text>
          </View>
          <View className={styles.userDetail}>
            <Text className={styles.userName}>张督查</Text>
            <Text className={styles.userUnit}>XX市住建局</Text>
            <Text className={styles.userRole}>质量安全监督站 · 高级监督员</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.statsCard}>
          <Text className={styles.statsTitle}>本月检查统计</Text>
          <View className={styles.statsGrid}>
            <View className={styles.statsItem}>
              <Text className={styles.statsNumber}>{totalReports}</Text>
              <Text className={styles.statsLabel}>检查次数</Text>
            </View>
            <View className={styles.statsItem}>
              <Text className={styles.statsNumber}>{completedReports}</Text>
              <Text className={styles.statsLabel}>已完成</Text>
            </View>
            <View className={styles.statsItem}>
              <Text className={classnames(styles.statsNumber, styles.statsNumberRed)}>
                {totalIssues}
              </Text>
              <Text className={styles.statsLabel}>发现问题</Text>
            </View>
          </View>
        </View>

        <View className={styles.menuSection}>
          <View className={styles.menuCard}>
            <View className={styles.menuItem} onClick={() => handleMenuClick('projects')}>
              <View className={classnames(styles.menuIcon, styles.menuIconBlue)}>
                <Text>🏗️</Text>
              </View>
              <Text className={styles.menuText}>关注项目</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuClick('templates')}>
              <View className={classnames(styles.menuIcon, styles.menuIconGreen)}>
                <Text>📑</Text>
              </View>
              <Text className={styles.menuText}>检查模板</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuClick('history')}>
              <View className={classnames(styles.menuIcon, styles.menuIconOrange)}>
                <Text>📊</Text>
              </View>
              <Text className={styles.menuText}>历史记录</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>

        <View className={styles.menuSection}>
          <View className={styles.menuCard}>
            <View className={styles.menuItem} onClick={() => handleMenuClick('settings')}>
              <View className={classnames(styles.menuIcon, styles.menuIconGray)}>
                <Text>⚙️</Text>
              </View>
              <Text className={styles.menuText}>设置</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuClick('about')}>
              <View className={classnames(styles.menuIcon, styles.menuIconGray)}>
                <Text>ℹ️</Text>
              </View>
              <Text className={styles.menuText}>关于</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MinePage;
