import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface TagProps {
  text: string;
  type?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  size?: 'sm' | 'md';
}

const Tag: React.FC<TagProps> = ({ text, type = 'blue', size = 'sm' }) => {
  return (
    <View
      className={classnames(styles.tag, styles[type], styles[size])}
    >
      <Text className={styles.tagText}>{text}</Text>
    </View>
  );
};

export default Tag;
