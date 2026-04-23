"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ChevronLeft, Truck, Shield, Plus, Minus } from "lucide-react";
import ShippingForm from "@/componenets/ShippingForm";
import PaymentForm from "@/componenets/PaymentForm";
import Image from "next/image";
import ProductRating from "@/componenets/ProductRating";

const requiredFields = [
  "firstName",
  "email",
  "address",
  "city",
  "state",
  "pincode",
];

export default function ProductDetailsPage() {
  const params = useParams();
  const id = Number(params?.id);
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (id === "cardNumber") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{4})(?=\d)/g, "$1 ")
        .trim();
      if (formattedValue.length > 19)
        formattedValue = formattedValue.substr(0, 19);
    }
    // Format expiry date
    if (id === "expiry") {
      const digits = value.replace(/\D/g, "");
      if (digits.length >= 2) {
        formattedValue = digits.substring(0, 2) + "/" + digits.substring(2, 4);
      } else {
        formattedValue = digits;
      }
    }
    // Format CVV (numbers only)
    if (id === "cvv") {
      formattedValue = value.replace(/\D/g, "").substr(0, 4);
    }

    // Format pincode (numbers only, max 6 digits)
    if (id === "pincode") {
      formattedValue = value.replace(/\D/g, "").substr(0, 6);
    }

    setForm((prev) => ({ ...prev, [id]: formattedValue }));
    setTouched((prev) => ({ ...prev, [id]: true }));

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    requiredFields.forEach((field) => {
      if (!form[field].trim()) {
        newErrors[field] = "This field is required";
      }
    });

    // Email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Pincode validation (assuming Indian pincode format)
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    // Payment method specific validation
    if (paymentMethod === "credit-card") {
      if (!form.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
      } else if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(form.cardNumber)) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }

      if (!form.expiry.trim()) {
        newErrors.expiry = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) {
        newErrors.expiry = "Invalid expiry format (MM/YY)";
      } else {
        // Check if expiry date is not in the past
        const [month, year] = form.expiry.split("/");
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const currentDate = new Date();
        currentDate.setDate(1); // Set to first day to compare months
        if (expiryDate < currentDate) {
          newErrors.expiry = "Card has expired";
        }
      }

      if (!form.cvv.trim()) {
        newErrors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(form.cvv)) {
        newErrors.cvv = "CVV must be 3 or 4 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const product = cartItems.find((item) => item.id === id);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && product) {
      updateQuantity(product.id, newQuantity);
    }
  };

  const handleCompleteOrder = async () => {
    // Mark all fields as touched
    const allTouched = requiredFields.reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      {},
    );
    if (paymentMethod === "credit-card") {
      allTouched.cardNumber = true;
      allTouched.expiry = true;
      allTouched.cvv = true;
    }
    setTouched(allTouched);

    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    setIsProcessing(true);

    try {
      const itemTotal = product.price * product.quantity;
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
        status: "confirmed",
      };

      localStorage.setItem("lastOrder", JSON.stringify(orderData));

      // Send order confirmation email
      await fetch("/api/send-order-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          order: orderData,
        }),
      });

      // ✅ Remove the item from the cart
      removeFromCart(product.id);

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect
      router.push("/order-confirmation");
    } catch (error) {
      console.error("Order processing error:", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-12 mt-12 text-center border border-black/10 bg-accent/5">
        <h2 className="text-3xl font-serif mb-6 tracking-tighter">Item Not Found</h2>
        <p className="text-foreground/60 mb-10 max-w-md mx-auto italic font-light">
          The item you&apos;re looking for could not be found in your bag.
        </p>
        <Link
          href="/checkout"
          className="border border-black text-foreground hover:bg-black hover:text-white px-10 py-4 transition-colors uppercase tracking-[0.2em] text-xs font-bold inline-block"
        >
          Return to Bag
        </Link>
      </div>
    );
  }

  const itemTotal = product.price * product.quantity;
  const tax = itemTotal * 0.08;
  const shipping = 5.99;
  const total = itemTotal + shipping + tax;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-black mb-20 mt-8">
      <div className="mb-12">
        <Link
          href="/checkout"
          className="flex items-center text-xs uppercase tracking-[0.2em] font-medium text-foreground hover:opacity-70 transition-opacity w-fit"
        >
          <ChevronLeft size={16} />
          <span className="ml-2 border-b border-transparent hover:border-foreground transition-all">Back to bag</span>
        </Link>
      </div>

      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-xs uppercase tracking-[0.4em] opacity-60 mb-4 block">Final Step</span>
        <h1 className="text-4xl md:text-5xl font-serif tracking-tighter">Complete Order</h1>
        <div className="w-16 h-px bg-accent mt-8"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-accent/5 border border-black/10 p-8 sticky top-8">
            <div className="mb-8 border-b border-black/10 pb-8">
              <div className="mb-6">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={500}
                  className="w-full object-cover border border-black/5"
                />
              </div>

              <h3 className="font-serif italic text-xl mb-4 text-center">{product.name}</h3>

              <div className="mb-6 flex justify-center opacity-80">
                <ProductRating
                  productId={product.id}
                  initialRating={0}
                  initialCount={0}
                />
              </div>

              {/* Quantity Controls */}
              <div className="mb-8">
                <label className="block text-xs uppercase tracking-widest font-medium text-foreground mb-4 text-center">
                  Quantity
                </label>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => handleQuantityChange(product.quantity - 1)}
                    className="w-8 h-8 border border-black/30 flex items-center justify-center hover:bg-black/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={product.quantity <= 1}
                    aria-label="Decrease quantity"
                    title="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center font-serif text-lg">
                    {product.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(product.quantity + 1)}
                    className="w-8 h-8 border border-black/30 flex items-center justify-center hover:bg-black/5 transition-colors"
                    aria-label="Increase quantity"
                    title="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <h3 className="text-xs uppercase tracking-widest font-bold mb-3 text-center">Description</h3>
              <p className="text-sm font-light text-foreground/80 leading-relaxed text-center">
                {product.description ||
                  "A statement piece crafted for those who define elegance on their own terms."}
              </p>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 text-center">Order Summary</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">
                    Item Total ({product.quantity}x)
                  </span>
                  <span className="font-serif">₹{itemTotal.toFixed(2)}</span>
                </div>
                {product.quantity > 1 && (
                  <div className="flex justify-start text-xs text-foreground/40 italic -mt-2">
                    <span>₹{product.price.toFixed(2)} each</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-foreground/70">Shipping</span>
                  <span className="font-serif">₹{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Estimated Tax</span>
                  <span className="font-serif">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-black/10 pt-4 mt-6">
                  <div className="flex justify-between items-center bg-black text-white p-4">
                    <span className="uppercase tracking-[0.2em] text-xs font-bold">Total</span>
                    <span className="font-serif text-xl border-l border-white/20 pl-4">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12 order-1 lg:order-2">
          <div className="bg-transparent border border-black/10 p-8">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 pb-4 border-b border-black/10">Shipping Address</h2>
            <ShippingForm
              form={form}
              errors={errors}
              handleChange={handleChange}
            />
          </div>

          <div className="bg-transparent border border-black/10 p-8">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 pb-4 border-b border-black/10">Payment Details</h2>
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
              className="mt-12 w-full bg-[#800000] text-white py-5 hover:bg-black transition-colors duration-500 text-xs uppercase tracking-[0.2em] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing
                ? "Processing Order..."
                : `Pay ₹${total.toFixed(2)} — Complete Order`}
            </button>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:space-x-8 space-y-4 sm:space-y-0 text-xs uppercase tracking-widest text-foreground/50 border-t border-black/10 pt-6">
              <div className="flex items-center">
                <Shield size={16} className="mr-2 opacity-60" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center hidden sm:block w-px h-4 bg-black/20"></div>
              <div className="flex items-center">
                <Truck size={16} className="mr-2 opacity-60" />
                <span>Express Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
