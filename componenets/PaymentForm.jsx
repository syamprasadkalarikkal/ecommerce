"use client";
import React from "react";
import { CreditCard, Lock } from "lucide-react";

const PaymentForm = ({
  form,
  errors = {},
  touched = {},
  handleChange,
  setTouched,
  paymentMethod,
  setPaymentMethod,
}) => {
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleInputFocus = (fieldName) => {
    if (setTouched) {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Payment Method Selection */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Credit Card */}
          <div
            className={`border p-6 cursor-pointer transition-all duration-300 ${paymentMethod === "credit-card"
                ? "border-black bg-black/5"
                : "border-black/20 hover:border-black/50"
              }`}
            onClick={() => handlePaymentMethodChange("credit-card")}
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <CreditCard size={24} className="text-foreground" />
              <span className="text-xs uppercase tracking-widest font-bold">Credit Card</span>
            </div>
          </div>

          {/* PayPal */}
          <div
            className={`border p-6 cursor-pointer transition-all duration-300 ${paymentMethod === "paypal"
                ? "border-black bg-black/5"
                : "border-black/20 hover:border-black/50"
              }`}
            onClick={() => handlePaymentMethodChange("paypal")}
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <span className="text-xl font-serif italic text-blue-900 border border-blue-900 rounded-full w-8 h-8 flex items-center justify-center">P</span>
              <span className="text-xs uppercase tracking-widest font-bold">PayPal</span>
            </div>
          </div>

          {/* Stripe */}
          <div
            className={`border p-6 cursor-pointer transition-all duration-300 ${paymentMethod === "stripe"
                ? "border-black bg-black/5"
                : "border-black/20 hover:border-black/50"
              }`}
            onClick={() => handlePaymentMethodChange("stripe")}
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <span className="text-xl font-serif italic text-purple-900 border border-purple-900 rounded-full w-8 h-8 flex items-center justify-center">S</span>
              <span className="text-xs uppercase tracking-widest font-bold">Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Card Form */}
      {paymentMethod === "credit-card" && (
        <div className="space-y-8 p-6 bg-accent/5 border border-black/10 mt-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-black/10">
            <Lock size={16} className="text-foreground/60" />
            <span className="text-xs uppercase tracking-widest text-foreground/60">
              Your payment information is secure
            </span>
          </div>

          {/* Card Number */}
          <div className="relative">
            <label
              htmlFor="cardNumber"
              className="block text-xs uppercase tracking-[0.2em] font-medium text-foreground mb-2"
            >
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              value={form.cardNumber || ""}
              onChange={handleChange}
              onFocus={() => handleInputFocus("cardNumber")}
              placeholder="1234 5678 9012 3456"
              title="Card Number"
              className={`w-full bg-transparent border-0 border-b border-black/30 focus:border-black focus:ring-0 rounded-none px-0 py-2 transition-colors ${errors.cardNumber && touched.cardNumber
                  ? "border-red-500"
                  : ""
                }`}
            />

            {errors.cardNumber && touched.cardNumber && (
              <p className="mt-1 text-xs text-red-600 absolute -bottom-5">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 mt-8">
            {/* Expiry Date */}
            <div className="relative">
              <label
                htmlFor="expiry"
                className="block text-xs uppercase tracking-[0.2em] font-medium text-foreground mb-2"
              >
                Expiry Date
              </label>
              <input
                type="text"
                id="expiry"
                value={form.expiry || ""}
                onChange={handleChange}
                onFocus={() => handleInputFocus("expiry")}
                placeholder="MM/YY"
                title="Expiry Date"
                className={`w-full bg-transparent border-0 border-b border-black/30 focus:border-black focus:ring-0 rounded-none px-0 py-2 transition-colors ${errors.expiry && touched.expiry
                    ? "border-red-500"
                    : ""
                  }`}
              />

              {errors.expiry && touched.expiry && (
                <p className="mt-1 text-xs text-red-600 absolute -bottom-5">{errors.expiry}</p>
              )}
            </div>

            {/* CVV */}
            <div className="relative">
              <label
                htmlFor="cvv"
                className="block text-xs uppercase tracking-[0.2em] font-medium text-foreground mb-2"
              >
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                value={form.cvv || ""}
                onChange={handleChange}
                onFocus={() => handleInputFocus("cvv")}
                placeholder="123"
                title="CVV"
                className={`w-full bg-transparent border-0 border-b border-black/30 focus:border-black focus:ring-0 rounded-none px-0 py-2 transition-colors ${errors.cvv && touched.cvv
                    ? "border-red-500"
                    : ""
                  }`}
              />

              {errors.cvv && touched.cvv && (
                <p className="mt-1 text-xs text-red-600 absolute -bottom-5">{errors.cvv}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PayPal Message */}
      {paymentMethod === "paypal" && (
        <div className="p-6 bg-accent border border-blue-900/10 mt-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-blue-900 text-blue-900 font-serif italic text-lg">
              P
            </div>
            <span className="text-sm font-light text-foreground">
              You will be redirected to PayPal to complete your payment securely.
            </span>
          </div>
        </div>
      )}

      {/* Stripe Message */}
      {paymentMethod === "stripe" && (
        <div className="p-6 bg-accent border border-purple-900/10 mt-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-purple-900 text-purple-900 font-serif italic text-lg">
              S
            </div>
            <span className="text-sm font-light text-foreground">
              You will be redirected to Stripe Checkout to complete your payment securely.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
