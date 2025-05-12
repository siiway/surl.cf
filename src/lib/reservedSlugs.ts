/**
 * 保留的短链接列表
 * 这些短链接不能被用户创建，因为它们是系统路径
 */
export const RESERVED_SLUGS = [
  'admin',
  'api',
  'privacy'
];

/**
 * 检查短链接是否被保留
 * @param slug 要检查的短链接
 * @returns 如果短链接被保留，则返回 true；否则返回 false
 */
export function isReservedSlug(slug: string): boolean {
  // 转换为小写进行比较，确保大小写不敏感
  const lowerSlug = slug.toLowerCase();
  return RESERVED_SLUGS.includes(lowerSlug);
}
