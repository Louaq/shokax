import { $dom } from '../library/dom'
import { vendorCss, vendorJs } from '../library/loadFile'
import { insertAfter } from '../library/proto'
import DOMPurify from 'dompurify';

// 添加类型声明
declare global {
  interface Window {
    jQuery: any;
  }
}

// TODO 使用PhotoSwipe替换Fancybox
export const postFancybox = (p:string) => {
  if (document.querySelector(p + ' .md img')) {
    vendorCss('fancybox')
    vendorJs('jquery', () => {
      vendorJs('fancybox', () => {
        if (!window.jQuery) {
          console.error('jQuery not loaded');
          return;
        }
        
        const q = window.jQuery.noConflict()

        // 处理所有文章中的图片
        $dom.each(p + ' .md img:not(.emoji):not(.vemoji)', (element) => {
          const $image = q(element)
          // 获取图片地址，优先使用data-src（针对懒加载图片）
          const imageLink = DOMPurify.sanitize($image.attr('data-src') || $image.attr('src'))
          
          // 移除已存在的fancybox包装
          if ($image.parent().is('a')) {
            $image.unwrap();
          }
          
          // 重新包装fancybox链接
          const $imageWrapLink = $image.wrap('<a class="fancybox" href="' + imageLink + '" itemscope itemtype="https://schema.org/ImageObject" itemprop="url"></a>').parent('a')
          
          // 设置data-fancybox属性
          $imageWrapLink.attr('data-fancybox', 'gallery').attr('rel', 'gallery')
          
          // 处理标题
          const info = element.getAttribute('title') || element.getAttribute('alt')
          if (info) {
            $imageWrapLink.attr('data-caption', info)
            const para = document.createElement('span')
            const txt = document.createTextNode(info)
            para.appendChild(txt)
            para.classList.add('image-info')
            insertAfter(element, para)
          }
        })

        // 创建用于标记滚动位置的元素
        if (!document.getElementById('scroll-marker')) {
          const marker = document.createElement('div');
          marker.id = 'scroll-marker';
          marker.style.position = 'absolute';
          marker.style.height = '1px';
          marker.style.width = '1px';
          marker.style.visibility = 'hidden';
          document.body.appendChild(marker);
        }

        // 修改fancybox初始化配置
        if (typeof q.fn.fancybox === 'function') {
          q.fancybox.defaults.hash = false
          let scrollY = 0;
          let scrollElement = null;
          let markerElement = null;

          q(p + ' .fancybox').fancybox({
            loop: true,
            buttons: [
              "zoom",
              "slideShow",
              "fullScreen",
              "download",
              "thumbs",
              "close"
            ],
            protect: true,
            animationEffect: "zoom",
            animationDuration: 366,
            clickContent: "zoom-or-close",
            clickSlide: "close",
            mobile: {
              clickContent: "zoom-or-close",
              clickSlide: "close",
              dblclickContent: "zoom",
              dblclickSlide: "zoom"
            },
            wheel: false,
            toolbar: true,
            touch: {
              vertical: true,
              momentum: true
            },
            baseClass: "fancybox-custom-layout",
            backFocus: false,
            autoFocus: false,
            trapFocus: false,
            preventCaptionOverlap: true,
            // 不隐藏滚动条，避免页面跳动
            hideScrollbar: false,
            idleTime: false,
            margin: [44, 0],
            gutter: 0,
            // 打开前保存当前视图中的元素
            beforeShow: function(instance, current) {
              // 保存滚动位置
              scrollY = window.scrollY;
              
              // 找到当前视图中的一个元素并记录
              const viewportHeight = window.innerHeight;
              const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, pre');
              let closestElement = null;
              let minDistance = Infinity;
              
              elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                // 找到离视口中心最近的元素
                const distance = Math.abs((rect.top + rect.bottom) / 2 - viewportHeight / 2);
                if (distance < minDistance) {
                  minDistance = distance;
                  closestElement = el;
                }
              });
              
              scrollElement = closestElement;
              
              // 放置标记在滚动位置
              markerElement = document.getElementById('scroll-marker');
              if (markerElement && scrollElement) {
                const rect = scrollElement.getBoundingClientRect();
                markerElement.style.top = (window.scrollY + rect.top) + 'px';
              }
            },
            afterClose: function() {
              // 使用多种方法尝试恢复滚动位置
              setTimeout(function() {
                // 方法1: 使用保存的scrollY
                window.scrollTo(0, scrollY);
                
                // 方法2: 如果有标记元素，滚动到标记元素
                if (markerElement && scrollElement) {
                  try {
                    // 获取元素当前位置并滚动
                    const rect = scrollElement.getBoundingClientRect();
                    const targetY = window.scrollY + rect.top - 100; // 向上偏移一点
                    window.scrollTo(0, targetY);
                  } catch (e) {
                    console.error('恢复滚动位置失败:', e);
                    // 退回到方法1
                    window.scrollTo(0, scrollY);
                  }
                }
              }, 10);
            }
          })
        } else {
          console.error('fancybox not loaded properly')
        }
      })
    })
  }
}
