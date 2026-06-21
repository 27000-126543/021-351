import React, { useState, useEffect } from 'react';
import { View, Text, Textarea, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { ISSUE_TAGS } from '@/types';
import type { IssueType, IssueRecord } from '@/types';
import { getWorkerById } from '@/data/workers';
import { useInspectionStore } from '@/store';
import { generateId } from '@/utils';

const issueTypes: { type: IssueType; icon: string; label: string }[] = [
  { type: 'salary', icon: '💰', label: '工资问题' },
  { type: 'info', icon: '📋', label: '信息问题' },
  { type: 'material', icon: '📂', label: '资料问题' },
  { type: 'other', icon: '📝', label: '其他问题' },
];

const IssueRecordPage: React.FC = () => {
  const router = useRouter();
  const { addIssue, currentReport } = useInspectionStore();

  const [issueType, setIssueType] = useState<IssueType>('salary');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [workerId, setWorkerId] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [workerTeam, setWorkerTeam] = useState('');

  useEffect(() => {
    const { workerId: wid, workerName: name } = router.params;
    console.log('[IssueRecord] 参数:', { workerId: wid, name });

    if (wid) {
      setWorkerId(wid);
      const worker = getWorkerById(wid);
      if (worker) {
        setWorkerName(worker.name);
        setWorkerTeam(worker.team);
      }
    }
    
    if (name && !workerName) {
      setWorkerName(decodeURIComponent(name));
    }
  }, [router.params]);

  const handleTypeChange = (type: IssueType) => {
    console.log('[IssueRecord] 切换问题类型:', type);
    setIssueType(type);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
  };

  const handleAddPhoto = () => {
    Taro.chooseImage({
      count: 9 - photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('[IssueRecord] 选择图片:', res.tempFilePaths);
        setPhotos(prev => [...prev, ...res.tempFilePaths]);
      },
      fail: (err) => {
        console.error('[IssueRecord] 选择图片失败:', err);
      },
    });
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      Taro.showToast({
        title: '请填写问题描述',
        icon: 'none',
      });
      return;
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newIssue: IssueRecord = {
      id: generateId(),
      workerId: workerId || undefined,
      workerName: workerName || undefined,
      type: issueType,
      description: description.trim(),
      photos: [...photos],
      tags: [...selectedTags],
      createTime: timeStr,
      inspector: '张督查',
    };

    console.log('[IssueRecord] 提交问题记录:', newIssue);
    console.log('[IssueRecord] 当前纪要:', currentReport?.id, currentReport?.projectName);

    addIssue(newIssue);

    Taro.showToast({
      title: '记录已保存',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      },
    });
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const getTagClass = (type: string) => {
    const map: Record<string, string> = {
      red: styles.tagRed,
      orange: styles.tagOrange,
      blue: styles.tagBlue,
      gray: styles.tagGray,
    };
    return map[type] || styles.tagGray;
  };

  return (
    <View className={styles.page}>
      <View className={styles.content}>
        {workerName && (
          <View className={styles.workerCard}>
            <View className={styles.avatar}>
              <Text className={styles.avatarText}>{workerName.charAt(0)}</Text>
            </View>
            <View className={styles.workerInfo}>
              <Text className={styles.workerName}>{workerName}</Text>
              <Text className={styles.workerTeam}>{workerTeam || '未知班组'}</Text>
            </View>
          </View>
        )}

        <View className={styles.sectionCard}>
          <Text className={classnames(styles.sectionTitle, styles.sectionTitleRequired)}>
            问题类型
          </Text>
          <View className={styles.typeSelector}>
            {issueTypes.map(item => (
              <View
                key={item.type}
                className={classnames(
                  styles.typeItem,
                  issueType === item.type && styles.typeItemActive
                )}
                onClick={() => handleTypeChange(item.type)}
              >
                <Text className={styles.typeIcon}>{item.icon}</Text>
                <Text className={styles.typeText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.sectionCard}>
          <Text className={classnames(styles.sectionTitle, styles.sectionTitleRequired)}>
            问题描述
          </Text>
          <View className={styles.textareaWrap}>
            <Textarea
              className={styles.textarea}
              placeholder="请详细描述发现的问题，如：工人反映3月份工资尚未到账..."
              placeholderClass={styles.textareaPlaceholder}
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              maxlength={500}
              autoHeight
            />
          </View>
          <Text className={styles.wordCount}>{description.length}/500</Text>
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>问题标签</Text>
          <View className={styles.tagsWrap}>
            {ISSUE_TAGS.map(tag => (
              <View
                key={tag.value}
                className={classnames(
                  styles.tagItem,
                  selectedTags.includes(tag.value) && classnames(styles.tagItemActive, getTagClass(tag.type))
                )}
                onClick={() => handleTagToggle(tag.value)}
              >
                {tag.value}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>现场照片</Text>
          <View className={styles.photoSection}>
            <View className={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={index} className={styles.photoItem}>
                  <Image className={styles.photoImg} src={photo} mode="aspectFill" />
                  <View
                    className={styles.photoDelete}
                    onClick={() => handleDeletePhoto(index)}
                  >
                    ×
                  </View>
                </View>
              ))}
              {photos.length < 9 && (
                <View className={styles.photoAdd} onClick={handleAddPhoto}>
                  <Text className={styles.photoAddIcon}>📷</Text>
                  <Text className={styles.photoAddText}>拍照/上传</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </View>
        <View
          className={classnames(styles.submitBtn, !description.trim() && styles.disabled)}
          onClick={handleSubmit}
        >
          保存记录
        </View>
      </View>
    </View>
  );
};

export default IssueRecordPage;
