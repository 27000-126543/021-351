import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '../Tag';
import type { Worker } from '@/types';
import { formatMoney, getStatusText } from '@/utils';

interface WorkerCardProps {
  worker: Worker;
  onClick?: () => void;
  showAction?: boolean;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onClick, showAction = true }) => {
  const getStatusType = (status: Worker['status']) => {
    const map = {
      on: 'green',
      off: 'gray',
      pending: 'orange',
    } as const;
    return map[status];
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>{worker.name.charAt(0)}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.name}>{worker.name}</Text>
          <Text className={styles.idTail}>身份证尾号：{worker.idCardTail}</Text>
        </View>
        <Tag text={getStatusText(worker.status)} type={getStatusType(worker.status)} />
      </View>
      <View className={styles.cardBody}>
        <View className={styles.infoRow}>
          <Text className={styles.label}>所属班组</Text>
          <Text className={styles.value}>{worker.team}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>最近发薪</Text>
          <Text className={styles.valueHighlight}>
            {worker.lastSalaryMonth ? `${worker.lastSalaryMonth} · ${formatMoney(worker.lastSalary)}` : '暂无'}
          </Text>
        </View>
      </View>
      {showAction && (
        <View className={styles.cardFooter}>
          <Text className={styles.actionText}>查看详情 ></Text>
        </View>
      )}
    </View>
  );
};

export default WorkerCard;
