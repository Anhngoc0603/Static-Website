// ==================== PRODUCTS DATA ====================
const PRODUCTS = [
  {
    id: 1,
    name: "Air Max Velocity",
    brand: "Nike",
    price: 189.99,
    originalPrice: 249.99,
    rating: 4.8,
    reviews: 234,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800"
    ],
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["#000000", "#ffffff", "#ef4444"],
    category: "running",
    description: "Premium running shoes with advanced cushioning technology for ultimate comfort. Features breathable mesh upper and responsive sole for all-day wear."
  },
  {
    id: 2,
    name: "Urban Street Pro",
    brand: "Adidas",
    price: 159.99,
    originalPrice: 199.99,
    rating: 4.6,
    reviews: 189,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800"
    ],
    sizes: [7, 8, 9, 10, 11],
    colors: ["#ffffff", "#9ca3af", "#3b82f6"],
    category: "casual",
    description: "Stylish street shoes combining comfort and urban fashion. Perfect for everyday wear with premium leather construction."
  },
  {
    id: 3,
    name: "Zoom Elite Runner",
    brand: "Nike",
    price: 219.99,
    originalPrice: 279.99,
    rating: 4.9,
    reviews: 456,
    images: [
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"
    ],
    sizes: [8, 9, 10, 11, 12],
    colors: ["#000000", "#f97316", "#10b981"],
    category: "running",
    description: "Elite performance running shoes for serious athletes. Lightweight design with maximum energy return for your fastest runs."
  },
  {
    id: 4,
    name: "Classic Leather Low",
    brand: "Reebok",
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.5,
    reviews: 145,
    images: [
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800"
    ],
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["#ffffff", "#000000", "#92400e"],
    category: "casual",
    description: "Timeless leather sneakers for everyday style. Classic design meets modern comfort in this versatile shoe."
  },
  {
    id: 5,
    name: "Court Vision Mid",
    brand: "Nike",
    price: 179.99,
    originalPrice: 229.99,
    rating: 4.7,
    reviews: 298,
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800",
      "https://images.unsplash.com/photo-1603808033176-e2f60eda6c28?w=800"
    ],
    sizes: [7, 8, 9, 10, 11],
    colors: ["#ffffff", "#ef4444", "#3b82f6"],
    category: "basketball",
    description: "Mid-top basketball shoes with superior ankle support. Designed for performance on and off the court."
  },
  {
    id: 6,
    name: "Boost 350 V2",
    brand: "Adidas",
    price: 239.99,
    originalPrice: 299.99,
    rating: 4.9,
    reviews: 567,
    images: [
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800",
      "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800"
    ],
    sizes: [8, 9, 10, 11, 12],
    colors: ["#9ca3af", "#000000", "#f5f5dc"],
    category: "lifestyle",
    description: "Iconic lifestyle sneakers with boost technology. Unparalleled comfort meets cutting-edge style."
  },
  {
    id: 7,
    name: "React Infinity Run",
    brand: "Nike",
    price: 169.99,
    originalPrice: 210.99,
    rating: 4.7,
    reviews: 312,
    images: [
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800",
      "https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=800"
    ],
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["#000000", "#ffffff", "#a855f7"],
    category: "running",
    description: "Designed to help reduce injury and keep you on the run. Features soft, stable support for a smooth ride."
  },
  {
    id: 8,
    name: "Stan Smith Classic",
    brand: "Adidas",
    price: 89.99,
    originalPrice: 120.99,
    rating: 4.8,
    reviews: 891,
    images: [
      "https://images.unsplash.com/photo-1622433099229-c88346378e68?w=800",
      "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800"
    ],
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["#ffffff", "#10b981", "#1e40af"],
    category: "casual",
    description: "The iconic Stan Smith gets a sustainable update. Made with recycled materials for eco-conscious style."
  }
];

// Get all products
function getAllProducts() {
  return PRODUCTS;
}

// Get product by ID
function getProductById(id) {
  return PRODUCTS.find(p => p.id === parseInt(id));
}

// Get products by category
function getProductsByCategory(category) {
  if (category === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === category);
}

// Search products
function searchProducts(query) {
  const lowerQuery = query.toLowerCase();
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.brand.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  );
}

// Sort products
function sortProducts(products, sortBy) {
  const sorted = [...products];
  
  switch(sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

// Calculate discount percentage
function getDiscountPercentage(price, originalPrice) {
  if (originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

// Format price
function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

// Generate star rating HTML
function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '☆';
  return stars;
}