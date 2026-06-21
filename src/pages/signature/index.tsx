import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro, { useRouter, useReady } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

const SignaturePage: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<any>(null);
  const ctxRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [penColor, setPenColor] = useState('#1d2129');
  const [penWidth, setPenWidth] = useState(4);

  const role = router.params.role || 'inspector';
  const roleText = role === 'project' ? '项目部' : '检查人员';

  useReady(() => {
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
          
          ctxRef.current = ctx;
          canvasRef.current = canvas;
          
          console.log('[Signature] Canvas 初始化完成');
        }
      });
  };

  const getTouchPosition = (e: any) => {
    const touch = e.touches[0] || e.changedTouches[0];
    const query = Taro.createSelectorQuery();
    return {
      x: touch.x,
      y: touch.y,
    };
  };

  const handleTouchStart = (e: any) => {
    if (!ctxRef.current) return;
    
    const touch = e.touches[0];
    const query = Taro.createSelectorQuery();
    query
      .select('#signCanvas')
      .boundingClientRect()
      .exec((res) => {
        if (res && res[0]) {
          const rect = res[0];
          const x = touch.x - rect.left;
          const y = touch.y - rect.top;
          
          ctxRef.current.beginPath();
          ctxRef.current.moveTo(x, y);
          setIsDrawing(true);
          setHasSigned(true);
        }
      });
  };

  const handleTouchMove = (e: any) => {
    if (!isDrawing || !ctxRef.current) return;
    
    const touch = e.touches[0];
    const query = Taro.createSelectorQuery();
    query
      .select('#signCanvas')
      .boundingClientRect()
      .exec((res) => {
        if (res && res[0]) {
          const rect = res[0];
          const x = touch.x - rect.left;
          const y = touch.y - rect.top;
          
          ctxRef.current.lineTo(x, y);
          ctxRef.current.stroke();
        }
      });
  };

  const handleTouchEnd = () => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    
    const query = Taro.createSelectorQuery();
    query
      .select('#signCanvas')
      .boundingClientRect()
      .exec((res) => {
        if (res && res[0]) {
          ctxRef.current.clearRect(0, 0, res[0].width, res[0].height);
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

    console.log('[Signature] 确认签字');
    
    Taro.showToast({
      title: '签字成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      },
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.signInfo}>
        <Text className={styles.signTitle}>{roleText}签字</Text>
        <Text className={styles.signTip}>请在下方区域手写签名</Text>
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
      </View>

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
