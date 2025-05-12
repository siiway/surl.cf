'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { RESERVED_SLUGS } from '@/lib/reservedSlugs';
import { useTranslation } from '@/lib/i18n';

export default function ReservedSlugsManager() {
  const { t } = useTranslation();
  const [reservedSlugs, setReservedSlugs] = useState<string[]>([]);
  const [newSlug, setNewSlug] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 加载保留链接
  useEffect(() => {
    setReservedSlugs([...RESERVED_SLUGS]);
  }, []);

  // 过滤保留链接
  const filteredSlugs = reservedSlugs.filter(slug => 
    slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 添加新的保留链接
  const handleAddSlug = () => {
    // 重置状态
    setError('');
    setSuccess('');

    // 验证输入
    if (!newSlug) {
      setError(t('admin.settings.reservedSlugs.errors.emptySlug'));
      return;
    }

    // 验证格式
    const slugRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!slugRegex.test(newSlug)) {
      setError(t('admin.settings.reservedSlugs.errors.invalidFormat'));
      return;
    }

    // 检查是否已存在
    if (reservedSlugs.includes(newSlug)) {
      setError(t('admin.settings.reservedSlugs.errors.alreadyExists'));
      return;
    }

    // 添加到列表
    setIsLoading(true);
    
    // 模拟 API 调用
    setTimeout(() => {
      setReservedSlugs([...reservedSlugs, newSlug]);
      setSuccess(t('admin.settings.reservedSlugs.success.added', { slug: newSlug }));
      setNewSlug('');
      setIsLoading(false);
    }, 500);
  };

  // 删除保留链接
  const handleRemoveSlug = (slug: string) => {
    // 重置状态
    setError('');
    setSuccess('');
    setIsLoading(true);

    // 模拟 API 调用
    setTimeout(() => {
      setReservedSlugs(reservedSlugs.filter(s => s !== slug));
      setSuccess(t('admin.settings.reservedSlugs.success.removed', { slug }));
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('admin.settings.reservedSlugs.title')}
        </h2>
      </CardHeader>
      <CardBody>
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md">
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

        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-200">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              label={t('admin.settings.reservedSlugs.newSlug')}
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder={t('admin.settings.reservedSlugs.newSlugPlaceholder')}
              fullWidth
            />
            <div className="flex items-end">
              <Button
                onClick={handleAddSlug}
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {t('admin.settings.reservedSlugs.addButton')}
              </Button>
            </div>
          </div>

          <div>
            <Input
              label={t('admin.settings.reservedSlugs.search')}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('admin.settings.reservedSlugs.searchPlaceholder')}
              fullWidth
            />
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.settings.reservedSlugs.list')} ({filteredSlugs.length})
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                {filteredSlugs.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSlugs.map((slug) => (
                      <li key={slug} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">{slug}</span>
                        <Button
                          onClick={() => handleRemoveSlug(slug)}
                          variant="danger"
                          size="sm"
                          disabled={isLoading}
                        >
                          {t('admin.settings.reservedSlugs.removeButton')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? t('admin.settings.reservedSlugs.noResults')
                      : t('admin.settings.reservedSlugs.empty')}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('admin.settings.reservedSlugs.description')}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
