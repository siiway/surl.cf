import { NextRequest } from 'next/server';

export const onRequest = async (context: {
  request: NextRequest;
  next: () => Promise<Response>;
  env: {
    LINKS_KV: KVNamespace;
  };
}) => {
  const { request, next, env } = context;
  const url = new URL(request.url);
  
  // 如果是 API 请求或其他路径，继续处理
  if (url.pathname.startsWith('/api') || 
      url.pathname === '/' || 
      url.pathname.includes('.') || 
      url.pathname.startsWith('/_next')) {
    return next();
  }
  
  // 提取 slug (移除前导斜杠)
  const slug = url.pathname.substring(1);
  
  // 如果 slug 为空，重定向到首页
  if (!slug) {
    return Response.redirect(new URL('/', request.url));
  }
  
  try {
    // 从 KV 存储中获取原始 URL
    const originalUrl = await env.LINKS_KV.get(slug);
    
    // 如果找到 URL，重定向到原始 URL
    if (originalUrl) {
      return Response.redirect(originalUrl);
    }
    
    // 如果没有找到，重定向到首页并显示错误
    return Response.redirect(new URL('/?error=not_found', request.url));
  } catch (error) {
    console.error('Error retrieving from KV:', error);
    return Response.redirect(new URL('/?error=failed_to_retrieve', request.url));
  }
};
