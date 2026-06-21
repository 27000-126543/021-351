import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
  onBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showBack = true, 
  rightContent,
  onBack 
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      Taro.navigateBack();
    }
  };

  return (
    <View className={styles.header}>
      <View className={styles.leftArea}>
        {showBack && (
          <View className={styles.backBtn} onClick={handleBack}>
            <Text className={styles.backIcon}>{'<'}</Text>
          </View>
        )}
      </View>
      <Text className={styles.title}>{title}</Text>
      <View className={styles.rightArea}>
        {rightContent}
      </View>
    </View>
  );
};

export default PageHeader;
