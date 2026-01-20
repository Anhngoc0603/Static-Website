// ==================== MAIN PAGE (INDEX.HTML) ====================

// Header scroll effect
window.addEventListener('scroll', function() {
  const header = document.getElementById('header');
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// Mobile menu toggle
function toggleMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  if (navMenu) {
    navMenu.classList.toggle('active');
  }
}

// Render featured products
function renderFeaturedProducts() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;

  const products = getAllProducts().slice(0, 4);
  
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

// Quick add to cart
function quickAddToCart(productId) {
  const product = getProductById(productId);
  if (product) {
    addToCart(product, product.sizes[0], product.colors[0]);
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  renderFeaturedProducts();
  updateCartUI();
});