'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

type AnnouncementType = 'info' | 'warning' | 'success' | 'error';

interface AnnouncementProps {
  title: string;
  content: string;
  type?: AnnouncementType;
  dismissible?: boolean;
}

const typeStyles = {
  info: 'bg-white dark:bg-gray-800 border-blue-500 text-gray-800 dark:text-gray-200',
  warning: 'bg-white dark:bg-gray-800 border-yellow-500 text-gray-800 dark:text-gray-200',
  success: 'bg-white dark:bg-gray-800 border-green-500 text-gray-800 dark:text-gray-200',
  error: 'bg-white dark:bg-gray-800 border-red-500 text-gray-800 dark:text-gray-200',
};

const iconStyles = {
  info: (
    <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
};

export default function Announcement({ title, content, type = 'info', dismissible = true }: AnnouncementProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 创建唯一标识符，用于本地存储
  const announcementId = `${title}-${content.substring(0, 20)}`;

  // 检查本地存储中是否已经关闭过这个公告
  useEffect(() => {
    const dismissedAnnouncements = localStorage.getItem('dismissedAnnouncements');
    let isDismissed = false;

    if (dismissedAnnouncements) {
      try {
        const parsed = JSON.parse(dismissedAnnouncements);
        if (parsed.includes(announcementId)) {
          isDismissed = true;
          setHasBeenDismissed(true);
        }
      } catch (e) {
        // 如果解析失败，重置存储
        localStorage.setItem('dismissedAnnouncements', JSON.stringify([]));
      }
    } else {
      localStorage.setItem('dismissedAnnouncements', JSON.stringify([]));
    }

    // 如果公告没有被关闭过，则显示它
    if (!isDismissed && title) {
      // 延迟显示公告，以便页面加载完成
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);

        // 8秒后自动开始淡出动画（因为内容更多，所以增加显示时间）
        setTimeout(() => {
          setIsAnimating(false);
        }, 8000);

        // 8.3秒后隐藏公告（给动画留出300ms的时间）
        setTimeout(() => {
          setIsVisible(false);
        }, 8300);
      }, 1000);
    }
  }, [title, content, announcementId]);

  const handleDismiss = () => {
    setIsAnimating(false);

    // 给动画留出时间
    setTimeout(() => {
      setIsVisible(false);
      setHasBeenDismissed(true);
    }, 300);

    // 将当前公告添加到已关闭列表
    const dismissedAnnouncements = localStorage.getItem('dismissedAnnouncements');
    if (dismissedAnnouncements) {
      try {
        const parsed = JSON.parse(dismissedAnnouncements);
        if (!parsed.includes(announcementId)) {
          parsed.push(announcementId);
          localStorage.setItem('dismissedAnnouncements', JSON.stringify(parsed));
        }
      } catch (e) {
        localStorage.setItem('dismissedAnnouncements', JSON.stringify([announcementId]));
      }
    } else {
      localStorage.setItem('dismissedAnnouncements', JSON.stringify([announcementId]));
    }
  };

  if (!title || !isVisible || hasBeenDismissed) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 shadow-xl rounded-lg max-w-sm border-l-4 ${typeStyles[type]} transition-all duration-300 ${
        isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {iconStyles[type]}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
          </div>
          {dismissible && (
            <div className="ml-3 flex-shrink-0">
              <button
                onClick={handleDismiss}
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label="关闭"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="mt-2 ml-8 text-sm text-gray-700 dark:text-gray-300">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
