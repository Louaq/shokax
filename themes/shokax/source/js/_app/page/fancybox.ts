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
          $imageWrapLink.attr('data-fancybox', 'default').attr('rel', 'default')
          
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
            clickContent: false,
            clickSlide: false,
            mobile: {
              clickContent: function(current, event) {
                return current.type === "image" ? "toggleControls" : false;
              },
              clickSlide: function(current, event) {
                return current.type === "image" ? "toggleControls" : false;
              },
            },
            wheel: false,
            toolbar: true,
            preventCaptionOverlap: true,
            touch: {
              vertical: true,
              momentum: true
            },
            beforeShow: function(instance, current) {
              // 确保图片已加载
              const $img = q(current.opts.$orig).find('img')
              if ($img.length && $img.attr('data-src')) {
                $img.attr('src', $img.attr('data-src'))
              }
            }
          })
        } else {
          console.error('fancybox not loaded properly')
        }
      })
    })
  }
}
