/**
 * 图片工具函数
 */

// 默认商品图片
export const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/300x300?text=Product'

/**
 * 获取可用的图片URL
 * 对于外部图片可能需要通过代理服务器访问，避免跨域问题
 * @param {string} url - 原始图片URL
 * @returns {string} 处理后的图片URL
 */
export const getProxyImageUrl = (url) => {
  if (!url) return DEFAULT_PRODUCT_IMAGE;
  
  // 检查是否为本地资源
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return url;
  }
  
  // 使用代理服务访问外部图片URL，避免跨域问题
  return `http://localhost:3000/api/proxy/image?url=${encodeURIComponent(url)}`;
};

/**
 * 默认用户头像URL
 */
export const DEFAULT_USER_AVATAR = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'; 