@echo off
set PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
node "%~dp0node_modules\@mermaid-js\mermaid-cli\src\cli.js" %*
