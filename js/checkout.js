// ==================== CHECKOUT PAGE ====================

// Check if cart is empty
function checkCartEmpty() {
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = 'shop.html';
    return true;
  }
  return false;
}

// Render order items
function renderOrderItems() {
  const container = document.getElementById('orderItems');
  if (!container) return;

  const cart = getCart();
  
  container.innerHTML = cart.map(item => `
    <div class="order-item">
      <img src="${item.image}" alt="${item.name}" class="order-item-image">
      <div class="order-item-info">
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-meta">
          Size: ${item.size} | Color: ${getColorName(item.color)} | Qty: ${item.quantity}
        </div>
        <div class="order-item-price">${formatPrice(item.price * item.quantity)}</div>
      </div>
    </div>
  `).join('');
}

// Update order summary
function updateOrderSummary() {
  const cart = getCart();
  const subtotal = getCartTotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(total);
}

// Validate form
function validateCheckoutForm(formData) {
  const errors = [];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    errors.push('Please enter a valid email address');
  }

  // Phone validation
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(formData.phone) || formData.phone.length < 10) {
    errors.push('Please enter a valid phone number');
  }

  // ZIP code validation
  if (formData.zip.length < 5) {
    errors.push('Please enter a valid ZIP code');
  }

  // Required fields
  const requiredFields = ['firstName', 'lastName', 'address', 'city'];
  requiredFields.forEach(field => {
    if (!formData[field] || formData[field].trim() === '') {
      errors.push(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`);
    }
  });

  return errors;
}

// Handle form submission
function handleCheckoutSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Validate form
  const errors = validateCheckoutForm(data);
  if (errors.length > 0) {
    showErrorToast(errors[0]);
    return;
  }

  // Check payment method
  if (!data.payment) {
    showErrorToast('Please select a payment method');
    return;
  }

  // Get order data
  const orderData = {
    customer: data,
    items: getCart(),
    total: getCartTotal(),
    date: new Date().toISOString()
  };

  // Save order to localStorage (in real app, send to server)
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(orderData);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Show success message
  showOrderComplete();

  // Clear cart
  clearCart();
}

// Show order complete
function showOrderComplete() {
  const checkoutForm = document.getElementById('checkoutForm');
  const orderComplete = document.getElementById('orderComplete');

  if (checkoutForm) checkoutForm.style.display = 'none';
  if (orderComplete) {
    orderComplete.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Redirect after 5 seconds
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 5000);
  }
}

// Format card number
function formatCardNumber(input) {
  let value = input.value.replace(/\s/g, '');
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  input.value = formattedValue;
}

// Format expiry date
function formatExpiryDate(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4);
  }
  input.value = value;
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
  // Check if cart is empty
  if (checkCartEmpty()) return;

  // Render order items
  renderOrderItems();
  updateOrderSummary();

  // Handle form submission
  const form = document.getElementById('orderForm');
  if (form) {
    form.addEventListener('submit', handleCheckoutSubmit);
  }

  // Add input formatting listeners
  const cardNumberInput = document.querySelector('input[name="cardNumber"]');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function() {
      formatCardNumber(this);
    });
  }

  const expiryInput = document.querySelector('input[name="expiry"]');
  if (expiryInput) {
    expiryInput.addEventListener('input', function() {
      formatExpiryDate(this);
    });
  }

  // Update cart badge
  updateCartUI();
});

// Handle back navigation
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    // Page was loaded from cache (back/forward navigation)
    if (checkCartEmpty()) return;
  }
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}
