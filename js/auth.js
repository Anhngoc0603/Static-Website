// ==================== AUTHENTICATION ====================

// Get current user
function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Set current user
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Logout
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// Check if user is logged in
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Get all users
function getAllUsers() {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

// Save users
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// Validate email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password
function validatePassword(password) {
  return password.length >= 6;
}

// Check password strength
function checkPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 1) return 'weak';
  if (strength <= 3) return 'medium';
  return 'strong';
}

// Register user
function registerUser(fullName, email, password) {
  // Validate inputs
  if (!fullName || fullName.trim() === '') {
    showErrorToast('Please enter your full name');
    return false;
  }

  if (!validateEmail(email)) {
    showErrorToast('Please enter a valid email address');
    return false;
  }

  if (!validatePassword(password)) {
    showErrorToast('Password must be at least 6 characters long');
    return false;
  }

  // Check if user already exists
  const users = getAllUsers();
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (existingUser) {
    showErrorToast('An account with this email already exists');
    return false;
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password: password, // In production, hash this!
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // Auto login
  const userWithoutPassword = { ...newUser };
  delete userWithoutPassword.password;
  setCurrentUser(userWithoutPassword);

  showSuccessToast('Account created successfully!');
  
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);

  return true;
}

// Login user
function loginUser(email, password) {
  // Validate inputs
  if (!validateEmail(email)) {
    showErrorToast('Please enter a valid email address');
    return false;
  }

  if (!password) {
    showErrorToast('Please enter your password');
    return false;
  }

  // Check credentials
  const users = getAllUsers();
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.password === password
  );

  if (!user) {
    showErrorToast('Invalid email or password');
    return false;
  }

  // Set current user
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;
  setCurrentUser(userWithoutPassword);

  showSuccessToast('Logged in successfully!');
  
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);

  return true;
}

// Update user profile icon
function updateUserProfile() {
  const user = getCurrentUser();
  const userIcon = document.querySelector('.nav-icons .icon-btn:nth-child(3)');
  
  if (user && userIcon) {
    userIcon.innerHTML = `
      <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #ef4444); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.875rem;">
        ${user.fullName.charAt(0).toUpperCase()}
      </div>
    `;
    
    userIcon.onclick = function() {
      if (confirm('Do you want to logout?')) {
        logout();
      }
    };
  }
}

// ==================== LOGIN PAGE ====================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    loginUser(email, password);
  });
}

// ==================== REGISTER PAGE ====================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    registerUser(fullName, email, password);
  });

  // Password strength indicator
  const passwordInput = document.getElementById('registerPassword');
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      const strength = checkPasswordStrength(this.value);
      
      // You can add visual feedback here
      console.log('Password strength:', strength);
    });
  }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', function() {
  // Update user profile icon if logged in
  updateUserProfile();

  // Redirect if already logged in
  if (isLoggedIn()) {
    const currentPath = window.location.pathname;
    if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
      // window.location.href = 'index.html';
      // Uncomment above line if you want auto-redirect
    }
  }
});