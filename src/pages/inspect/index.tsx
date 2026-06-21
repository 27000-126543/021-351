import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import StatusBadge from '@/components/StatusBadge';
import { mockWorkers } from '@/data/workers';
import type { Worker } from '@/types';
import { formatMoney, randomPick, getStatusText } from '@/utils';
import { useInspectionStore } from '@/store';

const teams = ['钢筋班组', '木工班组', '混凝土班组', '水电班组', '装饰班组'];

const InspectPage: React.FC = () => {
  const { setSampledWorkers: setStoreSampledWorkers, currentReport } = useInspectionStore();

  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sampleCount, setSampleCount] = useState('5');
  const [sampledWorkers, setSampledWorkers] = useState<Worker[]>([]);
  const [hasSampled, setHasSampled] = useState(false);

  const filteredWorkers = useMemo(() => {
    let workers = [...mockWorkers];
    if (selectedTeams.length > 0) {
      workers = workers.filter(w => selectedTeams.includes(w.team));
    }
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      workers = workers.filter(
        w => w.name.toLowerCase().includes(keyword) || w.team.toLowerCase().includes(keyword)
      );
    }
    return workers;
  }, [selectedTeams, searchKeyword]);

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev => {
      if (prev.includes(team)) {
        return prev.filter(t => t !== team);
      }
      return [...prev, team];
    });
    setHasSampled(false);
    setSampledWorkers([]);
  };

  const handleRandomPick = () => {
    const count = parseInt(sampleCount, 10);
    if (isNaN(count) || count <= 0) {
      Taro.showToast({ title: '请输入有效人数', icon: 'none' });
      return;
    }
    if (filteredWorkers.length === 0) {
      Taro.showToast({ title: '没有符合条件的工人', icon: 'none' });
      return;
    }
    const picked = randomPick(filteredWorkers, Math.min(count, filteredWorkers.length));
    setSampledWorkers(picked);
    setHasSampled(true);
    
    const workerIds = picked.map(w => w.id);
    setStoreSampledWorkers(workerIds);
    
    console.log('[Inspect] 随机抽查工人:', picked.length, '人, IDs:', workerIds);
    console.log('[Inspect] 当前纪要:', currentReport?.id, currentReport?.projectName);
  };

  const handleWorkerClick = (worker: Worker) => {
    console.log('[Inspect] 查看工人详情:', worker.name);
  };

  const handleRecordIssue = (worker: Worker) => {
    Taro.navigateTo({
      url: `/pages/issue-record/index?workerId=${worker.id}&workerName=${encodeURIComponent(worker.name)}`,
    });
  };

  const getStatusType = (status: Worker['status']) => {
    const map = {
      on: 'green',
      off: 'gray',
      pending: 'orange',
    } as const;
    return map[status];
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.searchSection}>
          <View className={styles.searchBox}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchInput}
              placeholder="搜索班组或工人姓名"
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.teamSection}>
          <Text className={styles.sectionTitle}>选择班组</Text>
          <View className={styles.teamList}>
            {teams.map(team => (
              <View
                key={team}
                className={classnames(styles.teamTag, selectedTeams.includes(team) && styles.teamTagActive)}
                onClick={() => toggleTeam(team)}
              >
                {team}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.resultSection}>
          <View className={styles.resultHeader}>
            <Text className={styles.resultTitle}>
              {hasSampled ? '抽查结果' : '待抽查'}
            </Text>
            <Text className={styles.resultCount}>
              {hasSampled ? (
                <>已抽取 <Text className={styles.resultCountHighlight}>{sampledWorkers.length}</Text> 人</>
              ) : (
                <>共 <Text className={styles.resultCountHighlight}>{filteredWorkers.length}</Text> 人可选</>
              )}
            </Text>
          </View>

          {hasSampled ? (
            <View className={styles.workerList}>
              {sampledWorkers.map(worker => (
                <View key={worker.id} className={styles.workerCard} onClick={() => handleWorkerClick(worker)}>
                  <View className={styles.workerHeader}>
                    <View className={styles.avatar}>
                      <Text className={styles.avatarText}>{worker.name.charAt(0)}</Text>
                    </View>
                    <View className={styles.workerInfo}>
                      <Text className={styles.workerName}>{worker.name}</Text>
                      <Text className={styles.workerId}>身份证尾号：{worker.idCardTail}</Text>
                    </View>
                    <Tag text={getStatusText(worker.status)} type={getStatusType(worker.status)} />
                  </View>
                  <View className={styles.workerBody}>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>最近发薪</Text>
                      <Text className={styles.infoValueHighlight}>
                        {worker.lastSalaryMonth ? `${worker.lastSalaryMonth} · ${formatMoney(worker.lastSalary)}` : '暂无'}
                      </Text>
                    </View>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>进场日期</Text>
                      <Text className={styles.infoValue}>{worker.entryDate}</Text>
                    </View>
                  </View>
                  <View className={styles.workerFooter}>
                    <Text className={styles.teamText}>{worker.team}</Text>
                    <View className={styles.recordBtn} onClick={(e) => { e.stopPropagation(); handleRecordIssue(worker); }}>
                      记录问题
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>👆</Text>
              <Text className={styles.emptyText}>选择班组后点击底部按钮随机抽查</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.actionSection}>
        <View className={styles.countSelector}>
          <Text className={styles.countLabel}>抽查人数</Text>
          <Input
            className={styles.countInput}
            type="number"
            value={sampleCount}
            onInput={(e) => setSampleCount(e.detail.value)}
          />
        </View>
        <View
          className={classnames(styles.randomBtn, filteredWorkers.length === 0 && styles.disabled)}
          onClick={handleRandomPick}
        >
          随机抽查
        </View>
      </View>
    </View>
  );
};

export default InspectPage;
