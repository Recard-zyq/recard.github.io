// Hexo 过滤器：彻底修复 hexo-bangumis 插件的分页、切换、封面裂图，并进行标签汉化定制
// 此脚本会被 Hexo 自动加载，且在重装依赖后依然生效

hexo.extend.filter.register('after_render:html', function(htmlContent){
  const rootPath = hexo.config.root || '/';
  const showIndex = (hexo.config.bangumis && hexo.config.bangumis.show) !== undefined ? hexo.config.bangumis.show : 1;

  // 1. 替换原版有 Bug、容易产生未捕获异常的选项卡和分页 JS 脚本
  const newScript = `
<script>
// 1. 选项卡切换逻辑 (重构：不修改原型链，抗干扰能力强)
(function(){
  const tabs = document.querySelectorAll('.bangumi-tab');
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('bangumi-active'));
      tab.classList.add('bangumi-active');
      for (let i = 1; i <= 3; i++) {
        const item = document.getElementById('bangumi-item' + i);
        if (item) {
          if (i === (index + 1)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        }
      }
    });
  });
})();

// 2. 分页处理逻辑 (重构：精准定位项目，彻底杜绝混入其他标签导致的 JavaScript 中断)
(function(){
  for (let i = 1; i <= 3; i++) {
    const container = document.getElementById('bangumi-item' + i);
    if (!container) continue;
    const items = Array.from(container.querySelectorAll('.bangumi-item'));
    const pagination = container.querySelector('.bangumi-pagination');
    if (!pagination || items.length === 0) continue;
    
    const firstBtn = pagination.querySelector('.bangumi-firstpage');
    const prevBtn = pagination.querySelector('.bangumi-previouspage');
    const nextBtn = pagination.querySelector('.bangumi-nextpage');
    const lastBtn = pagination.querySelector('.bangumi-lastpage');
    const pageNumText = pagination.querySelector('.bangumi-pagenum');
    
    const limit = 10;
    const totalPages = Math.ceil(items.length / limit);
    let currentPage = 0;
    
    function showPage(pageIndex) {
      if (pageIndex < 0 || pageIndex >= totalPages) return;
      currentPage = pageIndex;
      items.forEach((item, idx) => {
        if (Math.floor(idx / limit) === currentPage) {
          item.style.display = '';
          const img = item.querySelector('img');
          if (img && img.getAttribute('data-src')) {
            img.src = img.getAttribute('data-src');
          }
        } else {
          item.style.display = 'none';
        }
      });
      if (pageNumText) {
        pageNumText.innerText = (currentPage + 1) + ' / ' + totalPages;
      }
    }
    
    if (firstBtn) firstBtn.addEventListener('click', () => showPage(0));
    if (prevBtn) prevBtn.addEventListener('click', () => showPage(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showPage(currentPage + 1));
    if (lastBtn) lastBtn.addEventListener('click', () => showPage(totalPages - 1));
    
    showPage(0);
  }
})();

// 3. 初始化默认展示配置的 Tab
document.addEventListener("DOMContentLoaded", function() {
  const defaultTab = document.querySelectorAll('.bangumi-tab')[${showIndex}];
  if (defaultTab) {
    defaultTab.click();
  }
});
</script>
`;

  // 匹配替换原有的 script
  htmlContent = htmlContent.replace(/<script>\s*["']use strict["'];\/\* eslint-disable no-plusplus \*\/[\s\S]*?<\/script>/, newScript);

  // 2. 修复封面图 404 问题：根据站点的实际部署子目录 rootPath，动态纠正图片文件和 loading.gif 的资源路径前缀
  if (rootPath !== '/') {
    htmlContent = htmlContent.replace(/\/images\/bangumis\//g, rootPath + 'images/bangumis/');
  }

  // 3. 定制中文标签：在看 -> 正在看，已看 -> 看过 (同时兼容英文情况下的 Wish/Watching/Watched)
  // 替换 Tab 切换按钮文字
  htmlContent = htmlContent.replace(/(?:在看|Watching)\s*\(/g, '正在看(');
  htmlContent = htmlContent.replace(/(?:已看|Watched)\s*\(/g, '看过(');

  // 替换番剧信息列表中的属性标签文字
  htmlContent = htmlContent.replace(/>\s*(?:在看|Doing)\s*<\/span>/g, '>正在看</span>');
  htmlContent = htmlContent.replace(/>\s*(?:已看|Collect)\s*<\/span>/g, '>看过</span>');

  return htmlContent;
});
