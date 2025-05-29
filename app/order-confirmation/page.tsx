'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Package, Truck, Calendar, CreditCard, MapPin, Mail } from 'lucide-react';

interface OrderData {
  id: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  orderDate: string;
  status: string;
}

export default function OrderConfirmationPage() {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get order data from localStorage
    const storedOrder = localStorage.getItem('lastOrder');
    if (storedOrder && storedOrder.trim() !== '') {
      try {
        const parsedOrder = JSON.parse(storedOrder);
        setOrderData(parsedOrder);
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your order confirmation...</p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Order Not Found</h2>
        <p className="text-gray-600 mb-6">We couldn&apos;t find your order information.</p>
        <Link 
          href="/products" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 inline-block transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'credit-card':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'stripe':
        return 'Stripe';
      default:
        return method;
    }
  };

  const totalItems = orderData.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-black">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-lg text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-green-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Order #{orderData.id}</h2>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                Placed on {formatDate(orderData.orderDate)}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Items Ordered ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </h3>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">${orderData.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${orderData.tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${orderData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Method
                </h4>
                <p className="text-gray-600">{getPaymentMethodDisplay(orderData.paymentMethod)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Shipping Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Delivery Address
            </h4>
            <div className="text-gray-600 space-y-1">
              <p>{orderData.customerInfo.firstName} {orderData.customerInfo.lastName}</p>
              <p>{orderData.customerInfo.address}</p>
              <p>{orderData.customerInfo.city}, {orderData.customerInfo.state} {orderData.customerInfo.pincode}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Contact Information
            </h4>
            <div className="text-gray-600">
              <p>{orderData.customerInfo.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">What&apos;s Next?</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>You&apos;ll receive an email confirmation shortly with your order details.</span>
          </li>
          <li className="flex items-start">
            <Package className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>Your order will be processed and prepared for shipping within 1-2 business days.</span>
          </li>
          <li className="flex items-start">
            <Truck className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>You&apos;ll receive tracking information once your order ships.</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/products"
          className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 text-center font-medium transition-colors"
        >
          Continue Shopping
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-gray-600 text-white px-8 py-3 rounded-md hover:bg-gray-700 font-medium transition-colors"
        >
          Print Order
        </button>
      </div>
    </div>
  );
}