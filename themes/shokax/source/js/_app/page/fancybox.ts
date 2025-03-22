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
        let scrollPos = 0; // 保存滚动位置

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

        // 修改fancybox初始化配置
        if (typeof q.fn.fancybox === 'function') {
          q.fancybox.defaults.hash = false
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
            preventCaptionOverlap: true,
            touch: {
              vertical: true,
              momentum: true
            },
            baseClass: "fancybox-custom-layout",
            beforeShow: function(instance, current) {
              // 保存当前滚动位置
              scrollPos = window.pageYOffset || document.documentElement.scrollTop;
              
              // 确保图片已加载
              const $img = q(current.opts.$orig).find('img')
              if ($img.length && $img.attr('data-src')) {
                $img.attr('src', $img.attr('data-src'))
              }
            },
            afterShow: function(instance, current) {
              // 添加键盘快捷键支持
              q(document).on('keydown.fb', function (e) {
                // ESC键关闭
                if (e.keyCode === 27) {
                  instance.close()
                  return false
                }
                // 空格键播放/暂停幻灯片
                if (e.keyCode === 32) {
                  if (instance.SlideShow.isActive) {
                    instance.SlideShow.stop()
                  } else {
                    instance.SlideShow.start()
                  }
                  return false
                }
              })
            },
            afterClose: function() {
              // 恢复滚动位置
              window.scrollTo({
                top: scrollPos,
                behavior: 'instant'
              });
              
              // 移除键盘事件监听
              q(document).off('keydown.fb');
            }
          })
        } else {
          console.error('fancybox not loaded properly')
        }
      })
    })
  }
}
