'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';

interface DynamicTitleProps {
  suffix?: string;
}

/**
 * 动态标题组件
 * 根据当前语言动态更新页面标题
 */
export default function DynamicTitle({ suffix }: DynamicTitleProps) {
  const { t, language } = useTranslation();
  
  useEffect(() => {
    // 获取基本标题
    const baseTitle = t('common.title');
    
    // 获取副标题
    const subtitle = t('common.subtitle');
    
    // 构建完整标题
    let fullTitle = baseTitle;
    
    if (subtitle) {
      fullTitle += ` - ${subtitle}`;
    }
    
    // 如果有额外的后缀，添加到标题中
    if (suffix) {
      fullTitle += ` | ${suffix}`;
    }
    
    // 更新文档标题
    document.title = fullTitle;
  }, [t, language, suffix]);
  
  // 这个组件不渲染任何内容
  return null;
}
