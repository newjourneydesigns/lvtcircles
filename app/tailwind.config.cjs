<!DOCTYPE html>
<html data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <div class="flex justify-end p-4">
      <button id="theme-toggle" class="btn btn-sm btn-outline">Toggle Theme</button>
    </div>

    <!-- Existing body content -->

    <script>
      const themeToggle = document.getElementById('theme-toggle');
      themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'light';
        html.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
      });
    </script>
  </body>
</html>
