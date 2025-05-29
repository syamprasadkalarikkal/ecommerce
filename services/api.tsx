import { ProductType, CategoryType } from '@/types';

const API_BASE_URL = 'https://fakestoreapi.com'; // Replace with your fake API URL

// Fetch all categories
export async function fetchCategories(): Promise<CategoryType[]> {
  try {
    // First, fetch the basic category list
    const response = await fetch(`${API_BASE_URL}/products/categories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    const categoryNames = await response.json();
    
    // Then for each category, fetch subcategories and additional details
    // This is a common pattern when dealing with APIs that don't provide nested data
    const categoriesWithDetails = await Promise.all(
      categoryNames.map(async (name: string) => {
        // For each category, get its subcategories
        const subCategoriesResponse = await fetch(`${API_BASE_URL}/categories/${name}/subcategories`);
        const subCategories = await subCategoriesResponse.json();
        
        // Create a proper category object with all needed fields
        return {
          id: name.toLowerCase().replace(/\s+/g, '_'),
          name: name,
          image: `${API_BASE_URL}/images/categories/${name.toLowerCase().replace(/\s+/g, '_')}.jpg`,
          subCategories: subCategories.map((sub: any) => ({
            id: sub.id || sub.name.toLowerCase().replace(/\s+/g, '_'),
            name: sub.name
          }))
        };
      })
    );
    
    return categoriesWithDetails;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // If API fails, provide fallback categories to ensure app doesn't break
    return getFallbackCategories();
  }
}

// Fetch products by category
export async function fetchProductsByCategory(categoryId: string): Promise<ProductType[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const products = await response.json();
    
    // Transform API response to match your ProductType
    return products.map((product: any) => ({
      id: product.id,
      name: product.title || product.name,
      image: product.image,
      price: product.price,
      description: product.description,
      category: categoryId,
      subCategory: product.subCategory || ''  // Some APIs may not provide subcategory
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

// Fetch products by subcategory - using category filtering and additional filtering for subcategory
export async function fetchProductsBySubCategory(
  categoryId: string, 
  subCategoryId: string
): Promise<ProductType[]> {
  try {
    // Some APIs don't have direct subcategory endpoints, so we get all category products
    // and filter by subcategory client-side
    const categoryProducts = await fetchProductsByCategory(categoryId);
    
    // Filter for products matching the subcategory
    return categoryProducts.filter(product => 
      product.subCategory && product.subCategory.toLowerCase() === subCategoryId.toLowerCase()
    );
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    return [];
  }
}

// Fallback categories if API fails
function getFallbackCategories(): CategoryType[] {
  return [
    {
      id: 'electronics',
      name: 'Electronics',
      image: '/images/categories/electronics.jpg',
      subCategories: [
        { id: 'smartphones', name: 'Smartphones' },
        { id: 'laptops', name: 'Laptops' },
        { id: 'accessories', name: 'Accessories' }
      ]
    },
    {
      id: 'clothing',
      name: 'Clothing',
      image: '/images/categories/clothing.jpg',
      subCategories: [
        { id: 'mens', name: "Men's Clothing" },
        { id: 'womens', name: "Women's Clothing" }
      ]
    },
    {
      id: 'beauty',
      name: 'Beauty',
      image: '/images/categories/beauty.jpg',
      subCategories: [
        { id: 'skincare', name: 'Skincare' },
        { id: 'makeup', name: 'Makeup' },
        { id: 'fragrance', name: 'Fragrance' }
      ]
    },
    {
      id: 'home',
      name: 'Home & Kitchen',
      image: '/images/categories/home.jpg',
      subCategories: [
        { id: 'furniture', name: 'Furniture' },
        { id: 'decor', name: 'Home Decor' },
        { id: 'kitchenware', name: 'Kitchenware' }
      ]
    }
  ];
}

// Other API functions remain the same...
export async function fetchAllProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const products = await response.json();
    
    // Transform API response to match your ProductType
    return products.map((product: any) => ({
      id: product.id,
      name: product.title || product.name,
      image: product.image,
      price: product.price,
      description: product.description,
      category: product.category,
      subCategory: product.subCategory || ''
    }));
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

export async function fetchProductById(productId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    const product = await response.json();
    
    // Transform API response to match your ProductType
    return {
      id: product.id,
      name: product.title || product.name,
      image: product.image,
      price: product.price,
      description: product.description,
      category: product.category,
      subCategory: product.subCategory || ''
    };
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
}
