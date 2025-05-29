import Link from 'next/link';
import { mainCategories } from '@/data/maincategories';

export default function CategoryList() {
  return (
    <div className="p-4">
      {mainCategories.map((category) => (
        <div key={category.id}>
          <h2 className="text-xl font-bold">{category.name}</h2>
          <ul className="pl-4">
            {category.subCategories.map((sub) => (
              <li key={sub.id}>
                <Link
                  href={`/category/${category.id}/${sub.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
