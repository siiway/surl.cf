'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '@/components/Card';
import { useTranslation } from '@/lib/i18n';
import DynamicTitle from '@/components/DynamicTitle';

interface StatsData {
  totalLinks: number;
  recentLinks: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData>({ totalLinks: 0, recentLinks: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/links');

        if (!response.ok) {
          throw new Error(t('admin.dashboard.fetchError'));
        }

        const data = await response.json();

        // 计算统计数据
        const totalLinks = data.links.length;

        // 计算最近 24 小时内创建的链接数量
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recentLinks = data.links.filter(
          (link: { created?: number }) => link.created && link.created > oneDayAgo
        ).length;

        setStats({ totalLinks, recentLinks });
      } catch (err) {
        setError(err instanceof Error ? err.message : t('admin.dashboard.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <DynamicTitle suffix={t('admin.dashboard.title')} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.dashboard.title')}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{t('admin.dashboard.subtitle')}</p>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('admin.dashboard.totalLinks')}</h2>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalLinks}</div>
            )}
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('admin.dashboard.recentLinks')}</h2>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.recentLinks}</div>
            )}
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('admin.dashboard.quickActions')}</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <a
                href="/admin/links"
                className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {t('admin.dashboard.manageLinks')}
              </a>
              <a
                href="/"
                className="block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('admin.dashboard.backToHome')}
              </a>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="shadow-sm">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('admin.dashboard.tips.title')}</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('admin.dashboard.tips.linkManagement.title')}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('admin.dashboard.tips.linkManagement.description')}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('admin.dashboard.tips.security.title')}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('admin.dashboard.tips.security.description')}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
