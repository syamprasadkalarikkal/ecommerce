// Store Data: Ladies Fashion Exclusive
const LADIES_PRODUCTS = [
  // DRESSES (10 items)
  {
    id: 101,
    name: "Midnight Silk Slip Dress",
    image: "/images/model1.png",
    price: 249.00,
    description: "A timeless silhouette crafted from the finest mulberry silk. Features a delicate cowl neck.",
    category: "dresses",
    subCategory: "evening",
    rating: { rate: 4.8, count: 124 },
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Emerald", "Ruby"]
  },
  {
    id: 102,
    name: "Golden Hour Maxi",
    image: "/images/model3.png",
    price: 185.00,
    description: "Flowing tiered skirt with intricate lace detailing. Perfect for summer galas.",
    category: "dresses",
    subCategory: "casual",
    rating: { rate: 4.7, count: 210 },
    sizes: ["S", "M", "L"],
    colors: ["Gold", "Cream"]
  },
  { id: 103, name: "Velvet Affair Mini", image: "/images/model2.png", price: 210.00, description: "Rich velvet texture with a modern structured fit.", category: "dresses", subCategory: "party", rating: { rate: 4.9, count: 56 }, sizes: ["XS", "S", "M"], colors: ["Maroon", "Navy"] },
  { id: 104, name: "Linen Day Breeze", image: "/images/hero.png", price: 145.00, description: "Breathable linen for elevated everyday wear.", category: "dresses", subCategory: "casual", rating: { rate: 4.5, count: 89 }, sizes: ["S", "M", "L", "XL"], colors: ["White", "Sand"] },
  { id: 105, name: "Satin Evening Gown", image: "/images/model1.png", price: 550.00, description: "High-slit satin gown for premier events.", category: "dresses", subCategory: "evening", rating: { rate: 5.0, count: 34 }, sizes: ["S", "M"], colors: ["Champagne", "Silver"] },
  { id: 106, name: "Floral Garden Wrap", image: "/images/model3.png", price: 195.00, description: "Delicate floral prints on lightweight chiffon.", category: "dresses", subCategory: "casual", rating: { rate: 4.6, count: 112 }, sizes: ["XS", "S", "M", "L"], colors: ["Floral", "Soft Blue"] },
  { id: 107, name: "Black Tie Column", image: "/images/model2.png", price: 380.00, description: "Sleek column silhouette with crystal embellishments.", category: "dresses", subCategory: "evening", rating: { rate: 4.9, count: 45 }, sizes: ["S", "M", "L"], colors: ["Black"] },
  { id: 108, name: "Cotton Tiered Midi", image: "/images/hero.png", price: 160.00, description: "Playful volume with a structured bodice.", category: "dresses", subCategory: "casual", rating: { rate: 4.4, count: 78 }, sizes: ["M", "L", "XL"], colors: ["Terracotta", "Olive"] },
  { id: 109, name: "Artisan Pleated Mini", image: "/images/model1.png", price: 225.00, description: "Hand-pleated details for a sculptural look.", category: "dresses", subCategory: "party", rating: { rate: 4.7, count: 67 }, sizes: ["XS", "S", "M"], colors: ["Teal", "Coral"] },
  { id: 110, name: "Silk Chiffon Dream", image: "/images/model3.png", price: 420.00, description: "Ethereal layers of pure silk chiffon.", category: "dresses", subCategory: "evening", rating: { rate: 4.8, count: 92 }, sizes: ["S", "M", "L"], colors: ["Lavender", "Peach"] },

  // BAGS (10 items)
  { id: 201, name: "Structured Leather Tote", image: "/images/model2.png", price: 850.00, description: "Italian leather with gold-tone hardware.", category: "bags", subCategory: "totes", rating: { rate: 4.9, count: 45 }, sizes: ["One Size"], colors: ["Tan", "Black", "Burgundy"] },
  { id: 202, name: "Petite Chain Clutch", image: "/images/model1.png", price: 420.00, description: "The perfect companion for evening soirées.", category: "bags", subCategory: "clutch", rating: { rate: 4.8, count: 56 }, sizes: ["One Size"], colors: ["Gold", "Silver", "Black"] },
  { id: 203, name: "Quilted Shoulder Bag", image: "/images/model3.png", price: 680.00, description: "Classic quilting with a modern chain strap.", category: "bags", subCategory: "shoulder", rating: { rate: 4.7, count: 120 }, sizes: ["One Size"], colors: ["Beige", "Navy"] },
  { id: 204, name: "Suede Bucket Bag", image: "/images/hero.png", price: 340.00, description: "Soft suede with artisan drawstring closure.", category: "bags", subCategory: "bucket", rating: { rate: 4.6, count: 88 }, sizes: ["One Size"], colors: ["Forest Green", "Rust"] },
  { id: 205, name: "Croc-Effect Satchel", image: "/images/model2.png", price: 590.00, description: "Textured finish for a bold professional look.", category: "bags", subCategory: "satchel", rating: { rate: 4.9, count: 32 }, sizes: ["One Size"], colors: ["Chocolate", "Emerald"] },
  { id: 206, name: "Minimalist Crossbody", image: "/images/model1.png", price: 280.00, description: "Clean lines and effortless utility.", category: "bags", subCategory: "crossbody", rating: { rate: 4.5, count: 150 }, sizes: ["One Size"], colors: ["Stone", "Sage", "Black"] },
  { id: 207, name: "Woven Artisan Tote", image: "/images/model3.png", price: 450.00, description: "Hand-woven leather for a summer escape.", category: "bags", subCategory: "totes", rating: { rate: 4.7, count: 64 }, sizes: ["One Size"], colors: ["Natural", "Tan"] },
  { id: 208, name: "Crystal Mini Bag", image: "/images/hero.png", price: 720.00, description: "A jewelry piece that happens to be a bag.", category: "bags", subCategory: "mini", rating: { rate: 5.0, count: 28 }, sizes: ["One Size"], colors: ["Crystal", "Rose Gold"] },
  { id: 209, name: "Box Calf Hobo", image: "/images/model2.png", price: 980.00, description: "Heritage box calf leather with a relaxed tilt.", category: "bags", subCategory: "hobo", rating: { rate: 4.9, count: 41 }, sizes: ["One Size"], colors: ["Black", "Cognac"] },
  { id: 210, name: "Designer Travel Duffel", image: "/images/model1.png", price: 1200.00, description: "Travel in uncompromising style.", category: "bags", subCategory: "travel", rating: { rate: 4.8, count: 19 }, sizes: ["One Size"], colors: ["Monogram", "Noir"] },

  // SHOES (10 items)
  { id: 301, name: "Stiletto Pump 105", image: "/images/model3.png", price: 650.00, description: "The ultimate power heel in brushed suede.", category: "shoes", subCategory: "pumps", rating: { rate: 4.8, count: 88 }, sizes: ["36", "37", "38", "39", "40"], colors: ["Nude", "Red", "Black"] },
  { id: 302, name: "Embroidery Ballerina", image: "/images/model2.png", price: 380.00, description: "Intricate needlework on soft nappa leather.", category: "shoes", subCategory: "flats", rating: { rate: 4.7, count: 110 }, sizes: ["35", "36", "37", "38", "39"], colors: ["Cream", "Black"] },
  { id: 303, name: "Strappy Sandals", image: "/images/hero.png", price: 420.00, description: "Delicate straps for summer evenings.", category: "shoes", subCategory: "sandals", rating: { rate: 4.6, count: 75 }, sizes: ["36", "37", "38", "39"], colors: ["Silver", "Gold"] },
  { id: 304, name: "Chelsea Ankle Boot", image: "/images/model1.png", price: 580.00, description: "Polished leather with an iconic silhouette.", category: "shoes", subCategory: "boots", rating: { rate: 4.9, count: 92 }, sizes: ["37", "38", "39", "40", "41"], colors: ["Black", "Espresso"] },
  { id: 305, name: "Slingback Pointed Toe", image: "/images/model3.png", price: 490.00, description: "Vintage charm with a contemporary twist.", category: "shoes", subCategory: "pumps", rating: { rate: 4.7, count: 64 }, sizes: ["36", "37", "38", "39"], colors: ["Champagne", "Black"] },
  { id: 306, name: "Platform Loafer", image: "/images/model2.png", price: 520.00, description: "Elevated structure for day-to-night transitions.", category: "shoes", subCategory: "loafers", rating: { rate: 4.8, count: 53 }, sizes: ["37", "38", "39", "40"], colors: ["Burgundy", "Black"] },
  { id: 307, name: "Satin Slide", image: "/images/hero.png", price: 320.00, description: "Luxurious satin for high-end lounging.", category: "shoes", subCategory: "flats", rating: { rate: 4.5, count: 120 }, sizes: ["36", "37", "38", "39"], colors: ["Rose", "Navy"] },
  { id: 308, name: "Over-The-Knee Boot", image: "/images/model1.png", price: 950.00, description: "Buttery soft leather that fits like a second skin.", category: "shoes", subCategory: "boots", rating: { rate: 4.9, count: 37 }, sizes: ["37", "38", "39", "40"], colors: ["Black", "Slate"] },
  { id: 309, name: "Mule with Jewel Buckle", image: "/images/model3.png", price: 780.00, description: "Striking crystal focal point for any outfit.", category: "shoes", subCategory: "pumps", rating: { rate: 5.0, count: 21 }, sizes: ["36", "37", "38", "39"], colors: ["Emerald", "Fuchsia"] },
  { id: 310, name: "Leather Sneakers", image: "/images/model2.png", price: 450.00, description: "Clean, architectural sneakers for the modern woman.", category: "shoes", subCategory: "sneakers", rating: { rate: 4.8, count: 140 }, sizes: ["35", "36", "37", "38", "39", "40"], colors: ["White", "Silver"] },

  // TOPS (10 items)
  { id: 401, name: "Silk Pussy-Bow Blouse", image: "/images/model1.png", price: 320.00, description: "Traditional elegance in fluid silk crepe.", category: "tops", subCategory: "blouses", rating: { rate: 4.9, count: 67 }, sizes: ["XS", "S", "M", "L"], colors: ["Ivory", "Black", "Dusty Pink"] },
  { id: 402, name: "Cashmere Turtleneck", image: "/images/model3.png", price: 450.00, description: "Heirloom-quality cashmere for ultimate warmth.", category: "tops", subCategory: "knitwear", rating: { rate: 4.8, count: 112 }, sizes: ["S", "M", "L", "XL"], colors: ["Camel", "Oatmeal", "Grey"] },
  { id: 403, name: "Tailored Crisp Shirt", image: "/images/model2.png", price: 210.00, description: "The fundamental white shirt, perfected.", category: "tops", subCategory: "shirts", rating: { rate: 4.7, count: 180 }, sizes: ["XS", "S", "M", "L", "XL"], colors: ["White", "Sky Blue"] },
  { id: 404, name: "Lace Insert Camisole", image: "/images/hero.png", price: 180.00, description: "Delicate lace detailing for layering or solo wear.", category: "tops", subCategory: "tops", rating: { rate: 4.6, count: 95 }, sizes: ["S", "M", "L"], colors: ["Pearl", "Black"] },
  { id: 405, name: "Graphic Designer Tee", image: "/images/model1.png", price: 120.00, description: "Elevated essential with minimalist branding.", category: "tops", subCategory: "tops", rating: { rate: 4.4, count: 210 }, sizes: ["S", "M", "L"], colors: ["White", "Black"] },
  { id: 406, name: "Wool Blend Cardigan", image: "/images/model3.png", price: 380.00, description: "Textured knit with sculptural buttons.", category: "tops", subCategory: "knitwear", rating: { rate: 4.8, count: 45 }, sizes: ["S", "M", "L"], colors: ["Cream", "Navy"] },
  { id: 407, name: "Leather Bustier Top", image: "/images/model2.png", price: 520.00, description: "Bold structure for contemporary styling.", category: "tops", subCategory: "tops", rating: { rate: 4.9, count: 33 }, sizes: ["XS", "S", "M"], colors: ["Black", "Oxblood"] },
  { id: 408, name: "Off-Shoulder Bodysuit", image: "/images/hero.png", price: 160.00, description: "Sleek silhouette with perfect stretch.", category: "tops", subCategory: "tops", rating: { rate: 4.5, count: 88 }, sizes: ["S", "M", "L"], colors: ["Sand", "Black"] },
  { id: 409, name: "Velvet Evening Bolero", image: "/images/model1.png", price: 290.00, description: "The finishing touch for any gown.", category: "tops", subCategory: "outerwear", rating: { rate: 4.7, count: 24 }, sizes: ["S", "M"], colors: ["Black", "Midnight"] },
  { id: 410, name: "Sheer Organza Blouse", image: "/images/model3.png", price: 340.00, description: "Playful volume with ethereal transparency.", category: "tops", subCategory: "blouses", rating: { rate: 4.8, count: 56 }, sizes: ["S", "M", "L"], colors: ["White", "Blush"] },
];

