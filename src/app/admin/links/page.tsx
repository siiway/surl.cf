'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useTranslation } from '@/lib/i18n';
import ReservedSlugsManager from '@/components/ReservedSlugsManager';
import DynamicTitle from '@/components/DynamicTitle';

interface Link {
  id: string;
  url: string;
  created?: number;
}

export default function AdminLinks() {
  const { t } = useTranslation();
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLinks = async (cursor?: string) => {
    try {
      const url = new URL('/api/admin/links', window.location.origin);
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(t('admin.links.errors.fetchFailed'));
      }

      const data = await response.json();

      return {
        links: data.links,
        nextCursor: data.nextCursor
      };
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const data = await fetchLinks();
        setLinks(data.links);
        setFilteredLinks(data.links);
        setNextCursor(data.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('admin.links.errors.fetchFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    loadLinks();
  }, []);

  useEffect(() => {
    // 过滤链接
    if (searchTerm) {
      const filtered = links.filter(
        link => link.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                link.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLinks(filtered);
    } else {
      setFilteredLinks(links);
    }
  }, [searchTerm, links]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const data = await fetchLinks(nextCursor);
      setLinks(prevLinks => [...prevLinks, ...data.links]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.links.errors.loadMoreFailed'));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/links/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(t('admin.links.errors.deleteFailed'));
      }

      // 从列表中移除已删除的链接
      setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.links.errors.deleteFailed'));
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return t('admin.links.unknown');
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div>
      <DynamicTitle suffix={t('admin.links.title')} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.links.title')}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{t('admin.links.subtitle')}</p>
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

      <Card className="shadow-sm mb-6">
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('admin.links.search.title')}</h2>
        </CardHeader>
        <CardBody>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('admin.links.search.placeholder')}
            fullWidth
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </CardBody>
      </Card>

      <Card className="shadow-sm mb-6">
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('admin.links.list.title')}</h2>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{t('admin.links.list.empty')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('admin.links.list.columns.id')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('admin.links.list.columns.url')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('admin.links.list.columns.created')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('admin.links.list.columns.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLinks.map((link) => (
                    <tr key={link.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {link.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                          {link.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(link.created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(link.id)}
                            isLoading={isDeleting && deleteId === link.id}
                            disabled={isDeleting}
                          >
                            {t('admin.links.list.deleteButton')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {nextCursor && (
            <div className="mt-6 text-center">
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                isLoading={isLoadingMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? t('admin.links.list.loading') : t('admin.links.list.loadMore')}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <ReservedSlugsManager />
    </div>
  );
}
