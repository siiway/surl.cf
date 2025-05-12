import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // 如果没有提供 slug，重定向到首页
  if (!slug) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  let originalUrl: string | null = null;

  // 在生产环境中，从 Cloudflare KV 获取 URL
  if (process.env.NODE_ENV === 'production') {
    try {
      // @ts-ignore - Cloudflare KV 在类型中定义
      originalUrl = await LINKS_KV.get(slug);
    } catch (error) {
      console.error('Error retrieving from KV:', error);
      return NextResponse.redirect(new URL('/?error=failed_to_retrieve', request.url));
    }
  } else {
    // 开发环境中从内存获取
    if (global.links) {
      originalUrl = global.links.get(slug) || null;
    }
  }

  // 如果找到 URL，重定向到原始 URL
  if (originalUrl) {
    return NextResponse.redirect(originalUrl);
  }

  // 如果没有找到，重定向到首页并显示错误
  return NextResponse.redirect(new URL('/?error=not_found', request.url));
}
