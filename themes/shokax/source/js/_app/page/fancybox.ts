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
    vendorCss('justifiedGallery')
    vendorJs('jquery', ()=>{
      vendorJs('justifiedGallery',()=>{
        vendorJs('fancybox', () => {
          if (!window.jQuery) {
            console.error('jQuery not loaded');
            return;
          }
          
          const q = window.jQuery.noConflict()

          $dom.each(p + ' p.gallery', (element) => {
            const box = document.createElement('div')
            box.className = 'gallery'
            box.setAttribute('data-height', String(element.getAttribute('data-height') || 220))

            box.innerHTML = element.innerHTML.replace(/<br>/g, '')

            if (element.parentNode) {
              element.parentNode.insertBefore(box, element)
              element.remove()
            }
          })

          $dom.each(p + ' .md img:not(.emoji):not(.vemoji)', (element) => {
            const $image = q(element)
            const imageLink = DOMPurify.sanitize($image.attr('data-src') || $image.attr('src')) // 替换
            const $imageWrapLink = $image.wrap('<a class="fancybox" href="' + imageLink + '" itemscope itemtype="https://schema.org/ImageObject" itemprop="url"></a>').parent('a')
            let info; let captionClass = 'image-info'
            if (!$image.is('a img')) {
              $image.data('safe-src', imageLink)
              if (!$image.is('.gallery img')) {
                $imageWrapLink.attr('data-fancybox', 'default').attr('rel', 'default')
              } else {
                captionClass = 'jg-caption'
              }
            }
            if ((info = element.getAttribute('title'))) {
              $imageWrapLink.attr('data-caption', info)
              const para = document.createElement('span')
              const txt = document.createTextNode(info)
              para.appendChild(txt)
              para.classList.add(captionClass)
              insertAfter(element, para)
            }
          })

          $dom.each(p + ' div.gallery', (el, i) => {
            // @ts-ignore
            q(el).justifiedGallery({
              rowHeight: q(el).data('height') || 120,
              rel: 'gallery-' + i
            }).on('jg.complete', function () {
              q(this).find('a').each((k, ele) => {
                ele.setAttribute('data-fancybox', 'gallery-' + i)
              })
            })
          })

          // 修改 fancybox 初始化部分
          if (typeof q.fn.fancybox === 'function') {
            q.fancybox.defaults.hash = false
            q(p + ' .fancybox').fancybox({
              loop: true,
              helpers: {
                overlay: {
                  locked: false
                }
              },
              buttons: [
                "zoom",
                "slideShow",
                "fullScreen",
                "close"
              ],
              protect: true,
              animationEffect: "zoom",
              touch: {
                vertical: true,
                momentum: true
              }
            })
          } else {
            console.error('fancybox not loaded properly');
          }
        }, window.jQuery)
      })
    })
  }
}
