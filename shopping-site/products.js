// Global strictly mapped products array (Sourced from DummyJSON)
var products = [
  {
    "title": "Blue & Black Check Shirt",
    "category": "Men",
    "price": 2489.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp",
    "description": "The Blue & Black Check Shirt is a stylish and comfortable men's shirt featuring a classic check pattern. Made from high-quality fabric, it's suitable for both casual and semi-formal occasions.",
    "featured": false,
    "id": 1
  },
  {
    "title": "Gigabyte Aorus Men Tshirt",
    "category": "Men",
    "price": 2074.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp",
    "description": "The Gigabyte Aorus Men Tshirt is a cool and casual shirt for gaming enthusiasts. With the Aorus logo and sleek design, it's perfect for expressing your gaming style.",
    "featured": false,
    "id": 2
  },
  {
    "title": "Man Plaid Shirt",
    "category": "Men",
    "price": 2904.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/thumbnail.webp",
    "description": "The Man Plaid Shirt is a timeless and versatile men's shirt with a classic plaid pattern. Its comfortable fit and casual style make it a wardrobe essential for various occasions.",
    "featured": false,
    "id": 3
  },
  {
    "title": "Man Short Sleeve Shirt",
    "category": "Men",
    "price": 1659.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/thumbnail.webp",
    "description": "The Man Short Sleeve Shirt is a breezy and stylish option for warm days. With a comfortable fit and short sleeves, it's perfect for a laid-back yet polished look.",
    "featured": false,
    "id": 4
  },
  {
    "title": "Men Check Shirt",
    "category": "Men",
    "price": 2323.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/thumbnail.webp",
    "description": "The Men Check Shirt is a classic and versatile shirt featuring a stylish check pattern. Suitable for various occasions, it adds a smart and polished touch to your wardrobe.",
    "featured": false,
    "id": 5
  },
  {
    "title": "Nike Air Jordan 1 Red And Black",
    "category": "Men",
    "price": 12449.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp",
    "description": "The Nike Air Jordan 1 in Red and Black is an iconic basketball sneaker known for its stylish design and high-performance features, making it a favorite among sneaker enthusiasts and athletes.",
    "featured": true,
    "id": 6
  },
  {
    "title": "Nike Baseball Cleats",
    "category": "Men",
    "price": 6639.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/thumbnail.webp",
    "description": "Nike Baseball Cleats are designed for maximum traction and performance on the baseball field. They provide stability and support for players during games and practices.",
    "featured": false,
    "id": 7
  },
  {
    "title": "Puma Future Rider Trainers",
    "category": "Men",
    "price": 7469.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/thumbnail.webp",
    "description": "The Puma Future Rider Trainers offer a blend of retro style and modern comfort. Perfect for casual wear, these trainers provide a fashionable and comfortable option for everyday use.",
    "featured": true,
    "id": 8
  },
  {
    "title": "Sports Sneakers Off White & Red",
    "category": "Men",
    "price": 9959.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/thumbnail.webp",
    "description": "The Sports Sneakers in Off White and Red combine style and functionality, making them a fashionable choice for sports enthusiasts. The red and off-white color combination adds a bold and energetic touch.",
    "featured": true,
    "id": 9
  },
  {
    "title": "Sports Sneakers Off White Red",
    "category": "Men",
    "price": 9129.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-red/thumbnail.webp",
    "description": "Another variant of the Sports Sneakers in Off White Red, featuring a unique design. These sneakers offer style and comfort for casual occasions.",
    "featured": true,
    "id": 10
  },
  {
    "title": "Black Women's Gown",
    "category": "Women",
    "price": 10789.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/black-women's-gown/thumbnail.webp",
    "description": "The Black Women's Gown is an elegant and timeless evening gown. With a sleek black design, it's perfect for formal events and special occasions, exuding sophistication and style.",
    "featured": false,
    "id": 11
  },
  {
    "title": "Corset Leather With Skirt",
    "category": "Women",
    "price": 7469.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/thumbnail.webp",
    "description": "The Corset Leather With Skirt is a bold and edgy ensemble that combines a stylish corset with a matching skirt. Ideal for fashion-forward individuals, it makes a statement at any event.",
    "featured": false,
    "id": 12
  },
  {
    "title": "Corset With Black Skirt",
    "category": "Women",
    "price": 6639.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/thumbnail.webp",
    "description": "The Corset With Black Skirt is a chic and versatile outfit that pairs a fashionable corset with a classic black skirt. It offers a trendy and coordinated look for various occasions.",
    "featured": true,
    "id": 13
  },
  {
    "title": "Dress Pea",
    "category": "Women",
    "price": 4149.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/thumbnail.webp",
    "description": "The Dress Pea is a stylish and comfortable dress with a pea pattern. Perfect for casual outings, it adds a playful and fun element to your wardrobe, making it a great choice for day-to-day wear.",
    "featured": true,
    "id": 14
  },
  {
    "title": "Marni Red & Black Suit",
    "category": "Women",
    "price": 14939.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/thumbnail.webp",
    "description": "The Marni Red & Black Suit is a sophisticated and fashion-forward suit ensemble. With a combination of red and black tones, it showcases a modern design for a bold and confident look.",
    "featured": false,
    "id": 15
  },
  {
    "title": "Black & Brown Slipper",
    "category": "Women",
    "price": 1659.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/black-&-brown-slipper/thumbnail.webp",
    "description": "The Black & Brown Slipper is a comfortable and stylish choice for casual wear. Featuring a blend of black and brown colors, it adds a touch of sophistication to your relaxation.",
    "featured": false,
    "id": 16
  },
  {
    "title": "Calvin Klein Heel Shoes",
    "category": "Women",
    "price": 6639.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/thumbnail.webp",
    "description": "Calvin Klein Heel Shoes are elegant and sophisticated, designed for formal occasions. With a classic design and high-quality materials, they complement your stylish ensemble.",
    "featured": true,
    "id": 17
  },
  {
    "title": "Golden Shoes Woman",
    "category": "Women",
    "price": 4149.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/golden-shoes-woman/thumbnail.webp",
    "description": "The Golden Shoes for Women are a glamorous choice for special occasions. Featuring a golden hue and stylish design, they add a touch of luxury to your outfit.",
    "featured": false,
    "id": 18
  },
  {
    "title": "Pampi Shoes",
    "category": "Women",
    "price": 2489.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/pampi-shoes/thumbnail.webp",
    "description": "Pampi Shoes offer a blend of comfort and style for everyday use. With a versatile design, they are suitable for various casual occasions, providing a trendy and relaxed look.",
    "featured": false,
    "id": 19
  },
  {
    "title": "Red Shoes",
    "category": "Women",
    "price": 2904.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes/thumbnail.webp",
    "description": "The Red Shoes make a bold statement with their vibrant red color. Whether for a party or a casual outing, these shoes add a pop of color and style to your wardrobe.",
    "featured": false,
    "id": 20
  },
  {
    "title": "Blue Frock",
    "category": "Women",
    "price": 2489.17,
    "image": "https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp",
    "description": "The Blue Frock is a charming and stylish dress for various occasions. With a vibrant blue color and a comfortable design, it adds a touch of elegance to your wardrobe.",
    "featured": false,
    "id": 21
  },
  {
    "title": "Girl Summer Dress",
    "category": "Women",
    "price": 1659.17,
    "image": "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/thumbnail.webp",
    "description": "The Girl Summer Dress is a cute and breezy dress designed for warm weather. With playful patterns and lightweight fabric, it's perfect for keeping cool and stylish during the summer.",
    "featured": true,
    "id": 22
  },
  {
    "title": "Gray Dress",
    "category": "Women",
    "price": 2904.17,
    "image": "https://cdn.dummyjson.com/product-images/tops/gray-dress/thumbnail.webp",
    "description": "The Gray Dress is a versatile and chic option for various occasions. With a neutral gray color, it can be dressed up or down, making it a wardrobe staple for any fashion-forward individual.",
    "featured": false,
    "id": 23
  },
  {
    "title": "Short Frock",
    "category": "Women",
    "price": 2074.17,
    "image": "https://cdn.dummyjson.com/product-images/tops/short-frock/thumbnail.webp",
    "description": "The Short Frock is a playful and trendy dress with a shorter length. Ideal for casual outings or special occasions, it combines style and comfort for a fashionable look.",
    "featured": false,
    "id": 24
  },
  {
    "title": "Tartan Dress",
    "category": "Women",
    "price": 3319.17,
    "image": "https://cdn.dummyjson.com/product-images/tops/tartan-dress/thumbnail.webp",
    "description": "The Tartan Dress features a classic tartan pattern, bringing a timeless and sophisticated touch to your wardrobe. Perfect for fall and winter, it adds a hint of traditional charm.",
    "featured": false,
    "id": 25
  },
  {
    "title": "Brown Leather Belt Watch",
    "category": "Accessories",
    "price": 7469.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp",
    "description": "The Brown Leather Belt Watch is a stylish timepiece with a classic design. Featuring a genuine leather strap and a sleek dial, it adds a touch of sophistication to your look.",
    "featured": false,
    "id": 26
  },
  {
    "title": "Longines Master Collection",
    "category": "Accessories",
    "price": 124499.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/thumbnail.webp",
    "description": "The Longines Master Collection is an elegant and refined watch known for its precision and craftsmanship. With a timeless design, it's a symbol of luxury and sophistication.",
    "featured": false,
    "id": 27
  },
  {
    "title": "Rolex Cellini Date Black Dial",
    "category": "Accessories",
    "price": 746999.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/thumbnail.webp",
    "description": "The Rolex Cellini Date with Black Dial is a classic and prestigious watch. With a black dial and date complication, it exudes sophistication and is a symbol of Rolex's heritage.",
    "featured": true,
    "id": 28
  },
  {
    "title": "Rolex Cellini Moonphase",
    "category": "Accessories",
    "price": 1078999.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-moonphase/thumbnail.webp",
    "description": "The Rolex Cellini Moonphase is a masterpiece of horology, featuring a moon phase complication and exquisite design. It reflects Rolex's commitment to precision and elegance.",
    "featured": false,
    "id": 29
  },
  {
    "title": "Rolex Datejust",
    "category": "Accessories",
    "price": 912999.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/thumbnail.webp",
    "description": "The Rolex Datejust is an iconic and versatile timepiece with a date window. Known for its timeless design and reliability, it's a symbol of Rolex's watchmaking excellence.",
    "featured": false,
    "id": 30
  },
  {
    "title": "Rolex Submariner Watch",
    "category": "Accessories",
    "price": 1161999.17,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-submariner-watch/thumbnail.webp",
    "description": "The Rolex Submariner is a legendary dive watch with a rich history. Known for its durability and water resistance, it's a symbol of adventure and exploration.",
    "featured": false,
    "id": 31
  },
  {
    "title": "IWC Ingenieur Automatic Steel",
    "category": "Accessories",
    "price": 414999.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/iwc-ingenieur-automatic-steel/thumbnail.webp",
    "description": "The IWC Ingenieur Automatic Steel watch is a durable and sophisticated timepiece. With a stainless steel case and automatic movement, it combines precision and style for watch enthusiasts.",
    "featured": false,
    "id": 32
  },
  {
    "title": "Rolex Cellini Moonphase",
    "category": "Accessories",
    "price": 1327999.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-cellini-moonphase/thumbnail.webp",
    "description": "The Rolex Cellini Moonphase watch is a masterpiece of horology. Featuring a moon phase complication, it showcases the craftsmanship and elegance that Rolex is renowned for.",
    "featured": false,
    "id": 33
  },
  {
    "title": "Rolex Datejust Women",
    "category": "Accessories",
    "price": 912999.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-datejust-women/thumbnail.webp",
    "description": "The Rolex Datejust Women's watch is an iconic timepiece designed for women. With a timeless design and a date complication, it offers both elegance and functionality.",
    "featured": false,
    "id": 34
  },
  {
    "title": "Watch Gold for Women",
    "category": "Accessories",
    "price": 66399.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/watch-gold-for-women/thumbnail.webp",
    "description": "The Gold Women's Watch is a stunning accessory that combines luxury and style. Featuring a gold-plated case and a chic design, it adds a touch of glamour to any outfit.",
    "featured": false,
    "id": 35
  },
  {
    "title": "Women's Wrist Watch",
    "category": "Accessories",
    "price": 10789.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/women's-wrist-watch/thumbnail.webp",
    "description": "The Women's Wrist Watch is a versatile and fashionable timepiece for everyday wear. With a comfortable strap and a simple yet elegant design, it complements various styles.",
    "featured": false,
    "id": 36
  },
  {
    "title": "Blue Women's Handbag",
    "category": "Accessories",
    "price": 4149.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/thumbnail.webp",
    "description": "The Blue Women's Handbag is a stylish and spacious accessory for everyday use. With a vibrant blue color and multiple compartments, it combines fashion and functionality.",
    "featured": false,
    "id": 37
  },
  {
    "title": "Heshe Women's Leather Bag",
    "category": "Accessories",
    "price": 10789.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women's-leather-bag/thumbnail.webp",
    "description": "The Heshe Women's Leather Bag is a luxurious and high-quality leather bag for the sophisticated woman. With a timeless design and durable craftsmanship, it's a versatile accessory.",
    "featured": true,
    "id": 38
  },
  {
    "title": "Prada Women Bag",
    "category": "Accessories",
    "price": 49799.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/thumbnail.webp",
    "description": "The Prada Women Bag is an iconic designer bag that exudes elegance and luxury. Crafted with precision and featuring the Prada logo, it's a statement piece for fashion enthusiasts.",
    "featured": false,
    "id": 39
  },
  {
    "title": "White Faux Leather Backpack",
    "category": "Accessories",
    "price": 3319.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/thumbnail.webp",
    "description": "The White Faux Leather Backpack is a trendy and practical backpack for the modern woman. With a sleek white design and ample storage space, it's perfect for both casual and on-the-go styles.",
    "featured": false,
    "id": 40
  },
  {
    "title": "Women Handbag Black",
    "category": "Accessories",
    "price": 4979.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/thumbnail.webp",
    "description": "The Women Handbag in Black is a classic and versatile accessory that complements various outfits. With a timeless black color and functional design, it's a must-have in every woman's wardrobe.",
    "featured": false,
    "id": 41
  },
  {
    "title": "Green Crystal Earring",
    "category": "Accessories",
    "price": 2489.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-crystal-earring/thumbnail.webp",
    "description": "The Green Crystal Earring is a dazzling accessory that features a vibrant green crystal. With a classic design, it adds a touch of elegance to your ensemble, perfect for formal or special occasions.",
    "featured": false,
    "id": 42
  },
  {
    "title": "Green Oval Earring",
    "category": "Accessories",
    "price": 2074.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-oval-earring/thumbnail.webp",
    "description": "The Green Oval Earring is a stylish and versatile accessory with a unique oval shape. Whether for casual or dressy occasions, its green hue and contemporary design make it a standout piece.",
    "featured": false,
    "id": 43
  },
  {
    "title": "Tropical Earring",
    "category": "Accessories",
    "price": 1659.17,
    "image": "https://cdn.dummyjson.com/product-images/womens-jewellery/tropical-earring/thumbnail.webp",
    "description": "The Tropical Earring is a fun and playful accessory inspired by tropical elements. Featuring vibrant colors and a lively design, it's perfect for adding a touch of summer to your look.",
    "featured": false,
    "id": 44
  },
  {
    "title": "Black Sun Glasses",
    "category": "Accessories",
    "price": 2489.17,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/thumbnail.webp",
    "description": "The Black Sun Glasses are a classic and stylish choice, featuring a sleek black frame and tinted lenses. They provide both UV protection and a fashionable look.",
    "featured": false,
    "id": 45
  },
  {
    "title": "Classic Sun Glasses",
    "category": "Accessories",
    "price": 2074.17,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/thumbnail.webp",
    "description": "The Classic Sun Glasses offer a timeless design with a neutral frame and UV-protected lenses. These sunglasses are versatile and suitable for various occasions.",
    "featured": false,
    "id": 46
  },
  {
    "title": "Green and Black Glasses",
    "category": "Accessories",
    "price": 2904.17,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/thumbnail.webp",
    "description": "The Green and Black Glasses feature a bold combination of green and black colors, adding a touch of vibrancy to your eyewear collection. They are both stylish and eye-catching.",
    "featured": true,
    "id": 47
  },
  {
    "title": "Party Glasses",
    "category": "Accessories",
    "price": 1659.17,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/party-glasses/thumbnail.webp",
    "description": "The Party Glasses are designed to add flair to your party outfit. With unique shapes or colorful frames, they're perfect for adding a playful touch to your look during celebrations.",
    "featured": false,
    "id": 48
  },
  {
    "title": "Sunglasses",
    "category": "Accessories",
    "price": 1908.17,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/thumbnail.webp",
    "description": "The Sunglasses offer a classic and simple design with a focus on functionality. These sunglasses provide essential UV protection while maintaining a timeless look.",
    "featured": false,
    "id": 49
  },
  {
    "title": "Signature Blue & Black Check Shirt",
    "category": "Men",
    "price": 2726.55,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp",
    "description": "The Blue & Black Check Shirt is a stylish and comfortable men's shirt featuring a classic check pattern. Made from high-quality fabric, it's suitable for both casual and semi-formal occasions.",
    "featured": false,
    "id": 50
  },
  {
    "title": "Standard Gigabyte Aorus Men Tshirt",
    "category": "Men",
    "price": 2133.93,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp",
    "description": "The Gigabyte Aorus Men Tshirt is a cool and casual shirt for gaming enthusiasts. With the Aorus logo and sleek design, it's perfect for expressing your gaming style.",
    "featured": false,
    "id": 51
  },
  {
    "title": "Eco Man Plaid Shirt",
    "category": "Men",
    "price": 2865.99,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/thumbnail.webp",
    "description": "The Man Plaid Shirt is a timeless and versatile men's shirt with a classic plaid pattern. Its comfortable fit and casual style make it a wardrobe essential for various occasions.",
    "featured": false,
    "id": 52
  },
  {
    "title": "Classic Man Short Sleeve Shirt",
    "category": "Men",
    "price": 1881.61,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/thumbnail.webp",
    "description": "The Man Short Sleeve Shirt is a breezy and stylish option for warm days. With a comfortable fit and short sleeves, it's perfect for a laid-back yet polished look.",
    "featured": false,
    "id": 53
  },
  {
    "title": "Essential Men Check Shirt",
    "category": "Men",
    "price": 2162.15,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp",
    "description": "The Men Check Shirt is a classic and versatile shirt featuring a stylish check pattern. Suitable for various occasions, it adds a smart and polished touch to your wardrobe.",
    "featured": false,
    "id": 54
  },
  {
    "title": "Luxury Nike Air Jordan 1 Red And Black",
    "category": "Men",
    "price": 13773.85,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp",
    "description": "The Nike Air Jordan 1 in Red and Black is an iconic basketball sneaker known for its stylish design and high-performance features, making it a favorite among sneaker enthusiasts and athletes.",
    "featured": true,
    "id": 55
  },
  {
    "title": "Vintage Nike Baseball Cleats",
    "category": "Men",
    "price": 7347.16,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/thumbnail.webp",
    "description": "Nike Baseball Cleats are designed for maximum traction and performance on the baseball field. They provide stability and support for players during games and practices.",
    "featured": false,
    "id": 56
  },
  {
    "title": "Eco Puma Future Rider Trainers",
    "category": "Men",
    "price": 6815.96,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/thumbnail.webp",
    "description": "The Puma Future Rider Trainers offer a blend of retro style and modern comfort. Perfect for casual wear, these trainers provide a fashionable and comfortable option for everyday use.",
    "featured": true,
    "id": 57
  },
  {
    "title": "Modern Sports Sneakers Off White & Red",
    "category": "Men",
    "price": 11067.22,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/thumbnail.webp",
    "description": "The Sports Sneakers in Off White and Red combine style and functionality, making them a fashionable choice for sports enthusiasts. The red and off-white color combination adds a bold and energetic touch.",
    "featured": true,
    "id": 58
  },
  {
    "title": "Modern Sports Sneakers Off White Red",
    "category": "Men",
    "price": 8357.27,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/thumbnail.webp",
    "description": "Another variant of the Sports Sneakers in Off White Red, featuring a unique design. These sneakers offer style and comfort for casual occasions.",
    "featured": true,
    "id": 59
  },
  {
    "title": "Standard Black Women's Gown",
    "category": "Women",
    "price": 10990.03,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/black-women's-gown/thumbnail.webp",
    "description": "The Black Women's Gown is an elegant and timeless evening gown. With a sleek black design, it's perfect for formal events and special occasions, exuding sophistication and style.",
    "featured": false,
    "id": 60
  },
  {
    "title": "Modern Corset Leather With Skirt",
    "category": "Women",
    "price": 8257.67,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/thumbnail.webp",
    "description": "The Corset Leather With Skirt is a bold and edgy ensemble that combines a stylish corset with a matching skirt. Ideal for fashion-forward individuals, it makes a statement at any event.",
    "featured": false,
    "id": 61
  },
  {
    "title": "Luxury Corset With Black Skirt",
    "category": "Women",
    "price": 7698.25,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/thumbnail.webp",
    "description": "The Corset With Black Skirt is a chic and versatile outfit that pairs a fashionable corset with a classic black skirt. It offers a trendy and coordinated look for various occasions.",
    "featured": true,
    "id": 62
  },
  {
    "title": "Modern Dress Pea",
    "category": "Women",
    "price": 4469.55,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/thumbnail.webp",
    "description": "The Dress Pea is a stylish and comfortable dress with a pea pattern. Perfect for casual outings, it adds a playful and fun element to your wardrobe, making it a great choice for day-to-day wear.",
    "featured": true,
    "id": 63
  },
  {
    "title": "Eco Marni Red & Black Suit",
    "category": "Women",
    "price": 17262.34,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/thumbnail.webp",
    "description": "The Marni Red & Black Suit is a sophisticated and fashion-forward suit ensemble. With a combination of red and black tones, it showcases a modern design for a bold and confident look.",
    "featured": false,
    "id": 64
  },
  {
    "title": "Premium Black & Brown Slipper",
    "category": "Women",
    "price": 1745.49,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/black-&-brown-slipper/thumbnail.webp",
    "description": "The Black & Brown Slipper is a comfortable and stylish choice for casual wear. Featuring a blend of black and brown colors, it adds a touch of sophistication to your relaxation.",
    "featured": false,
    "id": 65
  },
  {
    "title": "Premium Calvin Klein Heel Shoes",
    "category": "Women",
    "price": 7881.68,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/thumbnail.webp",
    "description": "Calvin Klein Heel Shoes are elegant and sophisticated, designed for formal occasions. With a classic design and high-quality materials, they complement your stylish ensemble.",
    "featured": true,
    "id": 66
  },
  {
    "title": "Modern Golden Shoes Woman",
    "category": "Women",
    "price": 3827.96,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/golden-shoes-woman/thumbnail.webp",
    "description": "The Golden Shoes for Women are a glamorous choice for special occasions. Featuring a golden hue and stylish design, they add a touch of luxury to your outfit.",
    "featured": false,
    "id": 67
  },
  {
    "title": "Standard Pampi Shoes",
    "category": "Women",
    "price": 2777.18,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/pampi-shoes/thumbnail.webp",
    "description": "Pampi Shoes offer a blend of comfort and style for everyday use. With a versatile design, they are suitable for various casual occasions, providing a trendy and relaxed look.",
    "featured": false,
    "id": 68
  },
  {
    "title": "Modern Red Shoes",
    "category": "Women",
    "price": 2868.48,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/thumbnail.webp",
    "description": "The Red Shoes make a bold statement with their vibrant red color. Whether for a party or a casual outing, these shoes add a pop of color and style to your wardrobe.",
    "featured": false,
    "id": 69
  },
  {
    "title": "Signature Blue Frock",
    "category": "Women",
    "price": 2636.08,
    "image": "https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp",
    "description": "The Blue Frock is a charming and stylish dress for various occasions. With a vibrant blue color and a comfortable design, it adds a touch of elegance to your wardrobe.",
    "featured": false,
    "id": 70
  },
  {
    "title": "Luxury Girl Summer Dress",
    "category": "Women",
    "price": 1830.98,
    "image": "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/thumbnail.webp",
    "description": "The Girl Summer Dress is a cute and breezy dress designed for warm weather. With playful patterns and lightweight fabric, it's perfect for keeping cool and stylish during the summer.",
    "featured": true,
    "id": 71
  },
  {
    "title": "Signature Gray Dress",
    "category": "Women",
    "price": 3286.8,
    "image": "https://cdn.dummyjson.com/product-images/tops/gray-dress/thumbnail.webp",
    "description": "The Gray Dress is a versatile and chic option for various occasions. With a neutral gray color, it can be dressed up or down, making it a wardrobe staple for any fashion-forward individual.",
    "featured": false,
    "id": 72
  },
  {
    "title": "Classic Short Frock",
    "category": "Women",
    "price": 2451.82,
    "image": "https://cdn.dummyjson.com/product-images/tops/short-frock/thumbnail.webp",
    "description": "The Short Frock is a playful and trendy dress with a shorter length. Ideal for casual outings or special occasions, it combines style and comfort for a fashionable look.",
    "featured": false,
    "id": 73
  },
  {
    "title": "Vintage Tartan Dress",
    "category": "Women",
    "price": 3031.99,
    "image": "https://cdn.dummyjson.com/product-images/tops/tartan-dress/thumbnail.webp",
    "description": "The Tartan Dress features a classic tartan pattern, bringing a timeless and sophisticated touch to your wardrobe. Perfect for fall and winter, it adds a hint of traditional charm.",
    "featured": false,
    "id": 74
  },
  {
    "title": "Classic Brown Leather Belt Watch",
    "category": "Accessories",
    "price": 7340.52,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp",
    "description": "The Brown Leather Belt Watch is a stylish timepiece with a classic design. Featuring a genuine leather strap and a sleek dial, it adds a touch of sophistication to your look.",
    "featured": false,
    "id": 75
  },
  {
    "title": "Eco Longines Master Collection",
    "category": "Accessories",
    "price": 142846.32,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/thumbnail.webp",
    "description": "The Longines Master Collection is an elegant and refined watch known for its precision and craftsmanship. With a timeless design, it's a symbol of luxury and sophistication.",
    "featured": false,
    "id": 76
  },
  {
    "title": "Signature Rolex Cellini Date Black Dial",
    "category": "Accessories",
    "price": 724952.71,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/thumbnail.webp",
    "description": "The Rolex Cellini Date with Black Dial is a classic and prestigious watch. With a black dial and date complication, it exudes sophistication and is a symbol of Rolex's heritage.",
    "featured": true,
    "id": 77
  },
  {
    "title": "Modern Rolex Cellini Moonphase",
    "category": "Accessories",
    "price": 1231143.15,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-cellini-moonphase/thumbnail.webp",
    "description": "The Rolex Cellini Moonphase is a masterpiece of horology, featuring a moon phase complication and exquisite design. It reflects Rolex's commitment to precision and elegance.",
    "featured": false,
    "id": 78
  },
  {
    "title": "Signature Rolex Datejust",
    "category": "Accessories",
    "price": 855086.75,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/thumbnail.webp",
    "description": "The Rolex Datejust is an iconic and versatile timepiece with a date window. Known for its timeless design and reliability, it's a symbol of Rolex's watchmaking excellence.",
    "featured": false,
    "id": 79
  },
  {
    "title": "Classic Rolex Submariner Watch",
    "category": "Accessories",
    "price": 1386056.84,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-submariner-watch/thumbnail.webp",
    "description": "The Rolex Submariner is a legendary dive watch with a rich history. Known for its durability and water resistance, it's a symbol of adventure and exploration.",
    "featured": false,
    "id": 80
  },
  {
    "title": "Premium IWC Ingenieur Automatic Steel",
    "category": "Accessories",
    "price": 429043.6,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/iwc-ingenieur-automatic-steel/thumbnail.webp",
    "description": "The IWC Ingenieur Automatic Steel watch is a durable and sophisticated timepiece. With a stainless steel case and automatic movement, it combines precision and style for watch enthusiasts.",
    "featured": false,
    "id": 81
  },
  {
    "title": "Classic Rolex Cellini Moonphase",
    "category": "Accessories",
    "price": 1300450.64,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-cellini-moonphase/thumbnail.webp",
    "description": "The Rolex Cellini Moonphase watch is a masterpiece of horology. Featuring a moon phase complication, it showcases the craftsmanship and elegance that Rolex is renowned for.",
    "featured": false,
    "id": 82
  },
  {
    "title": "Modern Rolex Datejust Women",
    "category": "Accessories",
    "price": 1050766.72,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-datejust-women/thumbnail.webp",
    "description": "The Rolex Datejust Women's watch is an iconic timepiece designed for women. With a timeless design and a date complication, it offers both elegance and functionality.",
    "featured": false,
    "id": 83
  },
  {
    "title": "Essential Watch Gold for Women",
    "category": "Accessories",
    "price": 61879.82,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/watch-gold-for-women/thumbnail.webp",
    "description": "The Gold Women's Watch is a stunning accessory that combines luxury and style. Featuring a gold-plated case and a chic design, it adds a touch of glamour to any outfit.",
    "featured": false,
    "id": 84
  },
  {
    "title": "Premium Women's Wrist Watch",
    "category": "Accessories",
    "price": 12865.83,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/women's-wrist-watch/thumbnail.webp",
    "description": "The Women's Wrist Watch is a versatile and fashionable timepiece for everyday wear. With a comfortable strap and a simple yet elegant design, it complements various styles.",
    "featured": false,
    "id": 85
  },
  {
    "title": "Standard Blue Women's Handbag",
    "category": "Accessories",
    "price": 3839.58,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/thumbnail.webp",
    "description": "The Blue Women's Handbag is a stylish and spacious accessory for everyday use. With a vibrant blue color and multiple compartments, it combines fashion and functionality.",
    "featured": false,
    "id": 86
  },
  {
    "title": "Signature Heshe Women's Leather Bag",
    "category": "Accessories",
    "price": 10959.32,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women's-leather-bag/thumbnail.webp",
    "description": "The Heshe Women's Leather Bag is a luxurious and high-quality leather bag for the sophisticated woman. With a timeless design and durable craftsmanship, it's a versatile accessory.",
    "featured": true,
    "id": 87
  },
  {
    "title": "Premium Prada Women Bag",
    "category": "Accessories",
    "price": 56498.1,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/thumbnail.webp",
    "description": "The Prada Women Bag is an iconic designer bag that exudes elegance and luxury. Crafted with precision and featuring the Prada logo, it's a statement piece for fashion enthusiasts.",
    "featured": false,
    "id": 88
  },
  {
    "title": "Standard White Faux Leather Backpack",
    "category": "Accessories",
    "price": 3880.25,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/thumbnail.webp",
    "description": "The White Faux Leather Backpack is a trendy and practical backpack for the modern woman. With a sleek white design and ample storage space, it's perfect for both casual and on-the-go styles.",
    "featured": false,
    "id": 89
  },
  {
    "title": "Premium Women Handbag Black",
    "category": "Accessories",
    "price": 5367.61,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/thumbnail.webp",
    "description": "The Women Handbag in Black is a classic and versatile accessory that complements various outfits. With a timeless black color and functional design, it's a must-have in every woman's wardrobe.",
    "featured": false,
    "id": 90
  },
  {
    "title": "Modern Green Crystal Earring",
    "category": "Accessories",
    "price": 2533.99,
    "image": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-crystal-earring/thumbnail.webp",
    "description": "The Green Crystal Earring is a dazzling accessory that features a vibrant green crystal. With a classic design, it adds a touch of elegance to your ensemble, perfect for formal or special occasions.",
    "featured": false,
    "id": 91
  },
  {
    "title": "Luxury Green Oval Earring",
    "category": "Accessories",
    "price": 2411.98,
    "image": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-oval-earring/thumbnail.webp",
    "description": "The Green Oval Earring is a stylish and versatile accessory with a unique oval shape. Whether for casual or dressy occasions, its green hue and contemporary design make it a standout piece.",
    "featured": false,
    "id": 92
  },
  {
    "title": "Modern Tropical Earring",
    "category": "Accessories",
    "price": 1879.12,
    "image": "https://cdn.dummyjson.com/product-images/womens-jewellery/tropical-earring/thumbnail.webp",
    "description": "The Tropical Earring is a fun and playful accessory inspired by tropical elements. Featuring vibrant colors and a lively design, it's perfect for adding a touch of summer to your look.",
    "featured": false,
    "id": 93
  },
  {
    "title": "Standard Black Sun Glasses",
    "category": "Accessories",
    "price": 2843.58,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/thumbnail.webp",
    "description": "The Black Sun Glasses are a classic and stylish choice, featuring a sleek black frame and tinted lenses. They provide both UV protection and a fashionable look.",
    "featured": false,
    "id": 94
  },
  {
    "title": "Eco Classic Sun Glasses",
    "category": "Accessories",
    "price": 2431.07,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/thumbnail.webp",
    "description": "The Classic Sun Glasses offer a timeless design with a neutral frame and UV-protected lenses. These sunglasses are versatile and suitable for various occasions.",
    "featured": false,
    "id": 95
  },
  {
    "title": "Modern Green and Black Glasses",
    "category": "Accessories",
    "price": 3383.91,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/thumbnail.webp",
    "description": "The Green and Black Glasses feature a bold combination of green and black colors, adding a touch of vibrancy to your eyewear collection. They are both stylish and eye-catching.",
    "featured": true,
    "id": 96
  },
  {
    "title": "Standard Party Glasses",
    "category": "Accessories",
    "price": 1869.16,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/party-glasses/thumbnail.webp",
    "description": "The Party Glasses are designed to add flair to your party outfit. With unique shapes or colorful frames, they're perfect for adding a playful touch to your look during celebrations.",
    "featured": false,
    "id": 97
  },
  {
    "title": "Standard Sunglasses",
    "category": "Accessories",
    "price": 1774.54,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/thumbnail.webp",
    "description": "The Sunglasses offer a classic and simple design with a focus on functionality. These sunglasses provide essential UV protection while maintaining a timeless look.",
    "featured": false,
    "id": 98
  },
  {
    "title": "Signature Blue & Black Check Shirt",
    "category": "Men",
    "price": 2753.11,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp",
    "description": "The Blue & Black Check Shirt is a stylish and comfortable men's shirt featuring a classic check pattern. Made from high-quality fabric, it's suitable for both casual and semi-formal occasions.",
    "featured": false,
    "id": 99
  },
  {
    "title": "Vintage Gigabyte Aorus Men Tshirt",
    "category": "Men",
    "price": 2443.52,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp",
    "description": "The Gigabyte Aorus Men Tshirt is a cool and casual shirt for gaming enthusiasts. With the Aorus logo and sleek design, it's perfect for expressing your gaming style.",
    "featured": false,
    "id": 100
  },
  {
    "title": "Premium Man Plaid Shirt",
    "category": "Men",
    "price": 3367.31,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/thumbnail.webp",
    "description": "The Man Plaid Shirt is a timeless and versatile men's shirt with a classic plaid pattern. Its comfortable fit and casual style make it a wardrobe essential for various occasions.",
    "featured": false,
    "id": 101
  },
  {
    "title": "Premium Man Short Sleeve Shirt",
    "category": "Men",
    "price": 1989.51,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/thumbnail.webp",
    "description": "The Man Short Sleeve Shirt is a breezy and stylish option for warm days. With a comfortable fit and short sleeves, it's perfect for a laid-back yet polished look.",
    "featured": false,
    "id": 102
  },
  {
    "title": "Modern Men Check Shirt",
    "category": "Men",
    "price": 2441.86,
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp",
    "description": "The Men Check Shirt is a classic and versatile shirt featuring a stylish check pattern. Suitable for various occasions, it adds a smart and polished touch to your wardrobe.",
    "featured": false,
    "id": 103
  },
  {
    "title": "Standard Nike Air Jordan 1 Red And Black",
    "category": "Men",
    "price": 11867.34,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp",
    "description": "The Nike Air Jordan 1 in Red and Black is an iconic basketball sneaker known for its stylish design and high-performance features, making it a favorite among sneaker enthusiasts and athletes.",
    "featured": true,
    "id": 104
  },
  {
    "title": "Modern Nike Baseball Cleats",
    "category": "Men",
    "price": 6834.22,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/thumbnail.webp",
    "description": "Nike Baseball Cleats are designed for maximum traction and performance on the baseball field. They provide stability and support for players during games and practices.",
    "featured": false,
    "id": 105
  },
  {
    "title": "Essential Puma Future Rider Trainers",
    "category": "Men",
    "price": 8820.41,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/thumbnail.webp",
    "description": "The Puma Future Rider Trainers offer a blend of retro style and modern comfort. Perfect for casual wear, these trainers provide a fashionable and comfortable option for everyday use.",
    "featured": true,
    "id": 106
  },
  {
    "title": "Signature Sports Sneakers Off White & Red",
    "category": "Men",
    "price": 11163.5,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/thumbnail.webp",
    "description": "The Sports Sneakers in Off White and Red combine style and functionality, making them a fashionable choice for sports enthusiasts. The red and off-white color combination adds a bold and energetic touch.",
    "featured": true,
    "id": 107
  },
  {
    "title": "Vintage Sports Sneakers Off White Red",
    "category": "Men",
    "price": 8861.91,
    "image": "https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/thumbnail.webp",
    "description": "Another variant of the Sports Sneakers in Off White Red, featuring a unique design. These sneakers offer style and comfort for casual occasions.",
    "featured": true,
    "id": 108
  },
  {
    "title": "Eco Black Women's Gown",
    "category": "Women",
    "price": 11108.72,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/black-women's-gown/thumbnail.webp",
    "description": "The Black Women's Gown is an elegant and timeless evening gown. With a sleek black design, it's perfect for formal events and special occasions, exuding sophistication and style.",
    "featured": false,
    "id": 109
  },
  {
    "title": "Signature Corset Leather With Skirt",
    "category": "Women",
    "price": 8046.85,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/thumbnail.webp",
    "description": "The Corset Leather With Skirt is a bold and edgy ensemble that combines a stylish corset with a matching skirt. Ideal for fashion-forward individuals, it makes a statement at any event.",
    "featured": false,
    "id": 110
  },
  {
    "title": "Classic Corset With Black Skirt",
    "category": "Women",
    "price": 6376.89,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/thumbnail.webp",
    "description": "The Corset With Black Skirt is a chic and versatile outfit that pairs a fashionable corset with a classic black skirt. It offers a trendy and coordinated look for various occasions.",
    "featured": true,
    "id": 111
  },
  {
    "title": "Essential Dress Pea",
    "category": "Women",
    "price": 3980.68,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/thumbnail.webp",
    "description": "The Dress Pea is a stylish and comfortable dress with a pea pattern. Perfect for casual outings, it adds a playful and fun element to your wardrobe, making it a great choice for day-to-day wear.",
    "featured": true,
    "id": 112
  },
  {
    "title": "Vintage Marni Red & Black Suit",
    "category": "Women",
    "price": 13705.79,
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/thumbnail.webp",
    "description": "The Marni Red & Black Suit is a sophisticated and fashion-forward suit ensemble. With a combination of red and black tones, it showcases a modern design for a bold and confident look.",
    "featured": false,
    "id": 113
  },
  {
    "title": "Essential Black & Brown Slipper",
    "category": "Women",
    "price": 1728.06,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/black-&-brown-slipper/thumbnail.webp",
    "description": "The Black & Brown Slipper is a comfortable and stylish choice for casual wear. Featuring a blend of black and brown colors, it adds a touch of sophistication to your relaxation.",
    "featured": false,
    "id": 114
  },
  {
    "title": "Classic Calvin Klein Heel Shoes",
    "category": "Women",
    "price": 7704.06,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/thumbnail.webp",
    "description": "Calvin Klein Heel Shoes are elegant and sophisticated, designed for formal occasions. With a classic design and high-quality materials, they complement your stylish ensemble.",
    "featured": true,
    "id": 115
  },
  {
    "title": "Vintage Golden Shoes Woman",
    "category": "Women",
    "price": 4457.1,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/golden-shoes-woman/thumbnail.webp",
    "description": "The Golden Shoes for Women are a glamorous choice for special occasions. Featuring a golden hue and stylish design, they add a touch of luxury to your outfit.",
    "featured": false,
    "id": 116
  },
  {
    "title": "Eco Pampi Shoes",
    "category": "Women",
    "price": 2890.89,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/pampi-shoes/thumbnail.webp",
    "description": "Pampi Shoes offer a blend of comfort and style for everyday use. With a versatile design, they are suitable for various casual occasions, providing a trendy and relaxed look.",
    "featured": false,
    "id": 117
  },
  {
    "title": "Modern Red Shoes",
    "category": "Women",
    "price": 2749.79,
    "image": "https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/thumbnail.webp",
    "description": "The Red Shoes make a bold statement with their vibrant red color. Whether for a party or a casual outing, these shoes add a pop of color and style to your wardrobe.",
    "featured": false,
    "id": 118
  },
  {
    "title": "Standard Blue Frock",
    "category": "Women",
    "price": 2611.18,
    "image": "https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp",
    "description": "The Blue Frock is a charming and stylish dress for various occasions. With a vibrant blue color and a comfortable design, it adds a touch of elegance to your wardrobe.",
    "featured": false,
    "id": 119
  },
  {
    "title": "Vintage Girl Summer Dress",
    "category": "Women",
    "price": 1606.88,
    "image": "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/thumbnail.webp",
    "description": "The Girl Summer Dress is a cute and breezy dress designed for warm weather. With playful patterns and lightweight fabric, it's perfect for keeping cool and stylish during the summer.",
    "featured": true,
    "id": 120
  },
  {
    "title": "Vintage Gray Dress",
    "category": "Women",
    "price": 2753.11,
    "image": "https://cdn.dummyjson.com/product-images/tops/gray-dress/thumbnail.webp",
    "description": "The Gray Dress is a versatile and chic option for various occasions. With a neutral gray color, it can be dressed up or down, making it a wardrobe staple for any fashion-forward individual.",
    "featured": false,
    "id": 121
  },
  {
    "title": "Modern Short Frock",
    "category": "Women",
    "price": 2330.64,
    "image": "https://cdn.dummyjson.com/product-images/tops/short-frock/thumbnail.webp",
    "description": "The Short Frock is a playful and trendy dress with a shorter length. Ideal for casual outings or special occasions, it combines style and comfort for a fashionable look.",
    "featured": false,
    "id": 122
  },
  {
    "title": "Vintage Tartan Dress",
    "category": "Women",
    "price": 3406.32,
    "image": "https://cdn.dummyjson.com/product-images/tops/tartan-dress/thumbnail.webp",
    "description": "The Tartan Dress features a classic tartan pattern, bringing a timeless and sophisticated touch to your wardrobe. Perfect for fall and winter, it adds a hint of traditional charm.",
    "featured": false,
    "id": 123
  },
  {
    "title": "Luxury Brown Leather Belt Watch",
    "category": "Accessories",
    "price": 8436.95,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp",
    "description": "The Brown Leather Belt Watch is a stylish timepiece with a classic design. Featuring a genuine leather strap and a sleek dial, it adds a touch of sophistication to your look.",
    "featured": false,
    "id": 124
  },
  {
    "title": "Modern Longines Master Collection",
    "category": "Accessories",
    "price": 142860.43,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/thumbnail.webp",
    "description": "The Longines Master Collection is an elegant and refined watch known for its precision and craftsmanship. With a timeless design, it's a symbol of luxury and sophistication.",
    "featured": false,
    "id": 125
  },
  {
    "title": "Eco Rolex Cellini Date Black Dial",
    "category": "Accessories",
    "price": 774658.09,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/thumbnail.webp",
    "description": "The Rolex Cellini Date with Black Dial is a classic and prestigious watch. With a black dial and date complication, it exudes sophistication and is a symbol of Rolex's heritage.",
    "featured": true,
    "id": 126
  },
  {
    "title": "Vintage Rolex Cellini Moonphase",
    "category": "Accessories",
    "price": 1087096.65,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-cellini-moonphase/thumbnail.webp",
    "description": "The Rolex Cellini Moonphase is a masterpiece of horology, featuring a moon phase complication and exquisite design. It reflects Rolex's commitment to precision and elegance.",
    "featured": false,
    "id": 127
  },
  {
    "title": "Luxury Rolex Datejust",
    "category": "Accessories",
    "price": 861947.53,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/thumbnail.webp",
    "description": "The Rolex Datejust is an iconic and versatile timepiece with a date window. Known for its timeless design and reliability, it's a symbol of Rolex's watchmaking excellence.",
    "featured": false,
    "id": 128
  },
  {
    "title": "Vintage Rolex Submariner Watch",
    "category": "Accessories",
    "price": 1296722.28,
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-submariner-watch/thumbnail.webp",
    "description": "The Rolex Submariner is a legendary dive watch with a rich history. Known for its durability and water resistance, it's a symbol of adventure and exploration.",
    "featured": false,
    "id": 129
  },
  {
    "title": "Luxury IWC Ingenieur Automatic Steel",
    "category": "Accessories",
    "price": 427847.57,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/iwc-ingenieur-automatic-steel/thumbnail.webp",
    "description": "The IWC Ingenieur Automatic Steel watch is a durable and sophisticated timepiece. With a stainless steel case and automatic movement, it combines precision and style for watch enthusiasts.",
    "featured": false,
    "id": 130
  },
  {
    "title": "Classic Rolex Cellini Moonphase",
    "category": "Accessories",
    "price": 1331272.69,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-cellini-moonphase/thumbnail.webp",
    "description": "The Rolex Cellini Moonphase watch is a masterpiece of horology. Featuring a moon phase complication, it showcases the craftsmanship and elegance that Rolex is renowned for.",
    "featured": false,
    "id": 131
  },
  {
    "title": "Modern Rolex Datejust Women",
    "category": "Accessories",
    "price": 1077737.57,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/rolex-datejust-women/thumbnail.webp",
    "description": "The Rolex Datejust Women's watch is an iconic timepiece designed for women. With a timeless design and a date complication, it offers both elegance and functionality.",
    "featured": false,
    "id": 132
  },
  {
    "title": "Luxury Watch Gold for Women",
    "category": "Accessories",
    "price": 79514.83,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/watch-gold-for-women/thumbnail.webp",
    "description": "The Gold Women's Watch is a stunning accessory that combines luxury and style. Featuring a gold-plated case and a chic design, it adds a touch of glamour to any outfit.",
    "featured": false,
    "id": 133
  },
  {
    "title": "Signature Women's Wrist Watch",
    "category": "Accessories",
    "price": 11902.2,
    "image": "https://cdn.dummyjson.com/product-images/womens-watches/women's-wrist-watch/thumbnail.webp",
    "description": "The Women's Wrist Watch is a versatile and fashionable timepiece for everyday wear. With a comfortable strap and a simple yet elegant design, it complements various styles.",
    "featured": false,
    "id": 134
  },
  {
    "title": "Modern Blue Women's Handbag",
    "category": "Accessories",
    "price": 4593.22,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/thumbnail.webp",
    "description": "The Blue Women's Handbag is a stylish and spacious accessory for everyday use. With a vibrant blue color and multiple compartments, it combines fashion and functionality.",
    "featured": false,
    "id": 135
  },
  {
    "title": "Vintage Heshe Women's Leather Bag",
    "category": "Accessories",
    "price": 10670.48,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women's-leather-bag/thumbnail.webp",
    "description": "The Heshe Women's Leather Bag is a luxurious and high-quality leather bag for the sophisticated woman. With a timeless design and durable craftsmanship, it's a versatile accessory.",
    "featured": true,
    "id": 136
  },
  {
    "title": "Signature Prada Women Bag",
    "category": "Accessories",
    "price": 58189.64,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/thumbnail.webp",
    "description": "The Prada Women Bag is an iconic designer bag that exudes elegance and luxury. Crafted with precision and featuring the Prada logo, it's a statement piece for fashion enthusiasts.",
    "featured": false,
    "id": 137
  },
  {
    "title": "Signature White Faux Leather Backpack",
    "category": "Accessories",
    "price": 3920.09,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/thumbnail.webp",
    "description": "The White Faux Leather Backpack is a trendy and practical backpack for the modern woman. With a sleek white design and ample storage space, it's perfect for both casual and on-the-go styles.",
    "featured": false,
    "id": 138
  },
  {
    "title": "Standard Women Handbag Black",
    "category": "Accessories",
    "price": 4750.09,
    "image": "https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/thumbnail.webp",
    "description": "The Women Handbag in Black is a classic and versatile accessory that complements various outfits. With a timeless black color and functional design, it's a must-have in every woman's wardrobe.",
    "featured": false,
    "id": 139
  },
  {
    "title": "Premium Green Crystal Earring",
    "category": "Accessories",
    "price": 2792.12,
    "image": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-crystal-earring/thumbnail.webp",
    "description": "The Green Crystal Earring is a dazzling accessory that features a vibrant green crystal. With a classic design, it adds a touch of elegance to your ensemble, perfect for formal or special occasions.",
    "featured": false,
    "id": 140
  },
  {
    "title": "Premium Green Oval Earring",
    "category": "Accessories",
    "price": 2064.21,
    "image": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-oval-earring/thumbnail.webp",
    "description": "The Green Oval Earring is a stylish and versatile accessory with a unique oval shape. Whether for casual or dressy occasions, its green hue and contemporary design make it a standout piece.",
    "featured": false,
    "id": 141
  },
  {
    "title": "Premium Tropical Earring",
    "category": "Accessories",
    "price": 1915.64,
    "image": "https://cdn.dummyjson.com/product-images/womens-jewellery/tropical-earring/thumbnail.webp",
    "description": "The Tropical Earring is a fun and playful accessory inspired by tropical elements. Featuring vibrant colors and a lively design, it's perfect for adding a touch of summer to your look.",
    "featured": false,
    "id": 142
  },
  {
    "title": "Essential Black Sun Glasses",
    "category": "Accessories",
    "price": 2953.14,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/thumbnail.webp",
    "description": "The Black Sun Glasses are a classic and stylish choice, featuring a sleek black frame and tinted lenses. They provide both UV protection and a fashionable look.",
    "featured": false,
    "id": 143
  },
  {
    "title": "Vintage Classic Sun Glasses",
    "category": "Accessories",
    "price": 2081.64,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/thumbnail.webp",
    "description": "The Classic Sun Glasses offer a timeless design with a neutral frame and UV-protected lenses. These sunglasses are versatile and suitable for various occasions.",
    "featured": false,
    "id": 144
  },
  {
    "title": "Modern Green and Black Glasses",
    "category": "Accessories",
    "price": 3427.07,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/thumbnail.webp",
    "description": "The Green and Black Glasses feature a bold combination of green and black colors, adding a touch of vibrancy to your eyewear collection. They are both stylish and eye-catching.",
    "featured": true,
    "id": 145
  },
  {
    "title": "Standard Party Glasses",
    "category": "Accessories",
    "price": 1720.59,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/party-glasses/thumbnail.webp",
    "description": "The Party Glasses are designed to add flair to your party outfit. With unique shapes or colorful frames, they're perfect for adding a playful touch to your look during celebrations.",
    "featured": false,
    "id": 146
  },
  {
    "title": "Essential Sunglasses",
    "category": "Accessories",
    "price": 2209.46,
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/thumbnail.webp",
    "description": "The Sunglasses offer a classic and simple design with a focus on functionality. These sunglasses provide essential UV protection while maintaining a timeless look.",
    "featured": false,
    "id": 147
  }
];
