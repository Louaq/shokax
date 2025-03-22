/* global hexo */

hexo.extend.filter.register('after_post_render', (data) => {
  // 使用正则表达式处理图片标签
  data.content = data.content.replace(/(<img[^>]*)(src="[^"]+")([^>]*>)/img, (match, prefix, src, suffix) => {
    const imgSrc = src.match(/src="([^"]+)"/)[1];
    // 添加data-fancybox属性和cursor样式
    return `${prefix} loading="lazy" data-src="${imgSrc}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-fancybox="gallery" style="cursor: zoom-in;"${suffix}`;
  });
  return data;
}, 0);
