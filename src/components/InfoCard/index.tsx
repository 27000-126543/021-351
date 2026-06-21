import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface InfoItem {
  label: string;
  value: string;
}

interface InfoCardProps {
  title?: string;
  items: InfoItem[];
  extra?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, items, extra }) => {
  return (
    <View className={styles.card}>
      {(title || extra) && (
        <View className={styles.cardHeader}>
          {title && <Text className={styles.cardTitle}>{title}</Text>}
          {extra && <View className={styles.cardExtra}>{extra}</View>}
        </View>
      )}
      <View className={styles.cardBody}>
        {items.map((item, index) => (
          <View key={index} className={styles.infoRow}>
            <Text className={styles.infoLabel}>{item.label}</Text>
            <Text className={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default InfoCard;
