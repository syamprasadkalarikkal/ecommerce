'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { ChevronLeft, Truck, Shield, Plus, Minus } from 'lucide-react';
import ShippingForm from '@/componenets/ShippingForm';
import PaymentForm from '@/componenets/PaymentForm';
import Image from 'next/image';
import ProductRating from '@/componenets/ProductRating';

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

export default function ProductDetailsPage() {
  const params = useParams();
  const id = Number(params?.id);
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
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

  const product = cartItems.find((item) => item.id === id);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && product) {
      updateQuantity(product.id, newQuantity);
    }
  };

 const handleCompleteOrder = async () => {
  // Mark all fields as touched
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
    const itemTotal = product!.price * product!.quantity;
    const tax = itemTotal * 0.08;
    const shipping = 5.99;
    const total = itemTotal + shipping + tax;

    const orderData = {
      id: `ORDER-${Date.now()}`,
      items: [product],
      customerInfo: form,
      paymentMethod,
      subtotal: itemTotal,
      shippingFee: shipping,
      tax,
      total,
      orderDate: new Date().toISOString(),
      status: 'confirmed'
    };

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


    // ✅ Remove the item from the cart
    removeFromCart(product!.id);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Redirect
    router.push('/order-confirmation');
  } catch (error) {
    console.error('Order processing error:', error);
    alert('There was an error processing your order. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};


  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <p className="text-gray-500 mb-6">The product you&apos;re looking for could not be found in your cart.</p>
        <Link href="/checkout" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-block">
          Back to checkout
        </Link>
      </div>
    );
  }

  const itemTotal = product.price * product.quantity;
  const tax = itemTotal * 0.08;
  const shipping = 5.99;
  const total = itemTotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 text-black">
      <div className="mb-6">
        <Link href="/checkout" className="flex items-center text-indigo-600 hover:text-indigo-800">
          <ChevronLeft size={20} />
          <span className="ml-1">Back to checkout</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Product Details & Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <div className="mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="h-48 w-full object-contain"
                />
              </div>
              
              <h3 className="font-bold text-lg mb-2">{product.name}</h3>
              
              <div className="mb-3">
                <ProductRating 
                  productId={product.id} 
                  initialRating={product.rating?.rate || 0}
                  initialCount={product.rating?.count || 0}
                />
              </div>
              
              {/* Quantity Controls */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(product.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={product.quantity <= 1}
                    aria-label="Decrease quantity"
                    title="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-medium">{product.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(product.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    aria-label="Increase quantity"
                    title="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="font-semibold text-md mb-1">Description</h3>
              <p className="text-sm text-gray-700">
                {product.description || 'This premium product offers excellent quality and value.'}
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold text-md mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product price ({product.quantity}x)</span>
                  <span>${itemTotal.toFixed(2)}</span>
                </div>
                {product.quantity > 1 && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>${product.price.toFixed(2)} each</span>
                    
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
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
              {isProcessing ? 'Processing Order...' : `Pay $${total.toFixed(2)} and Complete Order`}
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