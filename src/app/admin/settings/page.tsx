'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useTranslation } from '@/lib/i18n';
import { LANGUAGES } from '@/lib/i18n';
import DynamicTitle from '@/components/DynamicTitle';

export default function AdminSettings() {
  const { language, t } = useTranslation();
  // 获取设置
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // 获取 Turnstile 设置
        const turnstileResponse = await fetch('/api/admin/settings/turnstile');

        if (!turnstileResponse.ok) {
          throw new Error('获取 Turnstile 设置失败');
        }

        const turnstileData = await turnstileResponse.json();
        setIsTurnstileEnabled(turnstileData.enabled);
        setIsTurnstileLoading(false);

        // 获取公告设置
        const announcementResponse = await fetch('/api/admin/settings/announcement');

        if (!announcementResponse.ok) {
          throw new Error('获取公告设置失败');
        }

        const announcementData = await announcementResponse.json();

        // 设置所有语言的公告内容
        const titles: Record<string, string> = {};
        const contents: Record<string, string> = {};

        // 遍历所有支持的语言
        Object.keys(LANGUAGES).forEach(lang => {
          const langKey = lang.replace('-', '_').toUpperCase();
          titles[lang] = announcementData.announcement[`title_${langKey}`] || '';
          contents[lang] = announcementData.announcement[`content_${langKey}`] || '';
        });

        setAnnouncementTitles(titles);
        setAnnouncementContents(contents);
        setAnnouncementType(announcementData.announcement.type);
        setIsAnnouncementLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setIsTurnstileLoading(false);
        setIsAnnouncementLoading(false);
      }
    };

    fetchSettings();
  }, []);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTurnstileEnabled, setIsTurnstileEnabled] = useState(false);
  const [isTurnstileLoading, setIsTurnstileLoading] = useState(true);
  // 为每种语言创建状态
  const [announcementTitles, setAnnouncementTitles] = useState<Record<string, string>>({});
  const [announcementContents, setAnnouncementContents] = useState<Record<string, string>>({});
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
  const [isAnnouncementLoading, setIsAnnouncementLoading] = useState(true);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // 重置状态
    setError('');
    setSuccess('');

    // 验证输入
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError(t('admin.settings.password.allFieldsRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('admin.settings.password.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('admin.settings.password.passwordTooShort'));
      return;
    }

    // 这里只是模拟密码更改，实际上我们没有实现密码更改 API
    setIsLoading(true);

    // 模拟 API 调用
    setTimeout(() => {
      setIsLoading(false);
      setSuccess('密码已成功更改（这是一个模拟消息，实际上密码未更改）');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  // 处理 Turnstile 开关
  const handleToggleTurnstile = async () => {
    try {
      setIsTurnstileLoading(true);

      const response = await fetch('/api/admin/settings/turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': language, // 传递当前语言
        },
        body: JSON.stringify({
          enabled: !isTurnstileEnabled
        }),
      });

      if (!response.ok) {
        throw new Error(t('admin.settings.turnstile.updateError'));
      }

      const data = await response.json();
      setIsTurnstileEnabled(data.enabled);

      // 如果 API 返回了状态键和值，使用翻译函数
      if (data.statusKey && data.statusValue) {
        setSuccess(t(data.statusKey, { status: t(`admin.settings.turnstile.${data.statusValue}`) }));
      } else {
        // 否则使用 API 返回的消息
        setSuccess(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.settings.turnstile.updateError'));
    } finally {
      setIsTurnstileLoading(false);
    }
  };

  // 处理公告设置
  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsAnnouncementLoading(true);

      // 准备所有语言的公告数据
      const announcementData: Record<string, any> = {
        type: announcementType
      };

      // 为每种语言添加标题和内容
      Object.keys(LANGUAGES).forEach(lang => {
        const langKey = lang.replace('-', '_').toUpperCase();
        announcementData[`title_${langKey}`] = announcementTitles[lang] || '';
        announcementData[`content_${langKey}`] = announcementContents[lang] || '';
      });

      const response = await fetch('/api/admin/settings/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData),
      });

      if (!response.ok) {
        throw new Error('更新公告设置失败');
      }

      const data = await response.json();
      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新公告设置失败');
    } finally {
      setIsAnnouncementLoading(false);
    }
  };

  return (
    <div>
      <DynamicTitle suffix={t('admin.settings.title')} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.settings.title')}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{t('admin.settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-sm mb-6">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('admin.settings.announcement.title')}</h2>
            </CardHeader>
            <CardBody>
              {isAnnouncementLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : (
                <form onSubmit={handleUpdateAnnouncement} className="space-y-6">
                  {/* 语言选择器 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.settings.announcement.languageSelector')}
                    </label>
                    <select
                      value={currentLanguage}
                      onChange={(e) => setCurrentLanguage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(LANGUAGES).map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('admin.settings.announcement.languageSelectorHelp')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.settings.announcement.titleLabel')} ({LANGUAGES[currentLanguage]})
                    </label>
                    <input
                      type="text"
                      value={announcementTitles[currentLanguage] || ''}
                      onChange={(e) => {
                        setAnnouncementTitles({
                          ...announcementTitles,
                          [currentLanguage]: e.target.value
                        });
                      }}
                      placeholder={t('admin.settings.announcement.titlePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('admin.settings.announcement.titleHelp')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.settings.announcement.contentLabel')} ({LANGUAGES[currentLanguage]})
                    </label>
                    <textarea
                      value={announcementContents[currentLanguage] || ''}
                      onChange={(e) => {
                        setAnnouncementContents({
                          ...announcementContents,
                          [currentLanguage]: e.target.value
                        });
                      }}
                      placeholder={t('admin.settings.announcement.contentPlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      rows={6}
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('admin.settings.announcement.contentHelp')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.settings.announcement.typeLabel')}
                    </label>
                    <select
                      value={announcementType}
                      onChange={(e) => setAnnouncementType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="info">{t('admin.settings.announcement.types.info')}</option>
                      <option value="warning">{t('admin.settings.announcement.types.warning')}</option>
                      <option value="success">{t('admin.settings.announcement.types.success')}</option>
                      <option value="error">{t('admin.settings.announcement.types.error')}</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isAnnouncementLoading}
                      disabled={isAnnouncementLoading}
                    >
                      {isAnnouncementLoading ? t('admin.settings.announcement.processingButton') : t('admin.settings.announcement.updateButton')}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        // 清除本地存储中的已关闭公告，以便预览
                        localStorage.setItem('dismissedAnnouncements', JSON.stringify([]));

                        // 将当前语言的公告内容存储到 localStorage 中，用于预览
                        localStorage.setItem('previewAnnouncement', JSON.stringify({
                          title: announcementTitles[currentLanguage] || '',
                          content: (announcementContents[currentLanguage] || '').replace(/\\n/g, '\n'), // 处理换行符
                          type: announcementType
                        }));

                        // 刷新页面以显示公告
                        window.location.reload();
                      }}
                    >
                      {t('admin.settings.announcement.previewButton')}
                    </Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('admin.settings.password.title')}</h2>
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

              <form onSubmit={handleChangePassword} className="space-y-6">
                <Input
                  label={t('admin.settings.password.currentPassword')}
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  fullWidth
                />

                <Input
                  label={t('admin.settings.password.newPassword')}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  fullWidth
                />

                <Input
                  label={t('admin.settings.password.confirmPassword')}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  fullWidth
                />

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? t('admin.settings.password.processingButton') : t('admin.settings.password.updateButton')}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card className="shadow-sm">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('admin.settings.account.title')}</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.settings.account.username')}</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">admin</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.settings.account.role')}</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">Admin</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.settings.account.lastLogin')}</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm mt-6">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('admin.settings.turnstile.title')}</h2>
            </CardHeader>
            <CardBody>
              {isTurnstileLoading ? (
                <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {isTurnstileEnabled ? t('admin.settings.turnstile.enabled') : t('admin.settings.turnstile.disabled')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {isTurnstileEnabled
                        ? t('admin.settings.turnstile.enabledDescription')
                        : t('admin.settings.turnstile.disabledDescription')}
                    </p>
                  </div>
                  <div>
                    <Button
                      onClick={handleToggleTurnstile}
                      variant={isTurnstileEnabled ? 'danger' : 'success'}
                      size="sm"
                      isLoading={isTurnstileLoading}
                      disabled={isTurnstileLoading}
                    >
                      {isTurnstileEnabled ? t('admin.settings.turnstile.disableButton') : t('admin.settings.turnstile.enableButton')}
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="shadow-sm mt-6">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('admin.settings.security.title')}</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('admin.settings.security.passwordTip')}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('admin.settings.security.strongPasswordTip')}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('admin.settings.security.turnstileTip')}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>


        </div>
      </div>
    </div>
  );
}
