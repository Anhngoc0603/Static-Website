// ==================== SHOP PAGE ====================

let currentProducts = [];
let currentFilters = {
  search: '',
  category: 'all',
  sort: 'featured'
};

// Render products
function renderProducts(products) {
  const container = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  
  if (!container) return;

  if (products.length === 0) {
    container.style.display = 'none';
    if (noResults) noResults.style.display = 'block';
    return;
  }

  container.style.display = 'grid';
  if (noResults) noResults.style.display = 'none';

  container.innerHTML = products.map(product => {
    const discount = getDiscountPercentage(product.price, product.originalPrice);
    
    return `
      <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
        <div class="product-image">
          <img src="${product.images[0]}" alt="${product.name}">
          ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); quickAddToCart(${product.id})">
            Add to Cart
          </button>
        </div>
        <div class="product-info">
          <div class="product-brand">${product.brand}</div>
          <div class="product-name">${product.name}</div>
          <div class="product-rating">
            <span class="stars">${generateStarRating(product.rating)}</span>
            <span>${product.rating}</span>
            <span style="color: #9ca3af;">(${product.reviews})</span>
          </div>
          <div class="product-price">
            <span class="current-price">${formatPrice(product.price)}</span>
            ${product.originalPrice > product.price ? 
              `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Apply filters
function applyFilters() {
  let products = getAllProducts();

  // Filter by category
  if (currentFilters.category !== 'all') {
    products = getProductsByCategory(currentFilters.category);
  }

  // Filter by search
  if (currentFilters.search) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
      p.brand.toLowerCase().includes(currentFilters.search.toLowerCase())
    );
  }

  // Sort products
  products = sortProducts(products, currentFilters.sort);

  currentProducts = products;
  renderProducts(products);
}

// Quick add to cart
function quickAddToCart(productId) {
  const product = getProductById(productId);
  if (product) {
    addToCart(product, product.sizes[0], product.colors[0]);
  }
}

// Initialize shop page
document.addEventListener('DOMContentLoaded', function() {
  // Load all products
  currentProducts = getAllProducts();
  renderProducts(currentProducts);

  // Search filter
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      currentFilters.search = e.target.value;
      applyFilters();
    });
  }

  // Category filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function(e) {
      currentFilters.category = e.target.value;
      applyFilters();
    });
  }

  // Sort filter
  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) {
    sortFilter.addEventListener('change', function(e) {
      currentFilters.sort = e.target.value;
      applyFilters();
    });
  }

  updateCartUI();
});