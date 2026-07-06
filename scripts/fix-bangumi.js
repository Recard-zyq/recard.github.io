// Hexo 过滤器：修复 hexo-bangumis 插件的 Bug 并进行标签定制
// 此脚本会被 Hexo 自动执行，且在重装插件后依然生效

console.log("=== Loaded fix-bangumi.js ===");

hexo.extend.filter.register('after_render:html', function(htmlContent){
  console.log("=== Running filter after_render:html ===");
  // 1. 修复 pagination.js 的 JS 报错，解决分页功能、选项卡切换以及封面无法加载的问题
  if (htmlContent.includes('getElementsByTagName("img")')) {
    htmlContent = htmlContent.replace(
      'const[b]=a[c].getElementsByTagName("img");b.src=b.getAttribute("data-src")',
      'const[b]=a[c].getElementsByTagName("img");if(b){b.src=b.getAttribute("data-src")}'
    );
  }

  // 2. 定制中文标签：在看 -> 正在看，已看 -> 看过 (同时兼容英文情况下的 Wish/Watching/Watched)
  // 替换 Tab 切换按钮文字
  htmlContent = htmlContent.replace(/(?:在看|Watching)\s*\(/g, '正在看(');
  htmlContent = htmlContent.replace(/(?:已看|Watched)\s*\(/g, '看过(');

  // 替换番剧信息列表中的属性标签文字
  htmlContent = htmlContent.replace(/>\s*(?:在看|Doing)\s*<\/span>/g, '>正在看</span>');
  htmlContent = htmlContent.replace(/>\s*(?:已看|Collect)\s*<\/span>/g, '>看过</span>');

  return htmlContent;
});
