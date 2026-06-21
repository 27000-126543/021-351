import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Image, Canvas } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useInspectionStore } from '@/store';
import type { InspectionReport, IssueType } from '@/types';
import { formatMoney, getSalaryStatusText } from '@/utils';
import { ISSUE_TRACK_STATUS } from '@/types';

const ReportPreviewPage: React.FC = () => {
  const router = useRouter();
  const { currentReport, setCurrentReportById } = useInspectionStore();
  const [report, setReport] = useState<InspectionReport | null>(null);
  const canvasRef = useRef<any>(null);
  const canvasNodeRef = useRef<any>(null);

  useDidShow(() => {
    const { id } = router.params;
    if (currentReport) {
      setReport(currentReport);
    } else if (id) {
      setCurrentReportById(id);
      const store = useInspectionStore.getState();
      if (store.currentReport) {
        setReport(store.currentReport);
      }
    }
  });

  const getIssueTypeText = (type: IssueType): string => {
    const map: Record<IssueType, string> = {
      salary: '工资问题',
      info: '信息问题',
      material: '资料问题',
      other: '其他问题',
    };
    return map[type];
  };

  const getTrackStatusText = (status: string) => {
    return ISSUE_TRACK_STATUS.find(s => s.value === status)?.label || status;
  };

  const generateSummary = (r: InspectionReport): string => {
    if (r.summary) return r.summary;
    const issueCount = r.issues.length;
    let text = `本次在${r.projectName}现场核验，`;
    if (r.sampledWorkerNames && r.sampledWorkerNames.length > 0) {
      text += `抽查${r.sampledWorkerNames.length}名工人（${r.sampledWorkerNames.join('、')}），`;
    }
    if (issueCount === 0) {
      text += '工资发放及人员信息未发现明显异常。';
    } else {
      text += `共发现${issueCount}个问题，已现场记录并拍照留证，整改跟踪已落实。`;
    }
    return text;
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleCopyId = () => {
    if (!report) return;
    Taro.setClipboardData({
      data: report.id.toUpperCase(),
      success: () => {
        Taro.showToast({
          title: '纪要编号已复制',
          icon: 'success',
        });
      },
    });
  };

  const handleExport = async () => {
    if (!report) return;

    Taro.showLoading({ title: '生成中...' });

    try {
      const query = Taro.createSelectorQuery();
      query
        .select('#previewCanvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (!res || !res[0]) {
            Taro.hideLoading();
            Taro.showToast({ title: '导出失败', icon: 'none' });
            return;
          }

          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = Taro.getSystemInfoSync().pixelRatio;
          const width = 750;
          const height = 1200;

          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);

          ctx.fillStyle = '#1d2129';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('建设工程工资专户核验纪要', width / 2, 60);

          ctx.fillStyle = '#86909c';
          ctx.font = '22px sans-serif';
          ctx.fillText(`编号：${report.id.toUpperCase()}  ·  ${report.inspectTime}`, width / 2, 100);

          ctx.textAlign = 'left';
          ctx.fillStyle = '#1d2129';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText('一、项目基本信息', 40, 160);

          ctx.font = '24px sans-serif';
          ctx.fillStyle = '#4e5969';

          const infoItems = [
            { label: '项目名称', value: report.projectName },
          ];
          if (report.projectInfo) {
            infoItems.push(
              { label: '开户银行', value: report.projectInfo.bankName },
              { label: '银行账号', value: report.projectInfo.bankAccount },
              { label: '总包单位', value: report.projectInfo.generalContractor },
              { label: '分包单位', value: report.projectInfo.subcontractors.join('、') },
              { label: '工人总数', value: `${report.projectInfo.totalWorkers} 人` }
            );
          }

          let y = 200;
          infoItems.forEach(item => {
            ctx.fillStyle = '#86909c';
            ctx.fillText(item.label, 40, y);
            ctx.fillStyle = '#1d2129';
            ctx.fillText(item.value, 160, y);
            y += 38;
          });

          y += 20;
          ctx.fillStyle = '#1d2129';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText('二、近三月工资发放', 40, y);
          y += 40;

          if (report.projectInfo?.recentSalary?.length) {
            ctx.font = '22px sans-serif';
            const salaryY = y;
            const colX = [40, 200, 380, 560];
            
            ctx.fillStyle = '#f2f3f5';
            ctx.fillRect(40, salaryY - 28, 670, 36);
            
            ctx.fillStyle = '#4e5969';
            ctx.fillText('月份', colX[0], salaryY);
            ctx.fillText('发放金额', colX[1], salaryY);
            ctx.fillText('发放人数', colX[2], salaryY);
            ctx.fillText('状态', colX[3], salaryY);

            report.projectInfo.recentSalary.forEach((s, i) => {
              const rowY = salaryY + 36 + i * 36;
              ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#f7f8fa';
              ctx.fillRect(40, rowY - 28, 670, 36);
              ctx.fillStyle = '#1d2129';
              ctx.fillText(s.month, colX[0], rowY);
              ctx.fillText(formatMoney(s.totalAmount), colX[1], rowY);
              ctx.fillText(`${s.workerCount} 人`, colX[2], rowY);
              ctx.fillStyle = s.status === 'normal' ? '#00b42a' : s.status === 'warning' ? '#ff7d00' : '#f53f3f';
              ctx.fillText(getSalaryStatusText(s.status), colX[3], rowY);
            });
            y = salaryY + 36 + report.projectInfo.recentSalary.length * 36 + 20;
          }

          y += 20;
          ctx.fillStyle = '#1d2129';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText('三、抽查人员名单', 40, y);
          y += 40;

          ctx.font = '24px sans-serif';
          ctx.fillStyle = '#1d2129';
          if (report.sampledWorkerNames?.length) {
            const workersText = report.sampledWorkerNames.join('、');
            const maxWidth = 670;
            const words = report.sampledWorkerNames;
            let line = '';
            words.forEach((w, i) => {
              const testLine = line + (line ? '、' : '') + w;
              if (ctx.measureText(testLine).width > maxWidth && line) {
                ctx.fillText(line, 40, y);
                line = w;
                y += 36;
              } else {
                line = testLine;
              }
            });
            if (line) {
              ctx.fillText(line, 40, y);
              y += 36;
            }
          } else {
            ctx.fillStyle = '#86909c';
            ctx.fillText('暂无抽查记录', 40, y);
            y += 36;
          }

          y += 20;
          ctx.fillStyle = '#1d2129';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText(`四、发现问题清单 (${report.issues.length}个)`, 40, y);
          y += 40;

          if (report.issues.length > 0) {
            report.issues.forEach((issue, idx) => {
              ctx.fillStyle = '#f7f8fa';
              ctx.fillRect(40, y - 26, 670, 8);
              y += 16;

              ctx.fillStyle = '#1d2129';
              ctx.font = 'bold 24px sans-serif';
              ctx.fillText(`问题 ${idx + 1}：${getIssueTypeText(issue.type)}`, 40, y);
              y += 36;

              ctx.font = '22px sans-serif';
              ctx.fillStyle = '#4e5969';
              const descMaxWidth = 670;
              const descChars = issue.description;
              let descLine = '';
              for (let i = 0; i < descChars.length; i++) {
                const test = descLine + descChars[i];
                if (ctx.measureText(test).width > descMaxWidth && descLine) {
                  ctx.fillText(descLine, 40, y);
                  descLine = descChars[i];
                  y += 30;
                } else {
                  descLine = test;
                }
              }
              if (descLine) {
                ctx.fillText(descLine, 40, y);
                y += 30;
              }

              if (issue.tracking) {
                y += 8;
                ctx.fillStyle = '#e8f3ff';
                ctx.fillRect(40, y - 22, 670, 6);
                y += 10;

                ctx.fillStyle = '#165dff';
                ctx.font = 'bold 22px sans-serif';
                ctx.fillText('整改跟踪', 40, y);
                y += 30;

                ctx.font = '20px sans-serif';
                ctx.fillStyle = '#4e5969';
                ctx.fillText(`责任单位：${issue.tracking.responsibleUnit}`, 40, y); y += 28;
                ctx.fillText(`整改期限：${issue.tracking.deadline}`, 40, y); y += 28;
                ctx.fillText(`处理状态：${getTrackStatusText(issue.tracking.status)}`, 40, y); y += 28;
                if (issue.tracking.reviewNote) {
                  ctx.fillText(`复查说明：${issue.tracking.reviewNote}`, 40, y); y += 28;
                }
                y += 10;
              }
              y += 20;
            });
          } else {
            ctx.font = '24px sans-serif';
            ctx.fillStyle = '#86909c';
            ctx.fillText('本次检查未发现问题', 40, y);
            y += 36;
          }

          y += 20;
          ctx.fillStyle = '#1d2129';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText('五、检查小结', 40, y);
          y += 40;

          ctx.font = '24px sans-serif';
          ctx.fillStyle = '#4e5969';
          const summaryText = generateSummary(report);
          const summaryMaxWidth = 670;
          let summaryLine = '';
          for (let i = 0; i < summaryText.length; i++) {
            const test = summaryLine + summaryText[i];
            if (ctx.measureText(test).width > summaryMaxWidth && summaryLine) {
              ctx.fillText(summaryLine, 40, y);
              summaryLine = summaryText[i];
              y += 36;
            } else {
              summaryLine = test;
            }
          }
          if (summaryLine) {
            ctx.fillText(summaryLine, 40, y);
            y += 36;
          }

          y += 30;
          ctx.fillStyle = '#1d2129';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText('六、签字确认', 40, y);
          y += 40;

          const signY = y;
          const signBoxWidth = 310;
          const signBoxHeight = 140;
          
          ctx.strokeStyle = '#e5e6eb';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(40, signY, signBoxWidth, signBoxHeight);
          ctx.strokeRect(400, signY, signBoxWidth, signBoxHeight);
          ctx.setLineDash([]);

          ctx.fillStyle = '#4e5969';
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('项目部签字', 40 + signBoxWidth / 2, signY - 10);
          ctx.fillText('检查人员签字', 400 + signBoxWidth / 2, signY - 10);

          if (report.projectSign) {
            ctx.fillStyle = '#1d2129';
            ctx.font = '36px cursive';
            ctx.fillText(report.projectSign, 40 + signBoxWidth / 2, signY + 90);
          } else {
            ctx.fillStyle = '#c9cdd4';
            ctx.font = '22px sans-serif';
            ctx.fillText('未签字', 40 + signBoxWidth / 2, signY + 80);
          }

          if (report.inspectorSign) {
            ctx.fillStyle = '#1d2129';
            ctx.font = '36px cursive';
            ctx.fillText(report.inspectorSign, 400 + signBoxWidth / 2, signY + 90);
          } else {
            ctx.fillStyle = '#c9cdd4';
            ctx.font = '22px sans-serif';
            ctx.fillText('未签字', 400 + signBoxWidth / 2, signY + 80);
          }

          ctx.textAlign = 'left';

          const footerY = height - 80;
          ctx.fillStyle = '#c9cdd4';
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('本纪要一式两份，项目部、检查组各执一份', width / 2, footerY);

          const dataUrl = canvas.toDataURL('image/png');
          console.log('[Export] 生成图片成功, 长度:', dataUrl.length);

          Taro.hideLoading();

          Taro.showActionSheet({
            itemList: ['保存到相册', '保存到本地文件'],
            success: (actionRes) => {
              if (actionRes.tapIndex === 0) {
                saveToAlbum(dataUrl);
              } else if (actionRes.tapIndex === 1) {
                Taro.setClipboardData({
                  data: dataUrl,
                  success: () => {
                    Taro.showToast({
                      title: '图片数据已复制',
                      icon: 'success',
                    });
                  }
                });
              }
            }
          });
        });
    } catch (e) {
      console.error('[Export] 导出失败:', e);
      Taro.hideLoading();
      Taro.showToast({
        title: '导出失败',
        icon: 'none',
      });
    }
  };

  const saveToAlbum = (dataUrl: string) => {
    Taro.showLoading({ title: '保存中...' });
    
    const fs = Taro.getFileSystemManager();
    const filePath = `${Taro.env.USER_DATA_PATH}/report_${Date.now()}.png`;
    
    fs.writeFile({
      filePath,
      data: dataUrl.replace(/^data:image\/\w+;base64,/, ''),
      encoding: 'base64',
      success: () => {
        Taro.hideLoading();
        Taro.saveImageToPhotosAlbum({
          filePath,
          success: () => {
            Taro.showToast({
              title: '已保存到相册',
              icon: 'success',
            });
          },
          fail: (err) => {
            console.error('[Save] 保存相册失败:', err);
            Taro.showToast({
              title: '保存失败，请授权相册权限',
              icon: 'none',
            });
          }
        });
      },
      fail: (err) => {
        console.error('[Save] 写入文件失败:', err);
        Taro.hideLoading();
        Taro.showToast({
          title: '保存失败',
          icon: 'none',
        });
      }
    });
  };

  if (!report) {
    return (
      <View className={styles.page}>
        <Text style={{ textAlign: 'center', padding: 100, color: '#86909c' }}>未找到纪要信息</Text>
      </View>
    );
  }

  const pi = report.projectInfo;

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollView}>
        <View className={styles.previewWrap}>
          <View className={styles.reportHeader}>
            <Text className={styles.reportTitle}>建设工程工资专户核验纪要</Text>
            <View className={styles.reportIdRow} onClick={handleCopyId}>
              <Text className={styles.reportMeta}>
                编号：{report.id.toUpperCase()} · {report.inspectTime}
              </Text>
              <Text className={styles.copyBtn}>📋 复制</Text>
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>一、项目基本信息</Text>
            <View className={styles.infoTable}>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>项目名称</Text>
                <Text className={styles.infoValue}>{report.projectName}</Text>
              </View>
              {pi && (
                <>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>开户银行</Text>
                    <Text className={styles.infoValue}>{pi.bankName}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>银行账号</Text>
                    <Text className={styles.infoValue}>{pi.bankAccount}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>总包单位</Text>
                    <Text className={styles.infoValue}>{pi.generalContractor}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>分包单位</Text>
                    <Text className={styles.infoValue}>{pi.subcontractors.join('、')}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>工人总数</Text>
                    <Text className={styles.infoValue}>{pi.totalWorkers} 人</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {pi && pi.recentSalary.length > 0 && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>二、近三月工资发放</Text>
              <View className={styles.salaryTable}>
                <View className={styles.salaryHeader}>
                  <Text className={styles.salaryCell}>月份</Text>
                  <Text className={styles.salaryCell}>发放金额</Text>
                  <Text className={styles.salaryCell}>发放人数</Text>
                  <Text className={styles.salaryCell}>状态</Text>
                </View>
                {pi.recentSalary.map((item, idx) => (
                  <View key={idx} className={styles.salaryRow}>
                    <Text className={styles.salaryData}>{item.month}</Text>
                    <Text className={classnames(styles.salaryData, styles.salaryDataHighlight)}>
                      {formatMoney(item.totalAmount)}
                    </Text>
                    <Text className={styles.salaryData}>{item.workerCount} 人</Text>
                    <Text className={styles.salaryData}>{getSalaryStatusText(item.status)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>三、抽查人员名单</Text>
            {report.sampledWorkerNames && report.sampledWorkerNames.length > 0 ? (
              <View className={styles.workerList}>
                {report.sampledWorkerNames.map((name, idx) => (
                  <View key={idx} className={styles.workerTag}>
                    {idx + 1}. {name}
                  </View>
                ))}
              </View>
            ) : (
              <Text className={styles.noIssue}>暂无抽查记录</Text>
            )}
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>四、发现问题清单</Text>
            {report.issues.length > 0 ? (
              report.issues.map((issue, idx) => (
                <View key={issue.id} className={styles.issueItem}>
                  <View className={styles.issueHeader}>
                    <Text className={styles.issueType}>
                      问题 {idx + 1}：{getIssueTypeText(issue.type)}
                    </Text>
                    <Text className={styles.issueTime}>{issue.createTime}</Text>
                  </View>
                  {issue.workerName && (
                    <Text className={styles.issueContent}>
                      涉事工人：{issue.workerName}
                    </Text>
                  )}
                  <Text className={styles.issueContent}>{issue.description}</Text>
                  {issue.tags.length > 0 && (
                    <View className={styles.issueTags}>
                      {issue.tags.map((tag, i) => (
                        <Text key={i} className={styles.issueTag}>{tag}</Text>
                      ))}
                    </View>
                  )}
                  {issue.tracking && (
                    <View className={styles.trackingSection}>
                      <Text className={styles.trackingTitle}>整改跟踪</Text>
                      <View className={styles.trackingInfo}>
                        <Text>责任单位：{issue.tracking.responsibleUnit}{'\n'}</Text>
                        <Text>整改期限：{issue.tracking.deadline}{'\n'}</Text>
                        <Text>处理状态：{getTrackStatusText(issue.tracking.status)}{'\n'}</Text>
                        {issue.tracking.reviewNote && (
                          <Text>复查说明：{issue.tracking.reviewNote}{'\n'}</Text>
                        )}
                        <Text>更新时间：{issue.tracking.updateTime}</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text className={styles.noIssue}>本次检查未发现问题</Text>
            )}
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>五、检查小结</Text>
            <Text className={styles.summaryText}>{generateSummary(report)}</Text>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>六、签字确认</Text>
            <View className={styles.signatureRow}>
              <View className={styles.signatureItem}>
                <Text className={styles.signatureLabel}>项目部签字</Text>
                <View className={styles.signatureBox}>
                  {report.projectSignImage ? (
                    <Image
                      src={report.projectSignImage}
                      className={styles.signatureImage}
                      mode="aspectFit"
                    />
                  ) : report.projectSign ? (
                    <Text className={styles.signatureSigned}>{report.projectSign}</Text>
                  ) : (
                    <Text className={styles.signatureText}>未签字</Text>
                  )}
                </View>
                <Text className={styles.signatureDate}>
                  {report.projectSign ? report.inspectTime : ''}
                </Text>
              </View>
              <View className={styles.signatureItem}>
                <Text className={styles.signatureLabel}>检查人员签字</Text>
                <View className={styles.signatureBox}>
                  {report.inspectorSignImage ? (
                    <Image
                      src={report.inspectorSignImage}
                      className={styles.signatureImage}
                      mode="aspectFit"
                    />
                  ) : report.inspectorSign ? (
                    <Text className={styles.signatureSigned}>{report.inspectorSign}</Text>
                  ) : (
                    <Text className={styles.signatureText}>未签字</Text>
                  )}
                </View>
                <Text className={styles.signatureDate}>
                  {report.inspectorSign ? report.inspectTime : ''}
                </Text>
              </View>
            </View>
          </View>

          <View className={styles.footer}>
            <Text>本纪要一式两份，项目部、检查组各执一份</Text>
          </View>
        </View>
      </ScrollView>

      <Canvas
        id="previewCanvas"
        type="2d"
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '750px', height: '1200px' }}
      />

      <View className={styles.bottomBar}>
        <View className={styles.backBtn} onClick={handleBack}>
          返回
        </View>
        <View className={styles.secondaryBtn} onClick={handleCopyId}>
          复制编号
        </View>
        <View className={styles.exportBtn} onClick={handleExport}>
          导出图片
        </View>
      </View>
    </View>
  );
};

export default ReportPreviewPage;
