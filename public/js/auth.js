document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.querySelector('.login-form');
    if (!signupForm) return;

    const isSignupForm = signupForm.action.includes('signup');

    let errorContainer = document.querySelector('.error-message');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.style.display = 'none';
        signupForm.parentNode.insertBefore(errorContainer, signupForm);
    }

    if (isSignupForm) {
        validateSignupForm(signupForm, errorContainer);
    } else {
        validateLoginForm(signupForm, errorContainer);
    }
});

function isLetter(c) {
    return (
        (c.charCodeAt(0) >= 65 && c.charCodeAt(0) <= 90) ||
        (c.charCodeAt(0) >= 97 && c.charCodeAt(0) <= 122)
    );
}

function isAccented(c) {
    return c.charCodeAt(0) >= 128 && c.charCodeAt(0) <= 165;
}

function validateEmail(email, errors) {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
        errors.push('Please enter a valid email address');
    }
}

function validateName(name, fieldName, errors) {
    const trimmed = name.trim();
    
    if (trimmed.length < 2) {
        errors.push(`${fieldName} must be at least 2 characters`);
        return;
    }
    
    if (trimmed.length > 50) {
        errors.push(`${fieldName} cannot exceed 50 characters`);
        return;
    }
    
    for (let c of trimmed) {
        if (
            !(
                isLetter(c) ||
                isAccented(c) ||
                c === "'" ||
                c === "-" ||
                c.charCodeAt(0) === 32 ||
                c === "."
            )
        ) {
            errors.push(`${fieldName} contains invalid characters`);
            return;
        }
    }
    
    if (!(isLetter(trimmed[0]) || isAccented(trimmed[0]))) {
        errors.push(`${fieldName} must start with a letter`);
    }
}

function validateSignupForm(form, errorContainer) {
    const passwordInput = document.querySelector('input[name="password"]');
    const firstNameInput = document.querySelector('input[name="firstName"]');
    const lastNameInput = document.querySelector('input[name="lastName"]');
    const emailInput = document.querySelector('input[name="email"]');
    const ageCheckbox = document.querySelector('input[name="isOfAge"]');

    form.addEventListener('submit', (e) => {
        const errors = [];

        if (firstNameInput) {
            validateName(firstNameInput.value, 'First name', errors);
        }

        if (lastNameInput) {
            validateName(lastNameInput.value, 'Last name', errors);
        }

        if (emailInput) {
            validateEmail(emailInput.value, errors);
        } else {
            errors.push('Email is required');
        }

        if (passwordInput) {
            const password = passwordInput.value;
            if (password.length < 8) {
                errors.push('Password must be at least 8 characters');
            }
            if (!/[A-Z]/.test(password)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            if (!/[0-9]/.test(password)) {
                errors.push('Password must contain at least one number');
            }
        } else {
            errors.push('Password is required');
        }

        if (ageCheckbox && !ageCheckbox.checked) {
            errors.push('You must confirm you are at least 18 years old');
        }

        if (errors.length > 0) {
            e.preventDefault();
            let errorHTML = '<ul style="margin: 5px 0; padding-left: 20px;">';
            for (let i = 0; i < errors.length; i++) {
                errorHTML += `<li>${errors[i]}</li>`;
            }
            errorHTML += '</ul>';
            errorContainer.innerHTML = errorHTML;
            errorContainer.style.display = 'block';
        } else {
            errorContainer.style.display = 'none';
        }
    });
}

function validateLoginForm(form, errorContainer) {
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');

    form.addEventListener('submit', (e) => {
        const errors = [];

        if (emailInput) {
            validateEmail(emailInput.value, errors);
        } else {
            errors.push('Email is required');
        }

        if (passwordInput && passwordInput.value.length === 0) {
            errors.push('Password is required');
        } else if (!passwordInput) {
            errors.push('Password is required');
        }

        if (errors.length > 0) {
            e.preventDefault();
            let errorHTML = '<ul style="margin: 5px 0; padding-left: 20px;">';
            for (let i = 0; i < errors.length; i++) {
                errorHTML += `<li>${errors[i]}</li>`;
            }
            errorHTML += '</ul>';
            errorContainer.innerHTML = errorHTML;
            errorContainer.style.display = 'block';
        } else {
            errorContainer.style.display = 'none';
        }
    });
}

