'use client';

import { createContext, useContext } from 'react';
import zhCN from '@/locales/zh-CN.json';
import enUS from '@/locales/en-US.json';

// 支持的语言
export const LANGUAGES = {
  'zh-CN': '简体中文',
  'en-US': 'English',
};

// 语言数据
export const TRANSLATIONS = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 支持的语言类型
export type SupportedLanguage = 'zh-CN' | 'en-US';

// 默认语言
export const DEFAULT_LANGUAGE: SupportedLanguage = 'zh-CN';

// 回退语言（当请求的语言不存在时使用）
export const FALLBACK_LANGUAGE: SupportedLanguage = 'en-US';

// 获取当前语言
export function getCurrentLanguage(): string {
  // 在服务器端渲染时，始终返回默认语言
  // 这样可以确保服务器端和客户端渲染结果一致
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  try {
    // 从 localStorage 中获取语言设置
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && Object.keys(TRANSLATIONS).includes(storedLanguage)) {
      return storedLanguage;
    }

    // 从浏览器语言设置中获取
    const browserLanguage = navigator.language;
    if (Object.keys(TRANSLATIONS).includes(browserLanguage)) {
      return browserLanguage;
    }

    // 如果浏览器语言不在支持列表中，但是前缀匹配
    const languagePrefix = browserLanguage.split('-')[0];
    const matchingLanguage = Object.keys(TRANSLATIONS).find(lang =>
      lang.startsWith(languagePrefix)
    );

    if (matchingLanguage) {
      return matchingLanguage;
    }
  } catch (error) {
    // 如果出现任何错误（例如，localStorage 不可用），返回默认语言
    console.error('Error getting current language:', error);
    return DEFAULT_LANGUAGE;
  }

  // 默认语言
  return DEFAULT_LANGUAGE;
}

// 设置语言
export function setLanguage(language: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (Object.keys(TRANSLATIONS).includes(language)) {
    // 保存语言设置到 localStorage
    localStorage.setItem('language', language);

    // 刷新页面以应用新语言
    // 使用 URL 对象来确保我们不会添加重复的查询参数
    const url = new URL(window.location.href);

    // 添加时间戳参数以确保页面刷新
    url.searchParams.set('_ts', Date.now().toString());

    // 重定向到新 URL
    window.location.href = url.toString();
  }
}

// 获取翻译
export function getTranslation(language: string, key: string, params?: Record<string, string | number>): string {
  // 确保语言是有效的
  if (!TRANSLATIONS[language as keyof typeof TRANSLATIONS]) {
    language = DEFAULT_LANGUAGE;
  }

  const keys = key.split('.');
  let translation: any = TRANSLATIONS[language as keyof typeof TRANSLATIONS];

  // 遍历键路径
  for (const k of keys) {
    if (!translation || !translation[k]) {
      // 如果当前语言找不到翻译

      // 如果当前语言不是回退语言，尝试使用回退语言
      if (language !== FALLBACK_LANGUAGE) {
        // 递归调用，使用回退语言
        return getTranslation(FALLBACK_LANGUAGE, key, params);
      }

      // 如果当前语言是回退语言但不是默认语言，尝试使用默认语言
      if (FALLBACK_LANGUAGE !== DEFAULT_LANGUAGE && language === FALLBACK_LANGUAGE) {
        // 递归调用，使用默认语言
        return getTranslation(DEFAULT_LANGUAGE, key, params);
      }

      // 如果所有语言都没有，返回键名
      return key;
    }

    // 继续遍历键路径
    translation = translation[k];
  }

  // 如果找到的翻译不是字符串，返回键名
  if (typeof translation !== 'string') {
    return key;
  }

  // 替换参数
  if (params) {
    return Object.entries(params).reduce(
      (str, [paramKey, paramValue]) => str.replace(`{${paramKey}}`, String(paramValue)),
      translation
    );
  }

  return translation;
}

// 创建语言上下文
export const LanguageContext = createContext<{
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  changeLanguage: (language: string) => void;
}>({
  language: DEFAULT_LANGUAGE,
  t: (key: string, params?: Record<string, string | number>) => getTranslation(DEFAULT_LANGUAGE, key, params),
  changeLanguage: setLanguage,
});

// 使用语言钩子
export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
