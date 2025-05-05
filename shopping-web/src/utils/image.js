/**
 * 获取通过代理服务访问的图片URL
 * @param {string} url - 原始图片URL
 * @returns {string} 代理后的图片URL
 */
export const getProxyImageUrl = (url) => {
  if (!url) return '';
  return `http://localhost:3000/api/proxy/image?url=${encodeURIComponent(url)}`;
};

/**
 * 默认商品图片URL
 */
export const DEFAULT_PRODUCT_IMAGE = 'https://gd-hbimg.huaban.com/1dfba91dd19657eb9d088e1be15e7319a46d5d6b8e0af-0vC9Ym_fw480webp';

/**
 * 默认用户头像URL
 */
export const DEFAULT_USER_AVATAR = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'; 