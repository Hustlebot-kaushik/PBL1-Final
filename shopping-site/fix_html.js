const fs = require('fs');
const files = ['homepage.html', 'shop.html', 'about.html', 'contact.html', 'shipping.html', 'returns.html', 'size-guide.html', 'faqs.html', 'index.html'];
files.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        content = content.replace('<script type="module" src="global-tracker.js"></script>', '<script src="frictionTracker.js"></script>\n  <script src="global-tracker.js"></script>');
        fs.writeFileSync(f, content, 'utf8');
    }
});
