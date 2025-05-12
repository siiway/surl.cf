import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { LANGUAGES, DEFAULT_LANGUAGE, FALLBACK_LANGUAGE } from '@/lib/server-i18n';

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数中的语言
    const searchParams = request.nextUrl.searchParams;
    let lang = searchParams.get('lang') || DEFAULT_LANGUAGE;

    // 验证语言是否支持
    if (!Object.keys(LANGUAGES).includes(lang)) {
      lang = DEFAULT_LANGUAGE;
    }

    // 构建文件路径
    const filePath = path.join(process.cwd(), 'src', 'content', 'privacy-policy', `${lang}.md`);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      // 如果请求的语言文件不存在，首先尝试使用英文作为回退语言
      const fallbackFilePath = path.join(process.cwd(), 'src', 'content', 'privacy-policy', `${FALLBACK_LANGUAGE}.md`);

      if (fs.existsSync(fallbackFilePath)) {
        // 使用英文作为回退语言
        const content = fs.readFileSync(fallbackFilePath, 'utf8');
        return NextResponse.json({ content, language: FALLBACK_LANGUAGE });
      }

      // 如果英文也不存在，尝试使用默认语言
      const defaultFilePath = path.join(process.cwd(), 'src', 'content', 'privacy-policy', `${DEFAULT_LANGUAGE}.md`);

      if (!fs.existsSync(defaultFilePath)) {
        return NextResponse.json(
          { error: 'Privacy policy not found' },
          { status: 404 }
        );
      }

      // 使用默认语言的隐私政策
      const content = fs.readFileSync(defaultFilePath, 'utf8');
      return NextResponse.json({ content, language: DEFAULT_LANGUAGE });
    }

    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');

    return NextResponse.json({ content, language: lang });
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy policy' },
      { status: 500 }
    );
  }
}