export async function fetchCategories() {
  return [
    {
      id: "dresses",
      name: "Dresses",
      image: LADIES_PRODUCTS[0].image,
      subCategories: [
        { id: "evening", name: "Evening Gowns" },
        { id: "casual", name: "Day Dresses" },
        { id: "party", name: "Cocktail Dresses" },
      ],
    },
    {
      id: "tops",
      name: "Tops & Blouses",
      image: LADIES_PRODUCTS[30].image,
      subCategories: [
        { id: "shirts", name: "Silk Shirts" },
        { id: "blouses", name: "Designer Blouses" },
        { id: "knitwear", name: "Luxury Knitwear" },
      ],
    },
    {
      id: "bags",
      name: "Bags",
      image: LADIES_PRODUCTS[10].image,
      subCategories: [
        { id: "totes", name: "Tote Bags" },
        { id: "clutch", name: "Clutches" },
        { id: "shoulder", name: "Shoulder Bags" },
      ],
    },
    {
      id: "shoes",
      name: "Shoes",
      image: LADIES_PRODUCTS[20].image,
      subCategories: [
        { id: "pumps", name: "Heels & Pumps" },
        { id: "flats", name: "Luxury Flats" },
        { id: "boots", name: "Designer Boots" },
      ],
    },
  ];
}

export async function fetchAllProducts() {
  return LADIES_PRODUCTS;
}

export async function fetchProductById(productId) {
  const product = LADIES_PRODUCTS.find(p => p.id === parseInt(productId));
  if (!product) throw new Error("Product not found");
  return product;
}

export async function fetchProductsByCategory(categoryId) {
  return LADIES_PRODUCTS.filter(p => p.category.toLowerCase() === categoryId.toLowerCase());
}

export async function fetchProductsBySubCategory(categoryId, subCategoryId) {
  return LADIES_PRODUCTS.filter(
    (p) => p.category.toLowerCase() === categoryId.toLowerCase() &&
      p.subCategory.toLowerCase() === subCategoryId.toLowerCase()
  );
}
