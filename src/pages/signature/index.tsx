import React, { useState, useRef } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro, { useRouter, useReady } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useInspectionStore } from '@/store';

const roleSignNameMap: Record<string, string> = {
  project: '项目部负责人',
  inspector: '张督查',
};

const SignaturePage: React.FC = () => {
  const router = useRouter();
  const { 
    setProjectSign, 
    setInspectorSign, 
    currentReport,
    setCurrentReportById 
  } = useInspectionStore();

  const canvasRef = useRef<any>(null);
  const ctxRef = useRef<any>(null);
  const canvasNodeRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [penColor, setPenColor] = useState('#1d2129');
  const [penWidth, setPenWidth] = useState(4);
  const [existingSign, setExistingSign] = useState('');
  const [existingSignImage, setExistingSignImage] = useState('');

  const role = (router.params.role as 'project' | 'inspector') || 'inspector';
  const reportId = router.params.reportId;
  const roleText = role === 'project' ? '项目部' : '检查人员';

  useReady(() => {
    if (reportId) {
      setCurrentReportById(reportId);
    }
    
    if (currentReport) {
      if (role === 'project') {
        setExistingSign(currentReport.projectSign || '');
        setExistingSignImage(currentReport.projectSignImage || '');
      } else {
        setExistingSign(currentReport.inspectorSign || '');
        setExistingSignImage(currentReport.inspectorSignImage || '');
      }
    }
    
    initCanvas();
  });

  const initCanvas = () => {
    const query = Taro.createSelectorQuery();
    query
      .select('#signCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res && res[0]) {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = Taro.getSystemInfoSync().pixelRatio;
          
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);
          
          ctx.strokeStyle = penColor;
          ctx.lineWidth = penWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, res[0].width, res[0].height);
          
          ctxRef.current = ctx;
          canvasNodeRef.current = canvas;
          
          console.log('[Signature] Canvas 初始化完成, role:', role, '已有签名图片:', existingSignImage ? '有' : '无');
        }
      });
  };

  const getCanvasPos = (e: any, callback: (x: number, y: number) => void) => {
    const touch = e.touches[0] || e.changedTouches[0];
    const query = Taro.createSelectorQuery();
    query
      .select('#signCanvas')
      .boundingClientRect()
      .exec((res) => {
        if (res && res[0]) {
          const rect = res[0];
          const x = touch.x - rect.left;
          const y = touch.y - rect.top;
          callback(x, y);
        }
      });
  };

  const handleTouchStart = (e: any) => {
    if (!ctxRef.current) return;
    
    getCanvasPos(e, (x, y) => {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(x, y);
      setIsDrawing(true);
      setHasSigned(true);
    });
  };

  const handleTouchMove = (e: any) => {
    if (!isDrawing || !ctxRef.current) return;
    
    getCanvasPos(e, (x, y) => {
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    });
  };

  const handleTouchEnd = () => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (!ctxRef.current || !canvasNodeRef.current) return;
    
    const query = Taro.createSelectorQuery();
    query
      .select('#signCanvas')
      .boundingClientRect()
      .exec((res) => {
        if (res && res[0]) {
          ctxRef.current.fillStyle = '#ffffff';
          ctxRef.current.fillRect(0, 0, res[0].width, res[0].height);
          ctxRef.current.strokeStyle = penColor;
          ctxRef.current.lineWidth = penWidth;
          setHasSigned(false);
        }
      });
  };

  const handleColorChange = (color: string) => {
    setPenColor(color);
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
    }
  };

  const handleWidthChange = (width: number) => {
    setPenWidth(width);
    if (ctxRef.current) {
      ctxRef.current.lineWidth = width;
    }
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const handleConfirm = () => {
    if (!hasSigned) {
      Taro.showToast({
        title: '请先签字',
        icon: 'none',
      });
      return;
    }

    if (!canvasNodeRef.current) {
      Taro.showToast({
        title: '签名生成失败',
        icon: 'none',
      });
      return;
    }

    const signImage = canvasNodeRef.current.toDataURL('image/png');
    const signName = roleSignNameMap[role] || '已签字';
    
    console.log('[Signature] 生成签名图片, 长度:', signImage.length);
    
    if (role === 'project') {
      setProjectSign(signName, signImage);
    } else {
      setInspectorSign(signName, signImage);
    }

    Taro.showToast({
      title: `${roleText}签字成功`,
      icon: 'success',
      success: () => {
        setTimeout(() => {
          Taro.navigateBack();
        }, 1200);
      },
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.signInfo}>
        <Text className={styles.signTitle}>{roleText}签字</Text>
        <Text className={styles.signTip}>
          {hasSigned ? '请确认签名无误后点击保存' : '请在下方区域手写签名'}
        </Text>
      </View>

      <View className={styles.canvasWrap}>
        <Canvas
          id="signCanvas"
          className={styles.signCanvas}
          type="2d"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        {!hasSigned && (
          <View className={styles.placeholder}>
            <Text className={styles.placeholderIcon}>✍️</Text>
            <Text className={styles.placeholderText}>请在此处签名</Text>
          </View>
        )}
      </View>

      <View className={styles.toolbar}>
        <View className={styles.toolBtn} onClick={handleClear}>
          <Text className={styles.toolIcon}>🗑️</Text>
          <Text className={styles.toolText}>清除</Text>
        </View>
        <View className={styles.toolBtn} onClick={() => handleColorChange('#1d2129')}>
          <Text
            className={styles.toolIcon}
            style={{ color: '#1d2129', fontWeight: 'bold' }}
          >
            ●
          </Text>
          <Text className={styles.toolText}>黑色</Text>
        </View>
        <View className={styles.toolBtn} onClick={() => handleColorChange('#165dff')}>
          <Text
            className={styles.toolIcon}
            style={{ color: '#165dff', fontWeight: 'bold' }}
          >
            ●
          </Text>
          <Text className={styles.toolText}>蓝色</Text>
        </View>
        <View className={styles.toolBtn} onClick={() => handleWidthChange(2)}>
          <Text className={styles.toolIcon} style={{ fontSize: 20 }}>━</Text>
          <Text className={styles.toolText}>细</Text>
        </View>
        <View className={styles.toolBtn} onClick={() => handleWidthChange(5)}>
          <Text className={styles.toolIcon} style={{ fontSize: 28 }}>━</Text>
          <Text className={styles.toolText}>粗</Text>
        </View>
      </View>

      {(existingSign || existingSignImage) && (
        <View style={{ padding: '0 32rpx', marginBottom: 20 }}>
          <Text style={{ fontSize: 26, color: '#86909c' }}>历史签名：</Text>
        </View>
      )}

      <View className={styles.bottomBar}>
        <View className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </View>
        <View
          className={classnames(styles.confirmBtn, !hasSigned && styles.disabled)}
          onClick={handleConfirm}
        >
          确认签字
        </View>
      </View>
    </View>
  );
};

export default SignaturePage;
