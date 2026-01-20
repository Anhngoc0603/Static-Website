// ==================== CATEGORIES PAGE ====================

let currentSlide = 0;
let currentFilters = {
  category: [],
  condition: 'new',
  shipping: 'free',
  search: ''
};

// ==================== SLIDER FUNCTIONS ====================

function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  if (index >= slides.length) currentSlide = 0;
  if (index < 0) currentSlide = slides.length - 1;

  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  if (slides[currentSlide]) {
    slides[currentSlide].classList.add('active');
  }
  if (dots[currentSlide]) {
    dots[currentSlide].classList.add('active');
  }
}

function nextSlide() {
  currentSlide++;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide--;
  showSlide(currentSlide);
}

function goToSlide(index) {
  currentSlide = index;
  showSlide(currentSlide);
}

// Auto slide
let slideInterval;
function startAutoSlide() {
  slideInterval = setInterval(() => {
    nextSlide();
  }, 5000);
}

function stopAutoSlide() {
  clearInterval(slideInterval);
}

// ==================== RENDER PRODUCTS ====================

function renderProducts() {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  let products = getAllProducts();

  // Apply filters
  products = applyFilters(products);

  container.innerHTML = products.map(product => {
    const discount = getDiscountPercentage(product.price, product.originalPrice);
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));

    return `
      <div class="product-card-full" onclick="window.location.href='product.html?id=${product.id}'">
        <div class="product-card-image">
          <img src="${product.images[0]}" alt="${product.name}" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
          <div class="product-card-colors">
            ${product.colors.slice(0, 4).map(color => `
              <span class="color-dot" style="background-color: ${color}"></span>
            `).join('')}
          </div>
        </div>
        <div class="product-card-info">
          <div class="product-card-name">${product.name}</div>
          <div class="product-card-footer">
            <div class="product-price-group">
              <span class="product-price-main">${formatPrice(product.price)}</span>
              ${product.originalPrice > product.price ?
        `<span class="product-price-old">${formatPrice(product.originalPrice)}</span>` : ''}
            </div>
            <div class="product-rating">
              <span class="product-stars">${stars}</span>
              <span class="product-reviews">${product.rating}K+</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== FILTER FUNCTIONS ====================

function applyFilters(products) {
  let filtered = [...products];

  // Filter by category checkboxes
  const categoryChecks = document.querySelectorAll('input[name="category"]:checked');
  const selectedCategories = Array.from(categoryChecks).map(cb => cb.value);

  if (selectedCategories.length > 0) {
    // For demo, we'll just filter by actual product categories
    // In real app, you'd map checkbox values to product categories
  }

  // Filter by condition
  const conditionRadio = document.querySelector('input[name="condition"]:checked');
  if (conditionRadio) {
    currentFilters.condition = conditionRadio.value;
  }

  // Filter by shipping
  const shippingRadio = document.querySelector('input[name="shipping"]:checked');
  if (shippingRadio) {
    currentFilters.shipping = shippingRadio.value;
  }

  return filtered;
}

function filterByCategory(category) {
  currentFilters.category = [category];

  // Filter products by category
  const products = getAllProducts().filter(p => p.category === category);

  // Render filtered products
  const container = document.getElementById('productsGrid');
  if (container) {
    container.innerHTML = products.map(product => {
      const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));

      return `
        <div class="product-card-full" onclick="window.location.href='product.html?id=${product.id}'">
          <div class="product-card-image">
            <img src="${product.images[0]}" alt="${product.name}">
            <div class="product-card-colors">
              ${product.colors.slice(0, 4).map(color => `
                <span class="color-dot" style="background-color: ${color}"></span>
              `).join('')}
            </div>
          </div>
          <div class="product-card-info">
            <div class="product-card-name">${product.name}</div>
            <div class="product-card-footer">
              <div class="product-price-group">
                <span class="product-price-main">${formatPrice(product.price)}</span>
                ${product.originalPrice > product.price ?
          `<span class="product-price-old">${formatPrice(product.originalPrice)}</span>` : ''}
              </div>
              <div class="product-rating">
                <span class="product-stars">${stars}</span>
                <span class="product-reviews">${product.rating}K+</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  showToast(`Filtered by ${category}`);

  // Scroll to products
  document.querySelector('.products-with-sidebar').scrollIntoView({ behavior: 'smooth' });
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', function () {
  // Initialize
  renderProducts();
  updateCartUI();
  startAutoSlide();

  // Slider controls
  const sliderContainer = document.querySelector('.slider-container');
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
  }

  // Filter checkboxes
  const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      renderProducts();
    });
  });

  // Condition radios
  const conditionRadios = document.querySelectorAll('input[name="condition"]');
  conditionRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      renderProducts();
    });
  });

  // Shipping radios
  const shippingRadios = document.querySelectorAll('input[name="shipping"]');
  shippingRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      renderProducts();
    });
  });

  // Newsletter form
  const newsletterForm = document.querySelector('.newsletter-form-full');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;

      if (email) {
        showSuccessToast('Successfully subscribed to newsletter!');
        this.reset();
      } else {
        showErrorToast('Please enter a valid email');
      }
    });
  }

  // Pagination buttons
  const paginationNumbers = document.querySelectorAll('.pagination-number');
  paginationNumbers.forEach(btn => {
    btn.addEventListener('click', function () {
      paginationNumbers.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Scroll to top of products
      document.querySelector('.products-with-sidebar').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');

  if (categoryParam) {
    filterByCategory(categoryParam);
  }
});

// ==================== MOBILE MENU ====================


// ==================== PRODUCT QUICK VIEW ====================

// Functionality removed as per requirements (direct navigation to product.html)


// ==================== WISHLIST ====================

let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function toggleWishlist(productId) {
  const index = wishlist.indexOf(productId);

  if (index > -1) {
    wishlist.splice(index, 1);
    showToast('Removed from wishlist');
  } else {
    wishlist.push(productId);
    showSuccessToast('Added to wishlist');
  }

  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  renderProducts();
}

function isInWishlist(productId) {
  return wishlist.includes(productId);
}

// ==================== COMPARE PRODUCTS ====================

let compareList = [];

function addToCompare(productId) {
  if (compareList.length >= 4) {
    showErrorToast('You can compare up to 4 products');
    return;
  }

  if (compareList.includes(productId)) {
    showToast('Product already in compare list');
    return;
  }

  compareList.push(productId);
  showSuccessToast('Added to compare list');
  updateCompareButton();
}

function removeFromCompare(productId) {
  compareList = compareList.filter(id => id !== productId);
  updateCompareButton();
}

function updateCompareButton() {
  let compareBtn = document.getElementById('compareBtn');

  if (!compareBtn && compareList.length > 0) {
    compareBtn = document.createElement('button');
    compareBtn.id = 'compareBtn';
    compareBtn.className = 'compare-floating-btn';
    compareBtn.innerHTML = `
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <span>Compare (${compareList.length})</span>
    `;
    compareBtn.onclick = showCompareModal;
    document.body.appendChild(compareBtn);
  }

  if (compareBtn) {
    if (compareList.length === 0) {
      compareBtn.remove();
    } else {
      compareBtn.querySelector('span').textContent = `Compare (${compareList.length})`;
    }
  }
}

function showCompareModal() {
  const products = compareList.map(id => getProductById(id)).filter(Boolean);

  const modal = document.createElement('div');
  modal.className = 'compare-modal';
  modal.innerHTML = `
    <div class="compare-overlay" onclick="closeCompareModal()"></div>
    <div class="compare-content">
      <div class="compare-header">
        <h2>Compare Products</h2>
        <button class="close-modal" onclick="closeCompareModal()">×</button>
      </div>
      <div class="compare-grid">
        ${products.map(product => `
          <div class="compare-item">
            <img src="${product.images[0]}" alt="${product.name}">
            <h3>${product.name}</h3>
            <div class="compare-price">${formatPrice(product.price)}</div>
            <div class="compare-rating">${'★'.repeat(Math.floor(product.rating))}</div>
            <button class="btn-primary" onclick="window.location.href='product.html?id=${product.id}'">
              View Product
            </button>
            <button class="btn-remove" onclick="removeFromCompare(${product.id}); closeCompareModal(); showCompareModal();">
              Remove
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function closeCompareModal() {
  const modal = document.querySelector('.compare-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

// ==================== SORT & VIEW OPTIONS ====================

function sortProducts(sortBy) {
  let products = getAllProducts();

  switch (sortBy) {
    case 'price-low':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      products.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      products.sort((a, b) => b.id - a.id);
      break;
    default:
      // Featured/default
      break;
  }

  renderProductsWithData(products);
}

function renderProductsWithData(products) {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  container.innerHTML = products.map(product => {
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));

    return `
      <div class="product-card-full" onclick="window.location.href='product.html?id=${product.id}'">
        <div class="product-card-image">
          <img src="${product.images[0]}" alt="${product.name}" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
          <div class="product-card-colors">
            ${product.colors.slice(0, 4).map(color => `
              <span class="color-dot" style="background-color: ${color}"></span>
            `).join('')}
          </div>
        </div>
        <div class="product-card-info">
          <div class="product-card-name">${product.name}</div>
          <div class="product-card-footer">
            <div class="product-price-group">
              <span class="product-price-main">${formatPrice(product.price)}</span>
              ${product.originalPrice > product.price ?
        `<span class="product-price-old">${formatPrice(product.originalPrice)}</span>` : ''}
            </div>
            <div class="product-rating">
              <span class="product-stars">${stars}</span>
              <span class="product-reviews">${product.rating}K+</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== KEYBOARD SHORTCUTS ====================

document.addEventListener('keydown', function (e) {
  // ESC to close modals
  if (e.key === 'Escape') {
    closeQuickView();
    closeCompareModal();
  }

  // Arrow keys for slider
  if (e.key === 'ArrowLeft') {
    prevSlide();
  }
  if (e.key === 'ArrowRight') {
    nextSlide();
  }
});

// ==================== SCROLL TO TOP BUTTON ====================

window.addEventListener('scroll', function () {
  let scrollBtn = document.getElementById('scrollTopBtn');

  if (window.scrollY > 500) {
    if (!scrollBtn) {
      scrollBtn = document.createElement('button');
      scrollBtn.id = 'scrollTopBtn';
      scrollBtn.className = 'scroll-top-btn';
      scrollBtn.innerHTML = `
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
        </svg>
      `;
      scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.appendChild(scrollBtn);
    }
    scrollBtn.style.display = 'flex';
  } else if (scrollBtn) {
    scrollBtn.style.display = 'none';
  }
});