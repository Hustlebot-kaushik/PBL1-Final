const fs = require('fs');
const files = ['homepage.html', 'shop.html', 'about.html', 'contact.html', 'shipping.html', 'returns.html', 'size-guide.html', 'faqs.html'];
files.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        // Replace logo link
        content = content.replace(/<a href="index\.html" class="brand-name/g, '<a href="homepage.html" class="brand-name');
        // Replace 'Home' nav link
        content = content.replace(/<a href="index\.html">Home<\/a>/g, '<a href="homepage.html">Home</a>');
        // Replace 'Home' nav link with active class
        content = content.replace(/<a href="index\.html" class="active">Home<\/a>/g, '<a href="homepage.html" class="active">Home</a>');
        fs.writeFileSync(f, content, 'utf8');
    }
});
console.log("Fixed navigation links.");
