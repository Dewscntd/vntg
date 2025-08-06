// Peakees store categories - clothing, shoes, soft toys, and books
// Optimized for Israeli second-hand store

export interface PeakeesCategory {
  id: string;
  name: string;
  hebrew: string;
  description: string;
  icon: string;
  subcategories?: PeakeesSubcategory[];
  popular?: boolean;
}

export interface PeakeesSubcategory {
  id: string;
  name: string;
  hebrew: string;
  parentId: string;
}

export const peakeesCategories: PeakeesCategory[] = [
  // Main Categories: Men, Women, Teens
  {
    id: 'men',
    name: 'Men',
    hebrew: 'גברים',
    description: "Second-hand men's fashion and accessories",
    icon: '👔',
    popular: true,
    subcategories: [
      { id: 'men-shirts', name: 'Shirts', hebrew: 'חולצות', parentId: 'men' },
      { id: 'men-t-shirts', name: 'T-Shirts', hebrew: 'טישרטים', parentId: 'men' },
      { id: 'men-pants', name: 'Pants', hebrew: 'מכנסיים', parentId: 'men' },
      { id: 'men-jeans', name: 'Jeans', hebrew: "ג'ינסים", parentId: 'men' },
      { id: 'men-shorts', name: 'Shorts', hebrew: 'מכנסיים קצרים', parentId: 'men' },
      { id: 'men-blazers', name: 'Blazers', hebrew: 'בלייזרים', parentId: 'men' },
      { id: 'men-jackets', name: 'Jackets', hebrew: "ז'קטים", parentId: 'men' },
      { id: 'men-sweaters', name: 'Sweaters', hebrew: 'סוודרים', parentId: 'men' },
      { id: 'men-hoodies', name: 'Hoodies', hebrew: 'הודיס', parentId: 'men' },
      { id: 'men-suits', name: 'Suits', hebrew: 'חליפות', parentId: 'men' },
      { id: 'men-shoes', name: 'Shoes', hebrew: 'נעליים', parentId: 'men' },
      { id: 'men-accessories', name: 'Accessories', hebrew: 'אביזרים', parentId: 'men' },
    ],
  },
  {
    id: 'women',
    name: 'Women',
    hebrew: 'נשים',
    description: "Second-hand women's fashion and accessories",
    icon: '👗',
    popular: true,
    subcategories: [
      { id: 'women-dresses', name: 'Dresses', hebrew: 'שמלות', parentId: 'women' },
      { id: 'women-shirts', name: 'Shirts', hebrew: 'חולצות', parentId: 'women' },
      { id: 'women-blouses', name: 'Blouses', hebrew: 'חולצות מכופתרות', parentId: 'women' },
      { id: 'women-t-shirts', name: 'T-Shirts', hebrew: 'טישרטים', parentId: 'women' },
      { id: 'women-tops', name: 'Tops', hebrew: 'טופים', parentId: 'women' },
      { id: 'women-pants', name: 'Pants', hebrew: 'מכנסיים', parentId: 'women' },
      { id: 'women-jeans', name: 'Jeans', hebrew: "ג'ינסים", parentId: 'women' },
      { id: 'women-skirts', name: 'Skirts', hebrew: 'חצאיות', parentId: 'women' },
      { id: 'women-shorts', name: 'Shorts', hebrew: 'מכנסיים קצרים', parentId: 'women' },
      { id: 'women-blazers', name: 'Blazers', hebrew: 'בלייזרים', parentId: 'women' },
      { id: 'women-jackets', name: 'Jackets', hebrew: "ז'קטים", parentId: 'women' },
      { id: 'women-sweaters', name: 'Sweaters', hebrew: 'סוודרים', parentId: 'women' },
      { id: 'women-hoodies', name: 'Hoodies', hebrew: 'הודיס', parentId: 'women' },
      { id: 'women-shoes', name: 'Shoes', hebrew: 'נעליים', parentId: 'women' },
      { id: 'women-accessories', name: 'Accessories', hebrew: 'אביזרים', parentId: 'women' },
    ],
  },
  {
    id: 'teens',
    name: 'Teens',
    hebrew: 'נוער',
    description: 'Second-hand teen fashion and accessories',
    icon: '👕',
    popular: true,
    subcategories: [
      { id: 'teens-shirts', name: 'Shirts', hebrew: 'חולצות', parentId: 'teens' },
      { id: 'teens-t-shirts', name: 'T-Shirts', hebrew: 'טישרטים', parentId: 'teens' },
      { id: 'teens-pants', name: 'Pants', hebrew: 'מכנסיים', parentId: 'teens' },
      { id: 'teens-jeans', name: 'Jeans', hebrew: "ג'ינסים", parentId: 'teens' },
      { id: 'teens-shorts', name: 'Shorts', hebrew: 'מכנסיים קצרים', parentId: 'teens' },
      { id: 'teens-dresses', name: 'Dresses', hebrew: 'שמלות', parentId: 'teens' },
      { id: 'teens-skirts', name: 'Skirts', hebrew: 'חצאיות', parentId: 'teens' },
      { id: 'teens-blazers', name: 'Blazers', hebrew: 'בלייזרים', parentId: 'teens' },
      { id: 'teens-jackets', name: 'Jackets', hebrew: "ז'קטים", parentId: 'teens' },
      { id: 'teens-sweaters', name: 'Sweaters', hebrew: 'סוודרים', parentId: 'teens' },
      { id: 'teens-hoodies', name: 'Hoodies', hebrew: 'הודיס', parentId: 'teens' },
      { id: 'teens-shoes', name: 'Shoes', hebrew: 'נעליים', parentId: 'teens' },
      { id: 'teens-accessories', name: 'Accessories', hebrew: 'אביזרים', parentId: 'teens' },
      {
        id: 'teens-school-uniforms',
        name: 'School Uniforms',
        hebrew: 'מדי בית ספר',
        parentId: 'teens',
      },
    ],
  },

  // Additional Categories
  {
    id: 'kids',
    name: 'Kids',
    hebrew: 'ילדים',
    description: "Second-hand children's clothing (ages 2-12)",
    icon: '👶',
    subcategories: [
      { id: 'kids-shirts', name: 'Shirts', hebrew: 'חולצות', parentId: 'kids' },
      { id: 'kids-t-shirts', name: 'T-Shirts', hebrew: 'טישרטים', parentId: 'kids' },
      { id: 'kids-pants', name: 'Pants', hebrew: 'מכנסיים', parentId: 'kids' },
      { id: 'kids-shorts', name: 'Shorts', hebrew: 'מכנסיים קצרים', parentId: 'kids' },
      { id: 'kids-dresses', name: 'Dresses', hebrew: 'שמלות', parentId: 'kids' },
      { id: 'kids-jackets', name: 'Jackets', hebrew: "ז'קטים", parentId: 'kids' },
      { id: 'kids-shoes', name: 'Shoes', hebrew: 'נעליים', parentId: 'kids' },
      {
        id: 'kids-school-uniforms',
        name: 'School Uniforms',
        hebrew: 'מדי בית ספר',
        parentId: 'kids',
      },
    ],
  },
  {
    id: 'babies',
    name: 'Babies',
    hebrew: 'תינוקות',
    description: 'Second-hand baby clothing (ages 0-2)',
    icon: '🍼',
    subcategories: [
      { id: 'baby-bodysuits', name: 'Bodysuits', hebrew: 'בגדי גוף', parentId: 'babies' },
      { id: 'baby-pants', name: 'Pants', hebrew: 'מכנסיים', parentId: 'babies' },
      { id: 'baby-dresses', name: 'Dresses', hebrew: 'שמלות', parentId: 'babies' },
      { id: 'baby-jackets', name: 'Jackets', hebrew: "ז'קטים", parentId: 'babies' },
      { id: 'baby-shoes', name: 'Shoes', hebrew: 'נעליים', parentId: 'babies' },
    ],
  },

  // Toys & Books
  {
    id: 'toys',
    name: 'Toys',
    hebrew: 'צעצועים',
    description: 'Second-hand toys and games',
    icon: '🧸',
    subcategories: [
      { id: 'plush-toys', name: 'Plush Toys', hebrew: 'צעצועי פלוש', parentId: 'toys' },
      { id: 'board-games', name: 'Board Games', hebrew: 'משחקי קופסה', parentId: 'toys' },
      {
        id: 'educational-toys',
        name: 'Educational Toys',
        hebrew: 'צעצועים חינוכיים',
        parentId: 'toys',
      },
    ],
  },
  {
    id: 'books',
    name: 'Books',
    hebrew: 'ספרים',
    description: 'Second-hand books in various languages',
    icon: '📚',
    subcategories: [
      { id: 'hebrew-books', name: 'Hebrew Books', hebrew: 'ספרים בעברית', parentId: 'books' },
      { id: 'english-books', name: 'English Books', hebrew: 'ספרים באנגלית', parentId: 'books' },
      { id: 'children-books', name: "Children's Books", hebrew: 'ספרי ילדים', parentId: 'books' },
      { id: 'textbooks', name: 'Textbooks', hebrew: 'ספרי לימוד', parentId: 'books' },
    ],
  },
];

// Helper functions
export function getCategoryById(id: string): PeakeesCategory | undefined {
  return peakeesCategories.find((cat) => cat.id === id);
}

export function getSubcategoriesByParent(parentId: string): PeakeesSubcategory[] {
  const category = getCategoryById(parentId);
  return category?.subcategories || [];
}

export function getPopularCategories(): PeakeesCategory[] {
  return peakeesCategories.filter((cat) => cat.popular);
}

export function getCategoryDisplayName(
  category: PeakeesCategory,
  isHebrew: boolean = false
): string {
  return isHebrew ? category.hebrew : category.name;
}

export function getSubcategoryDisplayName(
  subcategory: PeakeesSubcategory,
  isHebrew: boolean = false
): string {
  return isHebrew ? subcategory.hebrew : subcategory.name;
}

export function searchCategories(query: string): PeakeesCategory[] {
  if (!query) return peakeesCategories;

  const searchTerm = query.toLowerCase();
  return peakeesCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm) ||
      category.hebrew.includes(searchTerm) ||
      category.description.toLowerCase().includes(searchTerm)
  );
}

export default peakeesCategories;
