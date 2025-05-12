'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Card, { CardHeader, CardBody, CardFooter } from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Turnstile from '@/components/Turnstile';
import Announcement from '@/components/Announcement';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import DynamicTitle from '@/components/DynamicTitle';
import { useTranslation } from '@/lib/i18n';

export default function Home() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [useCustomSlug, setUseCustomSlug] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 检测暗黑模式
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 检查 URL 查询参数中是否有错误
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');

    if (errorParam === 'not_found') {
      setError(t('home.errors.notFound'));
    } else if (errorParam === 'failed_to_retrieve') {
      setError(t('home.errors.failedToRetrieve'));
    }
  }, []);

  // 检查是否启用 Turnstile - 使用静态值进行服务器端渲染
  // 避免在服务器端和客户端之间的差异
  const initialTurnstileEnabled = typeof window === 'undefined'
    ? false // 在服务器端渲染时，默认为 false
    : (process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === 'true');

  const [isTurnstileEnabled, setIsTurnstileEnabled] = useState(initialTurnstileEnabled);

  // 获取最新的 Turnstile 设置
  useEffect(() => {
    const fetchTurnstileSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings/turnstile');
        if (response.ok) {
          const data = await response.json();
          setIsTurnstileEnabled(data.enabled);
        }
      } catch (error) {
        console.error('Error fetching Turnstile settings:', error);
      }
    };

    // 只在客户端执行
    if (typeof window !== 'undefined') {
      fetchTurnstileSettings();
    }
  }, []);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 重置状态
    setError('');
    setShortUrl('');
    setCopied(false);

    // 验证 URL
    if (!url) {
      setError(t('home.form.urlRequired'));
      return;
    }

    try {
      // 验证 URL 格式
      new URL(url);
    } catch (err) {
      setError(t('home.form.invalidUrl'));
      return;
    }

    // 验证自定义短链接
    if (useCustomSlug && !customSlug) {
      setError(t('home.form.customSlugRequired'));
      return;
    }

    // 如果启用了 Turnstile，验证令牌
    if (isTurnstileEnabled && !turnstileToken) {
      setError(t('home.form.turnstileRequired'));
      return;
    }

    // 发送请求
    setIsLoading(true);
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          ...(isTurnstileEnabled ? { token: turnstileToken } : {}),
          ...(useCustomSlug && customSlug ? { customSlug } : {})
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('home.errors.general'));
      }

      setShortUrl(data.shortUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('home.errors.general'));
    } finally {
      setIsLoading(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = () => {
    if (!shortUrl) return;

    navigator.clipboard.writeText(shortUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setError(t('home.errors.clipboard'));
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-geist-sans)]">
      {/* 动态标题组件 */}
      <DynamicTitle />

      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{t('common.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{t('common.subtitle')}</p>
        </header>

        <main>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('home.form.submitButton')}</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  ref={inputRef}
                  label={t('home.form.urlPlaceholder')}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('home.form.urlPlaceholder')}
                  fullWidth
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  }
                />

                <div className="flex items-center mb-2">
                  <input
                    id="custom-slug-checkbox"
                    type="checkbox"
                    checked={useCustomSlug}
                    onChange={(e) => setUseCustomSlug(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="custom-slug-checkbox" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {t('home.form.customSlugLabel')}
                  </label>
                </div>

                {useCustomSlug && (
                  <div className="space-y-2">
                    <Input
                      label={t('home.form.customSlugLabel')}
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      placeholder={t('home.form.customSlugPlaceholder')}
                      fullWidth
                      leftIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('home.form.customSlugHelp')}
                    </p>
                  </div>
                )}

                {isTurnstileEnabled && (
                  <div className="flex justify-center">
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                      onVerify={setTurnstileToken}
                      theme={isDarkMode ? 'dark' : 'light'}
                    />
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    disabled={!url || (useCustomSlug && !customSlug) || (isTurnstileEnabled && !turnstileToken) || isLoading}
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                  >
                    {isLoading ? t('home.form.processingButton') : t('home.form.submitButton')}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {shortUrl && (
            <Card className="shadow-lg border-t-4 border-green-500">
              <CardHeader>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('home.result.title')}</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    readOnly
                    value={shortUrl}
                    fullWidth
                    className="bg-gray-50 dark:bg-gray-800 font-medium"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="success"
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    }
                  >
                    {copied ? t('home.result.copiedButton') : t('home.result.copyButton')}
                  </Button>
                </div>
              </CardBody>
              <CardFooter>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('home.result.description')}
                  </p>
                  {useCustomSlug && customSlug && (
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('home.result.customSlugSuccess', { slug: customSlug })}
                    </p>
                  )}
                </div>
              </CardFooter>
            </Card>
          )}
        </main>

        <footer className="mt-16 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('common.footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <a
              href={process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/siiway/surl.cf'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center"
            >
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {t('common.footer.github')}
            </a>
            <a href="/admin" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              {t('common.footer.admin')}
            </a>
            <a href="/privacy" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              {t('common.footer.privacy')}
            </a>
            <div className="border-l border-gray-300 dark:border-gray-700 pl-4 ml-2">
              <LanguageSwitcher />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
