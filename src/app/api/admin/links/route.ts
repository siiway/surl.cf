import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

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
    
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    let links: { id: string; url: string; created?: number }[] = [];
    let nextCursor: string | undefined;
    
    // 在生产环境中，从 Cloudflare KV 获取链接
    if (process.env.NODE_ENV === 'production') {
      try {
        // @ts-ignore - Cloudflare KV 在类型中定义
        const result = await LINKS_KV.list({ cursor, limit });
        
        // 并行获取所有链接的详细信息
        const promises = result.keys.map(async (key) => {
          // @ts-ignore - Cloudflare KV 在类型中定义
          const url = await LINKS_KV.get(key.name);
          return {
            id: key.name,
            url,
            created: key.expiration ? new Date(key.expiration * 1000).getTime() : undefined
          };
        });
        
        links = await Promise.all(promises);
        nextCursor = result.list_complete ? undefined : result.cursor;
      } catch (error) {
        console.error('Error fetching links from KV:', error);
        return NextResponse.json(
          { error: '获取链接数据失败' },
          { status: 500 }
        );
      }
    } else {
      // 开发环境中从内存获取
      if (global.links) {
        links = Array.from(global.links.entries()).map(([id, url]) => ({ id, url }));
      }
    }
    
    // 返回链接数据
    return NextResponse.json({
      links,
      nextCursor
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
