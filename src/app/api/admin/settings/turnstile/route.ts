import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

// 声明全局变量类型
declare global {
  var TURNSTILE_ENABLED: boolean;
}

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

    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: '无效的参数' },
        { status: 400 }
      );
    }

    // 更新本地存储中的设置
    try {
      // 在开发环境中，我们使用全局变量来存储设置
      if (process.env.NODE_ENV === 'development') {
        // 设置全局变量
        global.TURNSTILE_ENABLED = enabled;
      } else {
        // 在生产环境中，这里应该更新环境变量或数据库
        // 但由于我们无法直接修改环境变量，我们使用全局变量作为替代
        global.TURNSTILE_ENABLED = enabled;
      }

      // 获取当前语言
      const language = request.headers.get('Accept-Language') || 'zh-CN';

      // 返回状态消息键和状态值，让前端处理翻译
      const status = enabled ?
        (language.startsWith('en') ? 'enabled' : '启用') :
        (language.startsWith('en') ? 'disabled' : '禁用');

      // 构建消息
      const message = language.startsWith('en')
        ? `Turnstile human verification has been ${enabled ? 'enabled' : 'disabled'}`
        : `Turnstile 人机验证已${enabled ? '启用' : '禁用'}`;

      return NextResponse.json({
        success: true,
        message,
        enabled,
        statusKey: 'admin.settings.turnstile.statusMessage',
        statusValue: enabled ? 'enabled' : 'disabled'
      });
    } catch (error) {
      console.error('Error updating Turnstile settings:', error);
      return NextResponse.json(
        { error: '更新设置失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating Turnstile settings:', error);
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
    // 首先检查全局变量是否已设置
    let enabled;

    if (typeof global.TURNSTILE_ENABLED !== 'undefined') {
      enabled = global.TURNSTILE_ENABLED;
    } else {
      // 如果全局变量未设置，则使用环境变量
      enabled = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === 'true';
      // 初始化全局变量
      global.TURNSTILE_ENABLED = enabled;
    }

    return NextResponse.json({
      enabled
    });
  } catch (error) {
    console.error('Error getting Turnstile settings:', error);
    return NextResponse.json(
      { error: '获取设置失败' },
      { status: 500 }
    );
  }
}
