'use client';
import React from 'react';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentFormProps {
  form: { [key: string]: string };
  errors?: { [key: string]: string };
  touched?: { [key: string]: boolean };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setTouched?: React.Dispatch<React.SetStateAction<Partial<Record<string, boolean>>>>;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  form,
  errors = {},
  touched = {},
  handleChange,
  setTouched,
  paymentMethod,
  setPaymentMethod
}) => {
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  const handleInputFocus = (fieldName: string) => {
    if (setTouched) {
      setTouched(prev => ({ ...prev, [fieldName]: true }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Credit Card */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              paymentMethod === 'credit-card'
                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePaymentMethodChange('credit-card')}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentMethod"
                value="credit-card"
                checked={paymentMethod === 'credit-card'}
                onChange={() => handlePaymentMethodChange('credit-card')}
                className="text-indigo-600"
              />
              <CreditCard size={20} className="text-gray-600" />
              <span className="font-medium">Credit Card</span>
            </div>
          </div>

          {/* PayPal */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              paymentMethod === 'paypal'
                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePaymentMethodChange('paypal')}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={() => handlePaymentMethodChange('paypal')}
                className="text-indigo-600"
              />
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="font-medium">PayPal</span>
            </div>
          </div>

          {/* Stripe */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              paymentMethod === 'stripe'
                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePaymentMethodChange('stripe')}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={() => handlePaymentMethodChange('stripe')}
                className="text-indigo-600"
              />
              <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="font-medium">Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Card Form */}
      {paymentMethod === 'credit-card' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Lock size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Your payment information is secure and encrypted</span>
          </div>

          {/* Card Number */}
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              value={form.cardNumber || ''}
              onChange={handleChange}
              onFocus={() => handleInputFocus('cardNumber')}
              placeholder="1234 5678 9012 3456"
              title="Card Number"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.cardNumber && touched.cardNumber
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
            />
            {errors.cardNumber && touched.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Expiry Date */}
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiry"
                value={form.expiry || ''}
                onChange={handleChange}
                onFocus={() => handleInputFocus('expiry')}
                placeholder="MM/YY"
                title="Expiry Date"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.expiry && touched.expiry
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.expiry && touched.expiry && (
                <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
              )}
            </div>

            {/* CVV */}
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                value={form.cvv || ''}
                onChange={handleChange}
                onFocus={() => handleInputFocus('cvv')}
                placeholder="123"
                title="CVV"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.cvv && touched.cvv
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.cvv && touched.cvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PayPal Message */}
      {paymentMethod === 'paypal' && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-sm text-blue-800">
              You will be redirected to PayPal to complete your payment securely.
            </span>
          </div>
        </div>
      )}

      {/* Stripe Message */}
      {paymentMethod === 'stripe' && (
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm text-purple-800">
              You will be redirected to Stripe Checkout to complete your payment securely.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;