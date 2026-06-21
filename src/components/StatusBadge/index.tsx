import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusBadgeProps {
  text: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'default';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ text, status = 'info' }) => {
  return (
    <View className={classnames(styles.badge, styles[status])}>
      <View className={styles.dot} />
      <Text className={styles.badgeText}>{text}</Text>
    </View>
  );
};

export default StatusBadge;
