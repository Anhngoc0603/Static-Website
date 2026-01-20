/**
 * Footer Component
 * Loads the footer dynamically and handles its functionality
 */

function loadFooter() {
    const footerHTML = `
    <div class="container">
      <div class="footer-content">
        <div class="footer-col">
          <h3 class="footer-title">SNEAKER STORE</h3>
          <p class="footer-text">Premium sneakers for the modern athlete and lifestyle enthusiast.</p>
          <div class="social-links">
            <a href="#" class="social-btn">F</a>
            <a href="#" class="social-btn">I</a>
            <a href="#" class="social-btn">T</a>
            <a href="#" class="social-btn">Y</a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Shop</h4>
          <ul class="footer-links">
            <li><a href="shop.html">New Arrivals</a></li>
            <li><a href="shop.html">Best Sellers</a></li>
            <li><a href="shop.html">Sale</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Support</h4>
          <ul class="footer-links">
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Returns</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Company</h4>
          <ul class="footer-links">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Press</a></li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 Sneaker Store. All rights reserved.</p>
      </div>
    </div>
  `;

    // Inject footer HTML
    const footerElement = document.getElementById('footer');
    if (footerElement) {
        footerElement.innerHTML = footerHTML;

        // Add footer class if not present (safeguard)
        if (!footerElement.classList.contains('footer')) {
            footerElement.classList.add('footer');
        }
    }
}

// Load footer when DOM is ready
document.addEventListener('DOMContentLoaded', loadFooter);
