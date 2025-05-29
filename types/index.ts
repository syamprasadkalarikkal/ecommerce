export type ProductType = {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  category?: string;
  subCategory?: string;
  rating?: {
    rate: number;
    count: number;
  };
};
export type CategoryType = {
  id: string;
  name: string;
  image: string;
  subCategories: {
    id: string;
    name: string;
  }[];
};

export type SubCategoryType = {
  id: string;
  name: string;
};

export type CartItem = ProductType;
