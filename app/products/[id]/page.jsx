"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProductById, fetchAllProducts } from "@/services/api";
import { FaStar, FaTrash, FaArrowLeft, FaPlus, FaMinus } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useRatings } from "@/context/RatingsContext";
import ProductCard from "@/componenets/ProductCard";
import { toast } from "react-hot-toast";

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [userExperience, setUserExperience] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const { cartItems, addToCart, isAuthenticated } = useCart();
    const { ratings, updateRating, getUserReview, deleteUserReview, getProductReviews } = useRatings();

    const productReviews = getProductReviews?.(id) || [];
    const userReview = getUserReview?.(id);

    useEffect(() => {
        if (userReview) {
            setUserRating(userReview.rating);
            setUserExperience(userReview.experience || "");
            setSubmitted(true);
        } else {
            setUserRating(0);
            setUserExperience("");
            setSubmitted(false);
        }
    }, [userReview]);

    const isInCart = cartItems.some((item) => item.id === parseInt(id));

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await fetchProductById(id);
                setProduct(data);

                if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
                if (data.colors?.length > 0) setSelectedColor(data.colors[0]);

                const all = await fetchAllProducts();
                const related = all
                    .filter((p) => p.category === data.category && p.id !== data.id)
                    .slice(0, 4);
                setRelatedProducts(related);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, getUserReview]);

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        if (product) {
            addToCart({
                ...product,
                quantity,
                selectedSize,
                selectedColor
            });
            toast.success("Added to your collection");
        }
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        if (userRating > 0 && product) {
            updateRating(id, userRating, userExperience);
            setSubmitted(true);
        }
    };

    const handleDeleteReview = () => {
        deleteUserReview(id);
        setSubmitted(false);
        setUserRating(0);
        setUserExperience("");
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
            <h1 className="text-4xl font-serif mb-4">Piece Not Found</h1>
            <button onClick={() => router.back()} className="text-accent underline">Return to Directory</button>
        </div>
    );

    const displayRating = ratings[id] || { rate: 0, count: 0 };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Header / Back Navigation */}
            <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-[10px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity font-bold"
                >
                    <FaArrowLeft className="mr-2" size={10} /> Back to Collection
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
                {/* Left: Minimalist Color Block */}
                <div
                    className="aspect-[4/5] lg:aspect-auto h-full min-h-[500px] lg:min-h-[700px] transition-all duration-1000 flex items-center justify-center p-20 border border-black/10"
                    style={{
                        backgroundColor: [
                            "#FDFBF7", "#F8F5F0", "#F4ECE2", "#E8E2D9", "#F2F0EB", "#FAF3E0"
                        ][product.id % 6]
                    }}
                >
                    <div className="opacity-[0.03] text-[300px] font-serif select-none pointer-events-none">
                        {product.category?.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Right: Product Details & Ordering */}
                <div className="flex flex-col h-full justify-between">
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent">
                                {product.category}
                            </span>
                            <div className="h-px w-8 bg-accent/30"></div>
                            <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">
                                {product.subCategory}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif tracking-tighter leading-[0.9] mb-8">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-6">
                            <p className="text-3xl font-serif text-accent">₹{product.price.toFixed(2)}</p>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} color={i < Math.round(displayRating.rate) ? "#D4AF37" : "#E5E7EB"} size={12} />
                                ))}
                                <span className="text-[10px] opacity-40 ml-2">({displayRating.count})</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-lg font-light leading-relaxed opacity-70 max-w-xl mb-16">
                        {product.description}
                    </p>

                    <div className="space-y-12">
                        {/* Size Selection */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Select Size</span>
                                <button className="text-[9px] uppercase tracking-widest underline opacity-40 hover:opacity-100 font-bold">Size Guide</button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {(product.sizes || ["36", "37", "38", "39", "40"]).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`min-w-[65px] h-[65px] flex items-center justify-center border transition-all duration-500 text-[11px] font-bold uppercase tracking-widest ${selectedSize === size
                                            ? "bg-[#800000] border-[#800000] text-white"
                                            : "border-foreground/10 hover:border-foreground/40 text-foreground/60"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold block mb-6">Discovery Palette</span>
                            <div className="flex gap-6">
                                {(product.colors || ["Cream", "Black", "Sand"]).map((color) => (
                                    <div
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className="group cursor-pointer flex flex-col items-center gap-3"
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full border border-black/10 transition-all duration-300 ${color === "Black" ? "bg-black" :
                                                color === "Maroon" ? "bg-[#800000]" :
                                                    color === "Gold" ? "bg-[#D4AF37]" :
                                                        "bg-[#FDFBF7]"
                                                } ${selectedColor === color ? 'ring-2 ring-accent ring-offset-2' : 'hover:scale-110'}`}
                                        ></div>
                                        <span className={`text-[8px] uppercase tracking-widest transition-opacity ${selectedColor === color ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            {color}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quantity and CTA */}
                        <div className="pt-12 border-t border-foreground/5 flex flex-col sm:flex-row gap-6">
                            <div className="flex items-center space-x-8 border border-foreground/10 px-8 py-5">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="opacity-40 hover:opacity-100 transition-opacity"
                                >
                                    <FaMinus size={12} />
                                </button>
                                <span className="w-8 text-center font-serif text-2xl">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="opacity-40 hover:opacity-100 transition-opacity"
                                >
                                    <FaPlus size={12} />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={isInCart}
                                className={`flex-1 py-5 px-10 text-[10px] font-bold tracking-[0.4em] uppercase transition-all duration-500 shadow-xl ${isInCart
                                    ? "bg-foreground/5 text-foreground/40 cursor-not-allowed"
                                    : "bg-[#800000] text-white hover:bg-black"
                                    }`}
                            >
                                {isInCart ? "Already In Selection" : "Add to Collection"}
                            </button>
                        </div>
                    </div>

                    {/* Quality Assurance */}
                    <div className="mt-16 grid grid-cols-2 gap-8 pt-8 border-t border-foreground/5">
                        <div>
                            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Artisan Authenticity</h4>
                            <p className="text-[10px] opacity-40 leading-relaxed font-light">Every piece is verified by our boutique curators for craftsmanship and quality.</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Private Delivery</h4>
                            <p className="text-[10px] opacity-40 leading-relaxed font-light">Complimentary white-glove delivery on all collection pieces.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guest Experiences / Reviews */}
            <div className="max-w-7xl mx-auto px-4 mt-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
                    <div className="h-full">
                        <h2 className="text-3xl font-serif italic luxury-text mb-12">Guest Experiences</h2>
                        {!submitted ? (
                            <form onSubmit={handleSubmitReview} className="space-y-10 bg-foreground/[0.02] p-10">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-6">Rate your journey</p>
                                    <div className="flex gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setUserRating(star)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <FaStar size={24} color={star <= (hoverRating || userRating) ? "#D4AF37" : "#E5E7EB"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block mb-6">Describe the sensation</label>
                                    <input
                                        type="text"
                                        value={userExperience}
                                        onChange={(e) => setUserExperience(e.target.value)}
                                        className="w-full bg-white border border-foreground/5 focus:ring-1 focus:ring-accent px-6 py-4 text-sm font-light"
                                        placeholder="How does this piece define your style?"
                                    />
                                </div>
                                <button type="submit" className="bg-black text-white px-12 py-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#800000] transition-all">
                                    Publish Experience
                                </button>
                            </form>
                        ) : (
                            <div className="bg-foreground/[0.02] p-12 border border-accent/10">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-4">Your Published Experience</p>
                                        <div className="flex gap-1.5">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} color={i < userRating ? "#D4AF37" : "#E5E7EB"} size={14} />
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={handleDeleteReview} className="text-foreground/20 hover:text-red-500 transition-colors">
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                                <p className="italic opacity-80 text-xl font-serif max-w-lg leading-relaxed">"{userExperience}"</p>
                            </div>
                        )}
                    </div>

                    {/* You May Also Admire */}
                    <div className="h-full">
                        <div className="mb-12">
                            <h2 className="text-3xl font-serif">You May Also <span className="luxury-text italic">Admire</span></h2>
                            <div className="w-16 h-px bg-accent mt-6 opacity-30"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {relatedProducts.slice(0, 2).map((p) => (
                                <ProductCard
                                    key={p.id}
                                    {...p}
                                    onClick={(id) => router.push(`/products/${id}`)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* List all reviews */}
                <div className="mt-20 border-t border-black/5 pt-16">
                    <h3 className="text-2xl font-serif italic mb-8">All Guest Experiences ({productReviews.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {productReviews.length > 0 ? productReviews.map((review, idx) => (
                            <div key={idx} className="bg-foreground/[0.02] p-8 border border-black/5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} color={i < review.rating ? "#D4AF37" : "#E5E7EB"} size={12} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest opacity-40">
                                        {new Date(review.created_at || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                                {review.experience && (
                                    <p className="italic opacity-80 text-sm font-serif leading-relaxed">"{review.experience}"</p>
                                )}
                            </div>
                        )) : (
                            <p className="text-sm opacity-50">Be the first to share your experience with this piece.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
