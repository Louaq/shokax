// 简单的图片缩放功能
export const setupImageZoom = () => {
  // 创建覆盖层和放大图片元素
  let overlay: HTMLDivElement | null = document.querySelector('.zoom-overlay');
  let zoomImg: HTMLImageElement | null = document.querySelector('.zoom-img');
  
  // 如果元素不存在，创建它们
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'zoom-overlay';
    document.body.appendChild(overlay);
  }
  
  if (!zoomImg) {
    zoomImg = document.createElement('img');
    zoomImg.className = 'zoom-img';
    document.body.appendChild(zoomImg);
  }
  
  // 获取所有文章中的图片
  const images = document.querySelectorAll('.md img:not(.emoji):not(.vemoji)');
  
  // 存储滚动位置
  let scrollTop = 0;
  
  // 为每张图片添加点击事件
  images.forEach(img => {
    (img as HTMLElement).style.cursor = 'zoom-in';
    img.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 保存当前滚动位置
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // 获取图片src
      const src = (this as HTMLImageElement).getAttribute('data-src') || (this as HTMLImageElement).getAttribute('src');
      
      // 设置放大图片的src
      zoomImg.src = src;
      
      // 显示覆盖层和图片
      overlay.style.display = 'block';
      zoomImg.style.display = 'block';
      
      // 防止页面滚动
      document.body.style.overflow = 'hidden';
      
      return false;
    });
  });
  
  // 点击关闭放大图片
  overlay.addEventListener('click', closeZoom);
  zoomImg.addEventListener('click', closeZoom);
  
  // 添加键盘事件，按ESC关闭
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.style.display === 'block') {
      closeZoom();
    }
  });
  
  // 关闭放大图片的函数
  function closeZoom() {
    overlay.style.display = 'none';
    zoomImg.style.display = 'none';
    
    // 恢复页面滚动
    document.body.style.overflow = '';
    
    // 恢复滚动位置
    window.scrollTo(0, scrollTop);
  }
}; 