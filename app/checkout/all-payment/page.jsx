"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ChevronLeft, Truck, Shield, Plus, CheckCircle2 } from "lucide-react";
import ShippingForm from "@/componenets/ShippingForm";
import PaymentForm from "@/componenets/PaymentForm";
import Image from "next/image";
import { stripePromise } from "@/lib/stripe";
import { supabase } from "@/lib/supabaseClient";

const requiredFields = [
  "firstName",
  "email",
  "address",
  "city",
  "state",
  "pincode",
];

export default function AllProductsPaymentPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Auth & Address states
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

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

  useEffect(() => {
    const fetchUserAndAddresses = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setForm(prev => ({ ...prev, email: session.user.email }));
          const { data, error } = await supabase
            .from("user_addresses")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

          if (!error && data && data.length > 0) {
            setAddresses(data);
            const defaultAddr = data.find(a => a.is_default) || data[0];
            handleSelectAddress(defaultAddr);
          } else {
            setShowNewAddressForm(true);
          }
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error("Error loading addresses", err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    fetchUserAndAddresses();
  }, []);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setShowNewAddressForm(false);
    setForm(prev => ({
      ...prev,
      firstName: addr.first_name,
      lastName: addr.last_name,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }));
    // Clear any shipping form errors
    const clearedErrors = { ...errors };
    requiredFields.forEach(f => { if (clearedErrors[f]) delete clearedErrors[f]; });
    setErrors(clearedErrors);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingFee = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingFee + tax;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 mt-12 text-center border border-black/10 bg-accent/5">
        <h2 className="text-3xl font-serif mb-6 tracking-tighter">Your Bag is Empty</h2>
        <p className="text-foreground/60 mb-10 max-w-md mx-auto italic font-light">
          You haven't selected any luxurious items yet.
        </p>
        <Link
          href="/products"
          className="border border-black text-foreground hover:bg-black hover:text-white px-10 py-4 transition-colors uppercase tracking-[0.2em] text-xs font-bold inline-block"
        >
          Discover The Collection
        </Link>
      </div>
    );
  }

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

    // Automatically deselect saved addresses if user manually modifies the form
    if (["firstName", "lastName", "address", "city", "state", "pincode"].includes(id)) {
      if (selectedAddressId) setSelectedAddressId(null);
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
      if (!form[field] || !form[field].trim()) {
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

  const handleCompleteOrder = async () => {
    // Mark all fields as touched for validation display
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

      // Save new address if applicable
      if (user && !selectedAddressId) {
        await supabase.from("user_addresses").insert({
          user_id: user.id,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          is_default: addresses.length === 0
        });
      }

      if (paymentMethod === "stripe") {
        // Stripe checkout flow
        const stripe = await stripePromise;
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems,
            customerInfo: {
              firstName: form.firstName,
              lastName: form.lastName,
              email: form.email,
              address: form.address,
              city: form.city,
              state: form.state,
              pincode: form.pincode,
            },
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
          status: "confirmed",
        };

        // Store order data in localStorage for the confirmation page
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

        // Simulate processing time for better UX
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // Clear cart after successful order
        clearCart();
        // Redirect to order confirmation
        router.push("/order-confirmation");
      }
    } catch (error) {
      console.error("Order processing error:", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 pb-4 border-b border-black/10">
              Order Summary ({totalItems} {totalItems === 1 ? "item" : "items"})
            </h2>
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="py-3">
                  <div className="flex space-x-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={100}
                      className="w-20 object-cover border border-black/5"
                    />

                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-serif italic text-sm mb-2">{item.name}</h3>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest text-foreground/50">
                          Qty: {item.quantity}
                        </p>
                        <p className="font-serif text-sm">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-foreground/40 italic">
                            ₹{item.price.toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-black/10 pt-6 mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Subtotal</span>
                <span className="font-serif">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Shipping</span>
                <span className="font-serif">₹{shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
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

        <div className="lg:col-span-2 space-y-12 order-1 lg:order-2">
          <div className="bg-transparent border border-black/10 p-8">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-black/10">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold">Shipping Address</h2>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="text-xs uppercase tracking-[0.2em] font-bold text-[#800000] flex items-center hover:opacity-70 transition-opacity"
                >
                  <Plus size={14} className="mr-1" />
                  {showNewAddressForm ? "Saved Addresses" : "New Address"}
                </button>
              )}
            </div>

            {isLoadingAddresses ? (
              <div className="py-8 text-center text-sm uppercase tracking-widest opacity-50">Loading addresses...</div>
            ) : (
              <>
                {!showNewAddressForm && addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-6 border cursor-pointer transition-colors relative ${selectedAddressId === addr.id ? 'border-[#800000] bg-[#800000]/5' : 'border-black/10 hover:border-black/30 bg-white'}`}
                      >
                        {selectedAddressId === addr.id && (
                          <CheckCircle2 size={18} className="absolute top-4 right-4 text-[#800000]" />
                        )}
                        <p className="font-bold text-sm uppercase tracking-widest mb-2">{addr.first_name} {addr.last_name}</p>
                        <p className="text-sm font-light text-black/70">{addr.address}</p>
                        <p className="text-sm font-light text-black/70">{addr.city}, {addr.state} {addr.pincode}</p>
                        {addr.is_default && (
                          <span className="inline-block mt-4 text-[10px] uppercase tracking-widest font-bold bg-black text-white px-2 py-1">
                            Default
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <ShippingForm
                    form={form}
                    errors={errors}
                    handleChange={handleChange}
                  />
                )}
              </>
            )}
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
