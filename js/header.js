/**
 * Header Component
 * Loads the header dynamically and handles its functionality
 */

function loadHeader() {
  const headerHTML = `
  <div class="container">
    <nav class="navbar">
      <div class="logo" onclick="window.location.href='index.html'">SNEAKER</div>
      
      <!-- Desktop Menu -->
      <ul class="nav-menu" id="navMenu">
        <li><a href="index.html">Home</a></li>
        <li><a href="shop.html">Shop</a></li>
        <li><a href="categories.html">Categories</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>

      <div class="nav-icons">
        <!-- Search Icon -->
        <button class="icon-btn">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>
        
        <!-- Cart Icon -->
        <button class="icon-btn" onclick="toggleCart()">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span class="cart-badge" id="cartBadge">0</span>
        </button>
        
        <!-- User Icon -->
        <button class="icon-btn" onclick="window.location.href='login.html'">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </button>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-toggle icon-btn" onclick="toggleMobileMenu()">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </nav>
  </div>
  `;

  // Inject header HTML
  const headerElement = document.getElementById('header');
  if (headerElement) {
    headerElement.innerHTML = headerHTML;
    setActiveLink();
    initHeaderScroll();
    initMobileMenuListeners();
  }
}

// Set active link based on current URL
function setActiveLink() {
  // Get current path, ignoring query strings and hashes
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-menu a');

  navLinks.forEach(link => {
    // Get href attribute
    const linkHref = link.getAttribute('href');

    // Check if the link matches the current path
    // We handle "index.html" vs "/" case and other potential variations
    if (linkHref === currentPath ||
      (currentPath === 'index.html' && (linkHref === './' || linkHref === '/')) ||
      (linkHref.includes(currentPath) && currentPath !== '')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Header scroll effect
function initHeaderScroll() {
  window.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });
}

// Mobile menu toggle
window.toggleMobileMenu = function () {
  const navMenu = document.querySelector('.nav-menu');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const body = document.body;

  if (!navMenu) return;

  // Toggle menu
  navMenu.classList.toggle('active');

  // Toggle hamburger icon
  if (mobileToggle) {
    const isActive = navMenu.classList.contains('active');
    mobileToggle.innerHTML = isActive
      ? '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
      : '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>';
  }

  // Create overlay if doesn't exist
  let overlay = document.getElementById('mobileOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobileOverlay';
    overlay.className = 'mobile-overlay';
    overlay.onclick = toggleMobileMenu;
    document.body.appendChild(overlay);
  }

  // Toggle overlay
  overlay.classList.toggle('active');

  // Prevent body scroll when menu is open
  if (navMenu.classList.contains('active')) {
    body.style.overflow = 'hidden';
  } else {
    body.style.overflow = '';
  }
}

function initMobileMenuListeners() {
  // Close mobile menu when clicking a link
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      const navMenu = document.querySelector('.nav-menu');
      if (navMenu && navMenu.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });

  // Close mobile menu on window resize
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      const navMenu = document.querySelector('.nav-menu');
      const overlay = document.getElementById('mobileOverlay');

      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }

      if (overlay) {
        overlay.classList.remove('active');
      }
    }
  });
}

// Load header when DOM is ready
document.addEventListener('DOMContentLoaded', loadHeader);
