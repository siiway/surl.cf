import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { LANGUAGES } from '@/lib/server-i18n';

export async function POST(request: NextRequest) {
  try {
    // 检查认证状态
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const requestData = await request.json();
    const { type } = requestData;

    // 验证公告类型
    if (type && !['info', 'warning', 'success', 'error'].includes(type)) {
      return NextResponse.json(
        { error: '无效的公告类型' },
        { status: 400 }
      );
    }

    // 验证每种语言的公告内容
    const announcementData: Record<string, any> = {
      type: type || 'info'
    };

    // 处理每种语言的标题和内容
    Object.keys(LANGUAGES).forEach(lang => {
      const langKey = lang.replace('-', '_').toUpperCase();
      const titleKey = `title_${langKey}`;
      const contentKey = `content_${langKey}`;

      // 获取并验证标题
      const title = requestData[titleKey];
      if (title !== undefined && typeof title !== 'string') {
        throw new Error(`无效的公告标题: ${langKey}`);
      }

      // 获取并验证内容
      let content = requestData[contentKey];
      if (content !== undefined) {
        if (typeof content !== 'string') {
          throw new Error(`无效的公告内容: ${langKey}`);
        }

        // 处理换行符
        content = content.replace(/\\n/g, '\n');
      }

      // 添加到响应数据
      announcementData[titleKey] = title || '';
      announcementData[contentKey] = content || '';
    });



    // 在实际生产环境中，这里应该更新环境变量或数据库
    // 但在这个演示中，我们只是模拟成功响应

    return NextResponse.json({
      success: true,
      message: `公告设置已更新（这是一个模拟消息，实际上设置未更改）`,
      announcement: announcementData
    });
  } catch (error) {
    console.error('Error updating announcement settings:', error);
    return NextResponse.json(
      { error: '更新设置失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 检查认证状态
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 获取当前设置
    const type = process.env.NEXT_PUBLIC_ANNOUNCEMENT_TYPE || 'info';

    // 准备响应数据
    const announcementData: Record<string, any> = {
      type
    };

    // 获取每种语言的公告内容
    Object.keys(LANGUAGES).forEach(lang => {
      const langKey = lang.replace('-', '_').toUpperCase();
      const titleKey = `title_${langKey}`;
      const contentKey = `content_${langKey}`;

      // 从环境变量中获取数据
      announcementData[titleKey] = process.env[`NEXT_PUBLIC_ANNOUNCEMENT_TITLE_${langKey}`] || '';
      announcementData[contentKey] = process.env[`NEXT_PUBLIC_ANNOUNCEMENT_CONTENT_${langKey}`] || '';
    });

    return NextResponse.json({
      announcement: announcementData
    });
  } catch (error) {
    console.error('Error getting announcement settings:', error);
    return NextResponse.json(
      { error: '获取设置失败' },
      { status: 500 }
    );
  }
}
