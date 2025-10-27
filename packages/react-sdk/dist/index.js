"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  BitBNPLButton: () => BitBNPLButton,
  BitBNPLProvider: () => BitBNPLProvider,
  default: () => index_default,
  useMerchantVerification: () => useMerchantVerification
});
module.exports = __toCommonJS(index_exports);
var import_react = __toESM(require("react"));
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
  const [isLoading, setIsLoading] = (0, import_react.useState)(false);
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
  return /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: handleClick,
      disabled: disabled || isLoading,
      style: defaultStyles,
      className,
      "aria-label": `Pay ${numericAmount} MUSD with BitBNPL`
    },
    !isLoading && /* @__PURE__ */ import_react.default.createElement("span", { style: { marginRight: "8px", fontSize: "18px" } }, "\u{1F7E0}"),
    isLoading ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("span", { style: {
      width: "14px",
      height: "14px",
      marginRight: "8px",
      border: "2px solid white",
      borderTopColor: "transparent",
      borderRadius: "50%",
      display: "inline-block",
      animation: "spin 0.6s linear infinite"
    } }), "Redirecting...") : children || "Pay with BitBNPL",
    /* @__PURE__ */ import_react.default.createElement("style", null, `
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
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, children);
}
var index_default = BitBNPLButton;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BitBNPLButton,
  BitBNPLProvider,
  useMerchantVerification
});
