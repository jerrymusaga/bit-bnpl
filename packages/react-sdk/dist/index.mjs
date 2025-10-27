// src/index.tsx
import React, { useState } from "react";
function BitBNPLButton({
  merchantAddress,
  amount,
  itemName,
  itemId,
  itemImage = "\u{1F6CD}\uFE0F",
  merchantName,
  children,
  style,
  className,
  baseUrl = "https://bitbnpl.com",
  onRedirect,
  onError,
  disabled = false
}) {
  const [isLoading, setIsLoading] = useState(false);
  if (!merchantAddress || !merchantAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.error("[BitBNPL] Invalid merchant address:", merchantAddress);
  }
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount) || numericAmount <= 0) {
    console.error("[BitBNPL] Invalid amount:", amount);
  }
  const handleClick = async (e) => {
    e.preventDefault();
    if (!merchantAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      const error = new Error("Invalid merchant address format");
      console.error("[BitBNPL]", error);
      onError?.(error);
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      const error = new Error("Invalid amount");
      console.error("[BitBNPL]", error);
      onError?.(error);
      return;
    }
    try {
      setIsLoading(true);
      const checkoutData = {
        merchant: merchantAddress,
        amount: numericAmount.toString(),
        itemName,
        itemId: itemId || `item_${Date.now()}`,
        itemImage,
        merchantName,
        timestamp: Date.now()
      };
      sessionStorage.setItem("bitbnpl_checkout_data", JSON.stringify(checkoutData));
      onRedirect?.();
      window.location.href = `${baseUrl}/checkout`;
    } catch (error) {
      console.error("[BitBNPL] Checkout error:", error);
      setIsLoading(false);
      onError?.(error);
    }
  };
  const defaultStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: 600,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "16px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(249, 115, 22, 0.3)",
    opacity: disabled ? 0.6 : 1,
    ...style
  };
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleClick,
      disabled: disabled || isLoading,
      style: defaultStyles,
      className,
      "aria-label": `Pay ${numericAmount} MUSD with BitBNPL`
    },
    !isLoading && /* @__PURE__ */ React.createElement("span", { style: { marginRight: "8px", fontSize: "18px" } }, "\u{1F7E0}"),
    isLoading ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: {
      width: "14px",
      height: "14px",
      marginRight: "8px",
      border: "2px solid white",
      borderTopColor: "transparent",
      borderRadius: "50%",
      display: "inline-block",
      animation: "spin 0.6s linear infinite"
    } }), "Redirecting...") : children || "Pay with BitBNPL",
    /* @__PURE__ */ React.createElement("style", null, `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `)
  );
}
function useMerchantVerification(merchantAddress) {
  return {
    isVerified: true,
    // Placeholder
    isLoading: false,
    error: null
  };
}
function BitBNPLProvider({ children }) {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, children);
}
var index_default = BitBNPLButton;
export {
  BitBNPLButton,
  BitBNPLProvider,
  index_default as default,
  useMerchantVerification
};
