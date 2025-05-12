import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';
import { isReservedSlug } from '@/lib/reservedSlugs';

// 声明全局变量类型
declare global {
  var links: Map<string, string>;
  var TURNSTILE_ENABLED: boolean;
}

// 验证 Cloudflare Turnstile 令牌
async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  try {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error('Turnstile secret key not configured');
      return false;
    }

    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await result.json();
    return outcome.success;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
}

// 检查自定义短链接是否可用
async function isCustomSlugAvailable(slug: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') {
    try {
      // @ts-ignore - Cloudflare KV 在类型中定义
      const existingUrl = await LINKS_KV.get(slug);
      return !existingUrl;
    } catch (error) {
      console.error('Error checking slug availability in KV:', error);
      return false;
    }
  } else {
    // 开发环境中使用内存存储
    if (!global.links) {
      global.links = new Map();
    }
    return !global.links.has(slug);
  }
}

// 验证自定义短链接格式
function isValidSlug(slug: string): boolean {
  // 只允许字母、数字、连字符和下划线，长度在 3-20 之间
  const slugRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return slugRegex.test(slug);
}

// 生成短链接
export async function POST(request: NextRequest) {
  try {
    const { url, token, customSlug } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // 检查是否启用 Turnstile
    // 首先检查全局变量是否已设置
    let enableTurnstile;

    if (typeof global.TURNSTILE_ENABLED !== 'undefined') {
      enableTurnstile = global.TURNSTILE_ENABLED;
    } else {
      // 如果全局变量未设置，则使用环境变量
      enableTurnstile = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === 'true';
      // 初始化全局变量
      global.TURNSTILE_ENABLED = enableTurnstile;
    }

    // 验证 URL
    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: '请提供有效的 URL' },
        { status: 400 }
      );
    }

    // 如果启用了 Turnstile，验证令牌
    if (enableTurnstile) {
      // 验证 Turnstile 令牌
      if (!token) {
        return NextResponse.json(
          { error: '请完成人机验证' },
          { status: 400 }
        );
      }

      const isValidToken = await verifyTurnstileToken(token, ip);
      if (!isValidToken) {
        return NextResponse.json(
          { error: '人机验证失败，请重试' },
          { status: 400 }
        );
      }
    }

    // 处理自定义短链接
    let id: string;

    if (customSlug) {
      // 验证自定义短链接格式
      if (!isValidSlug(customSlug)) {
        return NextResponse.json(
          { error: '自定义短链接只能包含字母、数字、连字符和下划线，长度在 3-20 之间' },
          { status: 400 }
        );
      }

      // 检查是否是保留的短链接
      if (isReservedSlug(customSlug)) {
        return NextResponse.json(
          { error: '该短链接已被系统保留，请尝试其他名称' },
          { status: 400 }
        );
      }

      // 检查自定义短链接是否可用
      const isAvailable = await isCustomSlugAvailable(customSlug);
      if (!isAvailable) {
        return NextResponse.json(
          { error: '该自定义短链接已被使用，请尝试其他名称' },
          { status: 400 }
        );
      }

      id = customSlug;
    } else {
      // 生成随机短链接 ID (6个字符)
      let attempts = 0;
      const maxAttempts = 5; // 最多尝试 5 次

      do {
        id = nanoid(6);
        attempts++;

        // 检查随机生成的 ID 是否是保留的短链接
        if (!isReservedSlug(id)) {
          break;
        }

        // 如果尝试次数过多，返回错误
        if (attempts >= maxAttempts) {
          return NextResponse.json(
            { error: '无法生成有效的短链接，请稍后再试' },
            { status: 500 }
          );
        }
      } while (true);
    }

    // 在生产环境中，这里会使用 Cloudflare KV 存储
    // 在开发环境中，我们使用内存存储模拟
    if (process.env.NODE_ENV === 'production') {
      // 假设 LINKS_KV 是 Cloudflare KV 命名空间
      try {
        // @ts-ignore - Cloudflare KV 在类型中定义
        await LINKS_KV.put(id, url);
      } catch (error) {
        console.error('Error storing in KV:', error);
        return NextResponse.json(
          { error: '存储 URL 失败' },
          { status: 500 }
        );
      }
    } else {
      // 开发环境中使用内存存储
      if (!global.links) {
        global.links = new Map();
      }
      global.links.set(id, url);
    }

    // 返回短链接
    return NextResponse.json({ id, shortUrl: `${request.nextUrl.origin}/${id}` });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 验证 URL 是否有效
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}
