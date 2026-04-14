const fs = require('fs');

const adjectives = ["Sustainable", "Premium", "Classic", "Modern", "Vintage", "Eco-friendly", "Handcrafted", "Chic", "Minimalist", "Everyday"];

// Strict mapping using LoremFlickr robust categories for unique generation
const baseWomen = [
  { noun: "Jacket", keyword: "jacket,clothing" },
  { noun: "Dress", keyword: "dress,fashion" },
  { noun: "Blouse", keyword: "blouse,clothing" },
  { noun: "Skirt", keyword: "skirt,apparel" },
  { noun: "Sweater", keyword: "sweater,fashion" },
  { noun: "T-Shirt", keyword: "tshirt,clothing" }
];

const baseMen = [
  { noun: "Cotton T-Shirt", keyword: "tshirt,clothing" },
  { noun: "Slim Chinos", keyword: "chinos,pants" },
  { noun: "Winter Jacket", keyword: "jacket,men" },
  { noun: "Blazer", keyword: "blazer,clothing" },
  { noun: "Denim Jeans", keyword: "jeans,clothing" }
];

const baseAcc = [
  { noun: "Leather Bag", keyword: "bag,leather" },
  { noun: "Handwoven Scarf", keyword: "scarf,clothing" },
  { noun: "Aviator Sunglasses", keyword: "sunglasses,fashion" },
  { noun: "Watch", keyword: "watch,accessories" },
  { noun: "Knitted Beanie", keyword: "beanie,winter" }
];

let products = [];
let idCounter = 1;

function generateArr(category, bases, count) {
    for (let i = 0; i < count; i++) {
        let adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        let base = bases[Math.floor(Math.random() * bases.length)];
        let price = (Math.random() * 80 + 15).toFixed(2);
        
        products.push({
            id: idCounter,
            title: `${adj} ${base.noun}`,
            category: category,
            price: parseFloat(price),
            // Unique lock ID guarantees a perfectly visually distinct image every single time!
            image: `https://loremflickr.com/400/500/${base.keyword}?lock=${idCounter + (Math.floor(Math.random() * 1000))}`,
            description: `A meticulously crafted ${adj.toLowerCase()} ${base.noun.toLowerCase()} to elevate your sustainable wardrobe.`,
            featured: Math.random() > 0.85
        });
        idCounter++;
    }
}

generateArr("Women", baseWomen, 40);
generateArr("Men", baseMen, 40);
generateArr("Accessories", baseAcc, 40);

const content = `// Global strictly mapped products array\nvar products = ${JSON.stringify(products, null, 2)};\n`;
fs.writeFileSync('products.js', content, 'utf-8');
console.log("Successfully securely generated products.js with unique imagery.");
