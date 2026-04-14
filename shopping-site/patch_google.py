import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'\s*<a href="https://accounts\.google\.com/AccountChooser"[^>]*>.*?Continue with Google\s*</a>',
    '',
    content,
    flags=re.DOTALL
)

with open('index.html', 'w', encoding='utf-8', newline='') as f:
    f.write(content)
