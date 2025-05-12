'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';

import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function PrivacyPolicy() {
  const { language, t } = useTranslation();
  const [policyContent, setPolicyContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      setIsLoading(true);
      try {
        // 尝试加载当前语言的隐私政策
        const response = await fetch(`/api/privacy-policy?lang=${language}`);

        if (response.ok) {
          const data = await response.json();
          setPolicyContent(data.content);
        } else {
          // 如果当前语言不可用，尝试加载默认语言（en-US）
          const fallbackResponse = await fetch('/api/privacy-policy?lang=en-US');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setPolicyContent(fallbackData.content);
          } else {
            setPolicyContent('# Privacy Policy\n\nUnable to load privacy policy content.');
          }
        }
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
        setPolicyContent('# Privacy Policy\n\nAn error occurred while loading the privacy policy.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, [language]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {t('common.backToHome')}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/4 mt-8"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          ) : (
            <article className="prose prose-blue dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-lg">
              <ReactMarkdown
                components={{
                  // 自定义链接，在新标签页中打开
                  a: ({ node, ...props }) => (
                    <a target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  // 自定义标题样式
                  h1: ({ node, ...props }) => (
                    <h1 className="text-3xl font-bold mb-6" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-2xl font-semibold mt-8 mb-4" {...props} />
                  ),
                  // 自定义列表样式
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 my-4" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 my-4" {...props} />
                  ),
                  // 自定义段落样式
                  p: ({ node, ...props }) => (
                    <p className="my-4" {...props} />
                  ),
                }}
              >
                {policyContent}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
