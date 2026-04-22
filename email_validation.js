// Email availability check function
function checkEmailAvailability() {
    const emailInput = document.getElementById('register-email');
    const email = emailInput.value.trim();
    
    if (email === '') {
        // Clear any existing error
        clearEmailError();
        return;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showEmailError('Geçerli bir e-posta adresi girin.');
        return;
    }
    
    // Check if email already exists in localStorage
    const savedUsers = localStorage.getItem('yksUsers');
    if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            showEmailError('Bu e-posta adresi zaten kayitli!');
        } else {
            clearEmailError();
        }
    }
}

// Show email error message
function showEmailError(message) {
    clearEmailError(); // Clear any existing error first
    
    const emailInput = document.getElementById('register-email');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'email-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: var(--danger);
        font-size: 0.8rem;
        margin-top: 5px;
        display: block;
    `;
    
    emailInput.parentNode.insertBefore(errorDiv, emailInput.nextSibling);
    emailInput.style.borderColor = 'var(--danger)';
}

// Clear email error message
function clearEmailError() {
    const existingError = document.querySelector('.email-error');
    if (existingError) {
        existingError.remove();
    }
    
    const emailInput = document.getElementById('register-email');
    emailInput.style.borderColor = '';
}

// Password match validation function
function checkPasswordMatch() {
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (confirmPassword === '') {
        clearPasswordError();
        return;
    }
    
    if (password !== confirmPassword) {
        showPasswordError('Sifreler eslesmiyor!');
    } else {
        clearPasswordError();
    }
}

// Show password error message
function showPasswordError(message) {
    clearPasswordError(); // Clear any existing error first
    
    const confirmInput = document.getElementById('register-confirm-password');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'password-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: var(--danger);
        font-size: 0.8rem;
        margin-top: 5px;
        display: block;
    `;
    
    confirmInput.parentNode.insertBefore(errorDiv, confirmInput.nextSibling);
    confirmInput.style.borderColor = 'var(--danger)';
}

// Clear password error message
function clearPasswordError() {
    const existingError = document.querySelector('.password-error');
    if (existingError) {
        existingError.remove();
    }
    
    const confirmInput = document.getElementById('register-confirm-password');
    confirmInput.style.borderColor = '';
}
