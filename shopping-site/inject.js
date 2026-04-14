const fs = require('fs');
const files = [
  'homepage.html', 'shop.html', 'about.html', 
  'contact.html', 'shipping.html', 'returns.html', 
  'size-guide.html', 'faqs.html'
];
files.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        // Only insert if not already present
        if (!content.includes('products.js')) {
            content = content.replace('<script src="script.js"></script>', '<script src="products.js"></script>\n  <script src="script.js"></script>');
            content = content.replace('<script src="shop-script.js"></script>', '<script src="products.js"></script>\n  <script src="shop-script.js"></script>');
            content = content.replace('<script src="about-script.js"></script>', '<script src="products.js"></script>\n  <script src="about-script.js"></script>');
            fs.writeFileSync(f, content, 'utf8');
            console.log("Updated", f);
        }
    }
});
