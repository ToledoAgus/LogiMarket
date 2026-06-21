const themeScript = `
(function () {
  try {
    var preference = localStorage.getItem('logimarket-theme') || 'auto';
    var hour = new Date().getHours();
    var resolved = preference === 'auto' ? (hour >= 7 && hour < 19 ? 'light' : 'dark') : preference;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.dataset.theme = preference;
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {}
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
