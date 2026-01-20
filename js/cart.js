// ==================== CART MANAGEMENT ====================

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Get cart
function getCart() {
  return cart;
}

// Get cart count
function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Get cart total
function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Add to cart
function addToCart(product, size, color) {
  const existingItem = cart.find(item =>
    item.id === product.id &&
    item.size === size &&
    item.color === color
  );

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images[0],
      size: size,
      color: color,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast('Added to cart!');
}

// Remove from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
  showToast('Item removed from cart');
}

// Update quantity
function updateQuantity(index, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(index);
  } else {
    cart[index].quantity = newQuantity;
    saveCart();
    updateCartUI();
  }
}

// Clear cart
function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

// Update cart UI
function updateCartUI() {
  const cartBadge = document.getElementById('cartBadge');
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotal = document.getElementById('cartTotal');

  const count = getCartCount();
  const total = getCartTotal();

  // Update badge
  if (cartBadge) {
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? 'flex' : 'none';
  }

  // Update count
  if (cartCount) {
    cartCount.textContent = cart.length;
  }

  // Update total
  if (cartTotal) {
    cartTotal.textContent = formatPrice(total);
  }

  // Update items
  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="cart-empty">
          <svg class="cart-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <p>Your cart is empty</p>
        </div>
      `;
      if (cartFooter) cartFooter.style.display = 'none';
    } else {
      cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">
              <span>Size: ${item.size}</span>
              <span>|</span>
              <span>Color: ${getColorName(item.color)}</span>
            </div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})">−</button>
              <span class="quantity-value">${item.quantity}</span>
              <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
            </div>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${index})">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      `).join('');
      if (cartFooter) cartFooter.style.display = 'block';
    }
  }
}

// Toggle cart sidebar
function toggleCart() {
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');

  if (overlay && sidebar) {
    overlay.classList.toggle('active');
    sidebar.classList.toggle('active');
  }
}

// Get color name from hex
function getColorName(hex) {
  const colorMap = {
    '#000000': 'Black',
    '#ffffff': 'White',
    '#ef4444': 'Red',
    '#3b82f6': 'Blue',
    '#10b981': 'Green',
    '#f97316': 'Orange',
    '#9ca3af': 'Gray',
    '#92400e': 'Brown',
    '#a855f7': 'Purple',
    '#1e40af': 'Navy',
    '#f5f5dc': 'Cream'
  };
  return colorMap[hex.toLowerCase()] || 'Custom';
}

// Load cart sidebar HTML
function loadCartSidebar() {
  const container = document.getElementById('cartSidebarContainer');
  if (container) {
    container.innerHTML = `
      <div class="cart-overlay" id="cartOverlay" onclick="toggleCart()"></div>
      <div class="cart-sidebar" id="cartSidebar">
        <div class="cart-header">
          <h2 class="cart-title">Shopping Cart (<span id="cartCount">0</span>)</h2>
          <button class="close-btn" onclick="toggleCart()">×</button>
        </div>
        <div class="cart-items" id="cartItems"></div>
        <div class="cart-footer" id="cartFooter" style="display: none;">
          <div class="cart-total">
            <span class="cart-total-label">Total:</span>
            <span class="cart-total-amount" id="cartTotal">$0.00</span>
          </div>
          <button class="checkout-btn" onclick="window.location.href='checkout.html'">
            Proceed to Checkout
          </button>
        </div>
      </div>
    `;
  }
}

// Initialize cart on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    loadCartSidebar();
    updateCartUI();
  });
}