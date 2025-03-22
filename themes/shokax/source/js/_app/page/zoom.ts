import { $dom } from '../library/dom'

// 图片缩放功能
export const setupImageZoom = (selector: string = '.md img:not(.emoji):not(.vemoji)') => {
  // 创建缩放容器
  const zoomContainer = document.createElement('div');
  zoomContainer.className = 'image-zoom-container';
  zoomContainer.style.display = 'none';
  zoomContainer.style.position = 'fixed';
  zoomContainer.style.top = '0';
  zoomContainer.style.left = '0';
  zoomContainer.style.width = '100%';
  zoomContainer.style.height = '100%';
  zoomContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  zoomContainer.style.zIndex = '9999';
  zoomContainer.style.overflow = 'auto';
  zoomContainer.style.cursor = 'zoom-out';
  zoomContainer.style.opacity = '0';
  zoomContainer.style.transition = 'opacity 0.3s ease';
  
  // 创建图片元素
  const zoomImage = document.createElement('img');
  zoomImage.className = 'image-zoom-img';
  zoomImage.style.position = 'absolute';
  zoomImage.style.top = '50%';
  zoomImage.style.left = '50%';
  zoomImage.style.transform = 'translate(-50%, -50%)';
  zoomImage.style.maxHeight = '90%';
  zoomImage.style.maxWidth = '90%';
  zoomImage.style.objectFit = 'contain';
  zoomImage.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.3)';
  zoomImage.style.transition = 'transform 0.3s ease';
  
  // 添加关闭按钮
  const closeButton = document.createElement('button');
  closeButton.className = 'image-zoom-close';
  closeButton.textContent = '×'; // 使用 × 符号
  closeButton.style.position = 'absolute';
  closeButton.style.top = '20px';
  closeButton.style.right = '20px';
  closeButton.style.background = 'rgba(0, 0, 0, 0.5)';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '50%';
  closeButton.style.width = '40px';
  closeButton.style.height = '40px';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.zIndex = '10000';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  
  // 将元素添加到容器
  zoomContainer.appendChild(zoomImage);
  zoomContainer.appendChild(closeButton);
  document.body.appendChild(zoomContainer);
  
  let savedScrollPosition = 0;
  
  // 处理所有图片点击事件
  $dom.each(selector, (img) => {
    img.style.cursor = 'zoom-in';
    
    img.addEventListener('click', (e) => {
      e.preventDefault();
      
      // 保存滚动位置
      savedScrollPosition = window.scrollY;
      
      // 获取图片地址
      const imgSrc = img.getAttribute('data-src') || img.getAttribute('src');
      
      // 设置缩放图片源
      zoomImage.src = imgSrc;
      
      // 显示缩放容器
      zoomContainer.style.display = 'block';
      setTimeout(() => {
        zoomContainer.style.opacity = '1';
      }, 10);
    });
  });
  
  // 点击容器关闭缩放
  zoomContainer.addEventListener('click', (e) => {
    if (e.target === zoomContainer || e.target === closeButton) {
      closeZoom();
    }
  });
  
  // 添加键盘事件，ESC键关闭缩放
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && zoomContainer.style.display === 'block') {
      closeZoom();
    }
  });
  
  // 关闭缩放函数
  const closeZoom = () => {
    zoomContainer.style.opacity = '0';
    
    // 恢复滚动位置
    setTimeout(() => {
      zoomContainer.style.display = 'none';
      window.scrollTo(0, savedScrollPosition);
    }, 300);
  };
  
  // 添加简单的缩放功能
  let scale = 1;
  zoomImage.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // 放大或缩小，取决于滚轮方向
    if (e.deltaY < 0) {
      // 放大
      scale = Math.min(scale + 0.1, 3);
    } else {
      // 缩小
      scale = Math.max(scale - 0.1, 0.5);
    }
    
    zoomImage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  });
  
  // 添加双击切换缩放级别
  zoomImage.addEventListener('dblclick', () => {
    if (scale === 1) {
      scale = 2;
    } else {
      scale = 1;
    }
    zoomImage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  });
  
  // 重置缩放级别
  zoomContainer.addEventListener('mousedown', () => {
    scale = 1;
    zoomImage.style.transform = 'translate(-50%, -50%) scale(1)';
  });
}; 