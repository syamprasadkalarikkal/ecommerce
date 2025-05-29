'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';
import Link from 'next/link';
import { ChevronLeft, Truck, Shield } from 'lucide-react';
import ShippingForm from '@/componenets/ShippingForm';
import PaymentForm from '@/componenets/PaymentForm';
import Image from 'next/image';
import { stripePromise } from '@/lib/stripe';

type FormField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'address'
  | 'city'
  | 'state'
  | 'pincode'
  | 'cardNumber'
  | 'expiry'
  | 'cvv';

const requiredFields: FormField[] = [
  'firstName',
  'email',
  'address',
  'city',
  'state',
  'pincode'
];

export default function AllProductsPaymentPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState<Record<FormField, string>>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({});

  const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  const shippingFee = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingFee + tax;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">There are no items to checkout.</p>
        <Link href="/products" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (id === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
    }
    
    // Format expiry date
    if (id === 'expiry') {
      const digits = value.replace(/\D/g, '');
      if (digits.length >= 2) {
        formattedValue = digits.substring(0, 2) + '/' + digits.substring(2, 4);
      } else {
        formattedValue = digits;
      }
    }
    
    // Format CVV (numbers only)
    if (id === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substr(0, 4);
    }

    // Format pincode (numbers only, max 6 digits)
    if (id === 'pincode') {
      formattedValue = value.replace(/\D/g, '').substr(0, 6);
    }

    setForm(prev => ({ ...prev, [id]: formattedValue }));
    setTouched(prev => ({ ...prev, [id]: true }));

    // Clear error when user starts typing
    if (errors[id as FormField]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<FormField, string>> = {};

    // Validate required fields
    requiredFields.forEach((field) => {
      if (!form[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Pincode validation (assuming Indian pincode format)
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    // Payment method specific validation
    if (paymentMethod === 'credit-card') {
      if (!form.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(form.cardNumber)) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }

      if (!form.expiry.trim()) {
        newErrors.expiry = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) {
        newErrors.expiry = 'Invalid expiry format (MM/YY)';
      } else {
        // Check if expiry date is not in the past
        const [month, year] = form.expiry.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const currentDate = new Date();
        currentDate.setDate(1); // Set to first day to compare months
        if (expiryDate < currentDate) {
          newErrors.expiry = 'Card has expired';
        }
      }

      if (!form.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(form.cvv)) {
        newErrors.cvv = 'CVV must be 3 or 4 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteOrder = async () => {
    // Mark all fields as touched for validation display
    const allTouched = requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {} as Partial<Record<FormField, boolean>>);
    if (paymentMethod === 'credit-card') {
      allTouched.cardNumber = true;
      allTouched.expiry = true;
      allTouched.cvv = true;
    }
    setTouched(allTouched);

    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }
    
    setIsProcessing(true);

    try {
      if (paymentMethod === 'stripe') {
        // Stripe checkout flow
        const stripe = await stripePromise;
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cartItems,
            customerInfo: {
              firstName: form.firstName,
              lastName: form.lastName,
              email: form.email,
              address: form.address,
              city: form.city,
              state: form.state,
              pincode: form.pincode
            }
          }),
        });

        const data = await res.json();
        if (data.sessionId && stripe) {
          await stripe.redirectToCheckout({ sessionId: data.sessionId });
        }
      } else {
        // Handle both credit-card and paypal the same way (mock payment)
        const orderData = {
          id: `ORDER-${Date.now()}`,
          items: cartItems,
          customerInfo: form,
          paymentMethod,
          subtotal,
          shippingFee,
          tax,
          total,
          orderDate: new Date().toISOString(),
          status: 'confirmed'
        };

        // Store order data in localStorage for the confirmation page
        localStorage.setItem('lastOrder', JSON.stringify(orderData));

        // Send order confirmation email
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: form.email,
            order: orderData
          })
        });

        
        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Clear cart after successful order
        clearCart();
        
        // Redirect to order confirmation
        router.push('/order-confirmation');
      }
    } catch (error) {
      console.error('Order processing error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-black">
      <div className="mb-6">
        <Link href="/checkout" className="flex items-center text-indigo-600 hover:text-indigo-800">
          <ChevronLeft size={20} />
          <span>Back to checkout</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Complete Your Purchase</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h2>
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="py-3">
                  <div className="flex space-x-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded"
                    />

                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <div className="mt-1">
                        <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                        <p className="text-gray-600 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        {item.quantity > 1 && (
                          <p className="text-gray-500 text-xs">${item.price.toFixed(2)} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span>${shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <ShippingForm form={form} errors={errors} handleChange={handleChange} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <PaymentForm
              form={form}
              errors={errors}
              handleChange={handleChange}
              touched={touched}
              setTouched={setTouched}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />

            <button
              onClick={handleCompleteOrder}
              disabled={isProcessing}
              className="mt-6 w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)} and Complete Order`}
            </button>
            <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield size={16} className="mr-1" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center">
                <Truck size={16} className="mr-1" />
                <span>Fast Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}