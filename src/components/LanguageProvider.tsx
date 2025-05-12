'use client';

import { useState, useEffect } from 'react';
import { LanguageContext, getCurrentLanguage, getTranslation, setLanguage, DEFAULT_LANGUAGE } from '@/lib/i18n';

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 使用默认语言作为初始值，避免闪烁
  // 在服务器端渲染时，使用默认语言，避免 hydration 不匹配
  const [language, setCurrentLanguage] = useState(
    typeof window === 'undefined' ? DEFAULT_LANGUAGE : getCurrentLanguage()
  );

  useEffect(() => {
    // 在客户端加载时设置正确的语言
    const currentLang = getCurrentLanguage();
    setCurrentLanguage(currentLang);

    // 添加调试日志
    console.log('Current language:', currentLang);
  }, []);

  // 如果语言还没有加载，使用默认语言
  // 我们不检查 !language，因为我们总是有一个初始值
  // 这样可以确保服务器端和客户端渲染结果一致

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const changeLanguage = (newLanguage: string) => {
    // 添加调试日志
    console.log('Changing language to:', newLanguage);

    // 立即更新本地状态，提供即时反馈
    setCurrentLanguage(newLanguage);

    // 然后调用 setLanguage 函数，它会保存设置并刷新页面
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
