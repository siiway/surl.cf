'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import Announcement from './Announcement';

export default function AnnouncementProvider() {
  const { language } = useTranslation();
  const [previewData, setPreviewData] = useState<{
    title: string;
    content: string;
    type: 'info' | 'warning' | 'success' | 'error';
  } | null>(null);

  const pathname = usePathname();

  // 检查当前路径是否是管理员页面
  const isAdminPage = pathname?.startsWith('/admin');

  // 如果是管理员页面，不显示公告
  if (isAdminPage && !previewData) {
    return null;
  }

  // 检查是否有预览数据
  useEffect(() => {
    const previewAnnouncement = localStorage.getItem('previewAnnouncement');
    if (previewAnnouncement) {
      try {
        const data = JSON.parse(previewAnnouncement);
        setPreviewData(data);
        // 使用后清除预览数据
        localStorage.removeItem('previewAnnouncement');
      } catch (e) {
        console.error('Failed to parse preview announcement:', e);
      }
    }
  }, []);

  // 如果有预览数据，优先显示预览
  if (previewData) {
    return (
      <Announcement
        title={previewData.title}
        content={previewData.content}
        type={previewData.type || 'info'}
      />
    );
  }

  // 根据当前语言获取对应的公告内容
  const getAnnouncementForLanguage = () => {
    const langKey = language.replace('-', '_').toUpperCase();

    const title = process.env[`NEXT_PUBLIC_ANNOUNCEMENT_TITLE_${langKey}`] || '';
    const content = (process.env[`NEXT_PUBLIC_ANNOUNCEMENT_CONTENT_${langKey}`] || '')
      .replace(/\\n/g, '\n'); // 将 \n 字符串替换为实际的换行符

    return { title, content };
  };

  // 获取当前语言的公告
  const { title, content } = getAnnouncementForLanguage();

  // 如果没有标题，则不显示公告
  if (!title) {
    return null;
  }

  // 显示环境变量中的公告
  return (
    <Announcement
      title={title}
      content={content}
      type={process.env.NEXT_PUBLIC_ANNOUNCEMENT_TYPE as any || 'info'}
    />
  );
}
