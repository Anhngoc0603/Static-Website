// ==================== MOBILE MENU ====================

// Toggle mobile menu
function toggleMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const body = document.body;
  
  if (!navMenu) return;

  // Toggle menu
  navMenu.classList.toggle('active');
  
  // Change icon
  if (mobileToggle) {
    const isActive = navMenu.classList.contains('active');
    mobileToggle.innerHTML = isActive 
      ? '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
      : '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>';
  }

  // Create/toggle overlay
  let overlay = document.getElementById('mobileOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobileOverlay';
    overlay.className = 'mobile-overlay';
    overlay.onclick = toggleMobileMenu;
    document.body.appendChild(overlay);
  }
  overlay.classList.toggle('active');

  // Lock/unlock body scroll
  body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

// Close menu when clicking links
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function() {
      const navMenu = document.querySelector('.nav-menu');
      if (navMenu && navMenu.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });
});

// Close menu on resize to desktop
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.getElementById('mobileOverlay');
    
    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (overlay) overlay.classList.remove('active');
  }
});