/**
 * BitBNPL Payment Widget
 *
 * Allows merchants to easily integrate BitBNPL payment buttons on their website
 *
 * Usage:
 * <script src="https://bitbnpl.com/widget.js" data-merchant="0xYourMerchantAddress"></script>
 *
 * <button
 *   class="bitbnpl-button"
 *   data-amount="299.99"
 *   data-item-name="Product Name"
 *   data-item-id="prod_123"
 *   data-item-image="🛍️">
 *   Pay with BitBNPL
 * </button>
 */

(function() {
  'use strict';

  // Configuration
  const BITBNPL_BASE_URL = window.location.origin; // Use current origin for now (production will be https://bitbnpl.com)
  const MERCHANT_REGISTRY_ADDRESS = '0xB2Dbc7689F4C1E7310693bD19cbd33c6548B9a73';
  const RPC_URL = 'https://testnet.mezo.org';

  // Get merchant address from script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-merchant]');
  const merchantAddress = scriptTag?.getAttribute('data-merchant');

  if (!merchantAddress) {
    console.error('[BitBNPL Widget] Error: data-merchant attribute is required on script tag');
    return;
  }

  // Validate merchant address format
  if (!merchantAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.error('[BitBNPL Widget] Error: Invalid merchant address format');
    return;
  }

  console.log('[BitBNPL Widget] Initialized for merchant:', merchantAddress);

  // Merchant Registry ABI (minimal - only what we need)
  const MERCHANT_REGISTRY_ABI = [
    {
      "name": "getMerchant",
      "type": "function",
      "stateMutability": "view",
      "inputs": [{"name": "walletAddress", "type": "address"}],
      "outputs": [
        {"name": "businessName", "type": "string"},
        {"name": "storeUrl", "type": "string"},
        {"name": "category", "type": "string"},
        {"name": "logoText", "type": "string"},
        {"name": "logoColor", "type": "string"},
        {"name": "isActive", "type": "bool"},
        {"name": "isVerified", "type": "bool"},
        {"name": "totalSales", "type": "uint256"},
        {"name": "totalVolume", "type": "uint256"},
        {"name": "registeredAt", "type": "uint256"},
        {"name": "lastTransactionAt", "type": "uint256"}
      ]
    }
  ];

  // Verify merchant is registered and verified
  async function verifyMerchant() {
    // Skip on-chain verification in the widget
    // The checkout page will handle merchant verification
    // This allows for faster button clicks and better UX
    console.log('[BitBNPL Widget] Merchant verification will be done at checkout');
    return { isRegistered: true, isVerified: true };
  }

  // Simple ABI encoder for function calls
  function encodeFunctionCall(functionName, params) {
    // This is a simplified version - in production use ethers.js or viem
    const functionSignature = 'getMerchant(address)';
    const hash = keccak256(functionSignature).slice(0, 10); // First 4 bytes

    // Encode address parameter
    const addressParam = params[0].toLowerCase().replace('0x', '').padStart(64, '0');

    return hash + addressParam;
  }

  // Simplified keccak256 (for demo - use crypto library in production)
  function keccak256(str) {
    // This is just a placeholder - in production, use a proper keccak256 implementation
    // For now, we'll use the known function selector for getMerchant
    return '0x88bc14cd'; // Known selector for getMerchant(address)
  }

  // Inject CSS styles
  function injectStyles() {
    const styleId = 'bitbnpl-widget-styles';

    // Check if styles already injected
    if (document.getElementById(styleId)) return;

    const styles = `
      .bitbnpl-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 24px;
        background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 16px;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
      }

      .bitbnpl-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
        background: linear-gradient(135deg, #EA580C 0%, #F97316 100%);
      }

      .bitbnpl-button:active {
        transform: translateY(0);
      }

      .bitbnpl-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .bitbnpl-button::before {
        content: '🟠';
        margin-right: 8px;
        font-size: 18px;
      }

      .bitbnpl-button-loading::after {
        content: '';
        width: 14px;
        height: 14px;
        margin-left: 8px;
        border: 2px solid white;
        border-top-color: transparent;
        border-radius: 50%;
        display: inline-block;
        animation: bitbnpl-spin 0.6s linear infinite;
      }

      @keyframes bitbnpl-spin {
        to { transform: rotate(360deg); }
      }

      .bitbnpl-error {
        color: #EF4444;
        font-size: 14px;
        margin-top: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Initialize button click handlers
  function initializeButtons() {
    const buttons = document.querySelectorAll('.bitbnpl-button');

    buttons.forEach(button => {
      // Skip if already initialized
      if (button.dataset.bitbnplInit) return;

      button.dataset.bitbnplInit = 'true';
      button.addEventListener('click', handleButtonClick);
    });

    console.log(`[BitBNPL Widget] Initialized ${buttons.length} button(s)`);
  }

  // Handle button click
  async function handleButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    const amount = button.dataset.amount;
    const itemName = button.dataset.itemName || button.dataset.itemname || 'Product';
    const itemId = button.dataset.itemId || button.dataset.itemid || `item_${Date.now()}`;
    const itemImage = button.dataset.itemImage || button.dataset.itemimage || '🛍️';

    console.log('[BitBNPL Widget] Button clicked', { amount, itemName, merchantAddress });

    // Validate required data
    if (!amount || isNaN(parseFloat(amount))) {
      showError(button, 'Invalid amount. Please set data-amount attribute.');
      return;
    }

    // Show loading state
    button.disabled = true;
    button.classList.add('bitbnpl-button-loading');
    const originalText = button.textContent;
    button.textContent = 'Redirecting...';

    try {
      // Store checkout data in sessionStorage to survive page reload
      const checkoutData = {
        merchant: merchantAddress,
        amount: amount,
        itemName: itemName,
        itemId: itemId,
        itemImage: itemImage,
        timestamp: Date.now()
      };
      sessionStorage.setItem('bitbnpl_checkout_data', JSON.stringify(checkoutData));

      // Build checkout URL without query params (data will be read from sessionStorage)
      const checkoutUrl = `${BITBNPL_BASE_URL}/checkout`;
      console.log('[BitBNPL Widget] Redirecting to:', checkoutUrl);

      // Small delay to ensure loading state is visible
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 100);

    } catch (error) {
      console.error('[BitBNPL Widget] Error:', error);
      showError(button, error.message);

      // Restore button state
      button.disabled = false;
      button.classList.remove('bitbnpl-button-loading');
      button.textContent = originalText;
    }
  }

  // Show error message
  function showError(button, message) {
    // Remove existing error
    const existingError = button.parentElement?.querySelector('.bitbnpl-error');
    if (existingError) {
      existingError.remove();
    }

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bitbnpl-error';
    errorDiv.textContent = `⚠️ ${message}`;

    button.parentElement?.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
  }

  // Initialize widget
  function init() {
    console.log('[BitBNPL Widget] Loading...');

    // Inject styles
    injectStyles();

    // Initialize buttons when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeButtons);
    } else {
      initializeButtons();
    }

    // Watch for dynamically added buttons
    const observer = new MutationObserver(() => {
      initializeButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('[BitBNPL Widget] Ready!');
  }

  // Start initialization
  init();

})();
