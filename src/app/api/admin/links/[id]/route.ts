import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 检查认证状态
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少链接 ID' },
        { status: 400 }
      );
    }
    
    // 在生产环境中，从 Cloudflare KV 删除链接
    if (process.env.NODE_ENV === 'production') {
      try {
        // @ts-ignore - Cloudflare KV 在类型中定义
        await LINKS_KV.delete(id);
      } catch (error) {
        console.error('Error deleting link from KV:', error);
        return NextResponse.json(
          { error: '删除链接失败' },
          { status: 500 }
        );
      }
    } else {
      // 开发环境中从内存删除
      if (global.links) {
        if (!global.links.has(id)) {
          return NextResponse.json(
            { error: '链接不存在' },
            { status: 404 }
          );
        }
        global.links.delete(id);
      }
    }
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '链接已成功删除'
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
