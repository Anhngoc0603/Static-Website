// ==================== PRODUCT DETAIL PAGE ====================

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let currentImageIndex = 0;

// Get product ID from URL
function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return parseInt(urlParams.get('id'));
}

// Render product detail
function renderProductDetail() {
  const productId = getProductIdFromURL();
  const product = getProductById(productId);
  const container = document.getElementById('productDetail');

  if (!product || !container) {
    window.location.href = 'shop.html';
    return;
  }

  currentProduct = product;
  selectedSize = product.sizes[0];
  selectedColor = product.colors[0];

  const discount = getDiscountPercentage(product.price, product.originalPrice);

  container.innerHTML = `
    <div class="product-gallery">
      <div class="main-image" id="mainImage">
        <img src="${product.images[0]}" alt="${product.name}">
      </div>
      <div class="thumbnail-images">
        ${product.images.map((img, index) => `
          <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeImage(${index})">
            <img src="${img}" alt="${product.name}">
          </div>
        `).join('')}
      </div>
    </div>

    <div class="product-details">
      <div class="product-brand">${product.brand}</div>
      <h1>${product.name}</h1>
      
      <div class="product-meta">
        <div class="product-rating">
          <span class="stars">${generateStarRating(product.rating)}</span>
          <span>${product.rating}</span>
          <span>(${product.reviews} reviews)</span>
        </div>
      </div>

      <div class="product-price">
        <span class="current-price">${formatPrice(product.price)}</span>
        ${product.originalPrice > product.price ? 
          `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
        ${discount > 0 ? `<span class="discount-badge">-${discount}% OFF</span>` : ''}
      </div>

      <p class="product-description">${product.description}</p>

      <div class="size-selector">
        <h3>Select Size (US)</h3>
        <div class="size-options" id="sizeOptions">
          ${product.sizes.map(size => `
            <button class="size-option ${size === selectedSize ? 'active' : ''}" 
                    onclick="selectSize(${size})">
              ${size}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="color-selector">
        <h3>Select Color</h3>
        <div class="color-options" id="colorOptions">
          ${product.colors.map(color => `
            <button class="color-option ${color === selectedColor ? 'active' : ''}" 
                    style="background-color: ${color}"
                    onclick="selectColor('${color}')"
                    title="${getColorName(color)}">
            </button>
          `).join('')}
        </div>
      </div>

      <button class="btn-primary btn-block" onclick="addCurrentProductToCart()">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        Add to Cart
      </button>

      <div style="margin-top: 2rem; padding: 1.5rem; background: #f9fafb; border-radius: 0.5rem;">
        <h4 style="margin-bottom: 1rem; font-size: 1.125rem;">Product Features</h4>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" fill="none" stroke="#10b981" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Free shipping on orders over $100</span>
          </li>
          <li style="padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" fill="none" stroke="#10b981" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>30-day return policy</span>
          </li>
          <li style="padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" fill="none" stroke="#10b981" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Authentic products guaranteed</span>
          </li>
          <li style="padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" fill="none" stroke="#10b981" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Secure payment processing</span>
          </li>
        </ul>
      </div>
    </div>
  `;
}

// Change image
function changeImage(index) {
  if (!currentProduct) return;

  currentImageIndex = index;
  const mainImage = document.getElementById('mainImage');
  
  if (mainImage) {
    mainImage.innerHTML = `<img src="${currentProduct.images[index]}" alt="${currentProduct.name}">`;
  }

  // Update thumbnails
  document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
    if (i === index) {
      thumb.classList.add('active');
    } else {
      thumb.classList.remove('active');
    }
  });
}

// Select size
function selectSize(size) {
  selectedSize = size;
  
  document.querySelectorAll('.size-option').forEach(option => {
    option.classList.remove('active');
  });
  
  event.target.classList.add('active');
}

// Select color
function selectColor(color) {
  selectedColor = color;
  
  document.querySelectorAll('.color-option').forEach(option => {
    option.classList.remove('active');
  });
  
  event.target.classList.add('active');
}

// Add current product to cart
function addCurrentProductToCart() {
  if (!currentProduct) return;

  if (!selectedSize) {
    showErrorToast('Please select a size');
    return;
  }

  if (!selectedColor) {
    showErrorToast('Please select a color');
    return;
  }

  addToCart(currentProduct, selectedSize, selectedColor);
  
  // Optional: Open cart sidebar
  setTimeout(() => {
    toggleCart();
  }, 500);
}

// Render related products
function renderRelatedProducts() {
  const container = document.getElementById('relatedProducts');
  if (!container || !currentProduct) return;

  const relatedProducts = getAllProducts()
    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 4);

  if (relatedProducts.length === 0) {
    document.querySelector('.related-section').style.display = 'none';
    return;
  }

  container.innerHTML = relatedProducts.map(product => {
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

// Quick add to cart for related products
function quickAddToCart(productId) {
  const product = getProductById(productId);
  if (product) {
    addToCart(product, product.sizes[0], product.colors[0]);
  }
}

// Initialize product page
document.addEventListener('DOMContentLoaded', function() {
  renderProductDetail();
  renderRelatedProducts();
  updateCartUI();

  // Scroll to top
  window.scrollTo(0, 0);
});