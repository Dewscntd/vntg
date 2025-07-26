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
  // Clothing Categories
  {
    id: 'mens-clothing',
    name: 'Men\'s Clothing',
    hebrew: 'ביגוד גברים',
    description: 'Second-hand men\'s fashion',
    icon: '👔',
    popular: true,
    subcategories: [
      { id: 'mens-shirts', name: 'Shirts', hebrew: 'חולצות', parentId: 'mens-clothing' },
      { id: 'mens-pants', name: 'Pants', hebrew: 'מכנסיים', parentId: 'mens-clothing' },
      { id: 'mens-jeans', name: 'Jeans', hebrew: 'ג\'ינסים', parentId: 'mens-clothing' },
      { id: 'mens-jackets', name: 'Jackets', hebrew: 'ז\'קטים', parentId: 'mens-clothing' },
      { id: 'mens-sweaters', name: 'Sweaters', hebrew: 'סוודרים', parentId: 'mens-clothing' },
      { id: 'mens-tshirts', name: 'T-Shirts', hebrew: 'טישרטים', parentId: 'mens-clothing' },
      { id: 'mens-shorts', name: 'Shorts', hebrew: 'מכנסיים קצרים', parentId: 'mens-clothing' },
      { id: 'mens-suits', name: 'Suits', hebrew: 'חליפות', parentId: 'mens-clothing' },
    ],
  },
  {
    id: 'womens-clothing',
    name: 'Women\'s Clothing',
    hebrew: 'ביגוד נשים',
    description: 'Second-hand women\'s fashion',
    icon: '👗',
    popular: true,
    subcategories: [
      { id: 'womens-dresses', name: 'Dresses', hebrew: 'שמלות', parentId: 'womens-clothing' },
      { id: 'womens-tops', name: 'Tops', hebrew: 'חולצות', parentId: 'womens-clothing' },
      { id: 'womens-pants', name: 'Pants', hebrew: 'מכנסיים', parentId: 'womens-clothing' },
      { id: 'womens-jeans', name: 'Jeans', hebrew: 'ג\'ינסים', parentId: 'womens-clothing' },
      { id: 'womens-skirts', name: 'Skirts', hebrew: 'חצאיות', parentId: 'womens-clothing' },
      { id: 'womens-jackets', name: 'Jackets', hebrew: 'ז\'קטים', parentId: 'womens-clothing' },
      { id: 'womens-sweaters', name: 'Sweaters', hebrew: 'סוודרים', parentId: 'womens-clothing' },
      { id: 'womens-blouses', name: 'Blouses', hebrew: 'חולצות מכופתרות', parentId: 'womens-clothing' },
      { id: 'womens-shorts', name: 'Shorts', hebrew: 'מכנסיים קצרים', parentId: 'womens-clothing' },
    ],
  },
  {
    id: 'kids-clothing',
    name: 'Kids\' Clothing',
    hebrew: 'ביגוד ילדים',
    description: 'Second-hand children\'s clothing',
    icon: '👶',
    popular: true,
    subcategories: [
      { id: 'baby-clothes', name: 'Baby (0-2)', hebrew: 'תינוקות (0-2)', parentId: 'kids-clothing' },
      { id: 'toddler-clothes', name: 'Toddler (2-4)', hebrew: 'גיל הרך (2-4)', parentId: 'kids-clothing' },
      { id: 'kids-clothes', name: 'Kids (4-12)', hebrew: 'ילדים (4-12)', parentId: 'kids-clothing' },
      { id: 'teen-clothes', name: 'Teen (12+)', hebrew: 'נוער (12+)', parentId: 'kids-clothing' },
      { id: 'school-uniforms', name: 'School Uniforms', hebrew: 'מדי בית ספר', parentId: 'kids-clothing' },
    ],
  },
  {
    id: 'unisex-clothing',
    name: 'Unisex Clothing',
    hebrew: 'ביגוד יוניסקס',
    description: 'Gender-neutral clothing items',
    icon: '👕',
    subcategories: [
      { id: 'unisex-hoodies', name: 'Hoodies', hebrew: 'הודיס', parentId: 'unisex-clothing' },
      { id: 'unisex-tshirts', name: 'T-Shirts', hebrew: 'טישרטים', parentId: 'unisex-clothing' },
      { id: 'unisex-sweatshirts', name: 'Sweatshirts', hebrew: 'סווטשירטים', parentId: 'unisex-clothing' },
      { id: 'unisex-jackets', name: 'Jackets', hebrew: 'ז\'קטים', parentId: 'unisex-clothing' },
    ],
  },

  // Shoes Categories
  {
    id: 'mens-shoes',
    name: 'Men\'s Shoes',
    hebrew: 'נעלי גברים',
    description: 'Second-hand men\'s footwear',
    icon: '👞',
    popular: true,
    subcategories: [
      { id: 'mens-sneakers', name: 'Sneakers', hebrew: 'סניקרס', parentId: 'mens-shoes' },
      { id: 'mens-dress-shoes', name: 'Dress Shoes', hebrew: 'נעלי עור', parentId: 'mens-shoes' },
      { id: 'mens-boots', name: 'Boots', hebrew: 'מגפיים', parentId: 'mens-shoes' },
      { id: 'mens-sandals', name: 'Sandals', hebrew: 'סנדלים', parentId: 'mens-shoes' },
      { id: 'mens-casual', name: 'Casual Shoes', hebrew: 'נעליים יומיומיות', parentId: 'mens-shoes' },
    ],
  },
  {
    id: 'womens-shoes',
    name: 'Women\'s Shoes',
    hebrew: 'נעלי נשים',
    description: 'Second-hand women\'s footwear',
    icon: '👠',
    popular: true,
    subcategories: [
      { id: 'womens-heels', name: 'Heels', hebrew: 'עקבים', parentId: 'womens-shoes' },
      { id: 'womens-flats', name: 'Flats', hebrew: 'נעליים שטוחות', parentId: 'womens-shoes' },
      { id: 'womens-sneakers', name: 'Sneakers', hebrew: 'סניקרס', parentId: 'womens-shoes' },
      { id: 'womens-boots', name: 'Boots', hebrew: 'מגפיים', parentId: 'womens-shoes' },
      { id: 'womens-sandals', name: 'Sandals', hebrew: 'סנדלים', parentId: 'womens-shoes' },
    ],
  },
  {
    id: 'kids-shoes',
    name: 'Kids\' Shoes',
    hebrew: 'נעלי ילדים',
    description: 'Second-hand children\'s footwear',
    icon: '👟',
    subcategories: [
      { id: 'baby-shoes', name: 'Baby Shoes', hebrew: 'נעלי תינוקות', parentId: 'kids-shoes' },
      { id: 'kids-sneakers', name: 'Sneakers', hebrew: 'סניקרס', parentId: 'kids-shoes' },
      { id: 'school-shoes', name: 'School Shoes', hebrew: 'נעלי בית ספר', parentId: 'kids-shoes' },
      { id: 'kids-sandals', name: 'Sandals', hebrew: 'סנדלים', parentId: 'kids-shoes' },
    ],
  },

  // Soft Toys
  {
    id: 'soft-toys',
    name: 'Soft Toys',
    hebrew: 'צעצועים רכים',
    description: 'Plush toys and stuffed animals',
    icon: '🧸',
    popular: true,
    subcategories: [
      { id: 'teddy-bears', name: 'Teddy Bears', hebrew: 'דובי פלוש', parentId: 'soft-toys' },
      { id: 'character-plush', name: 'Character Plush', hebrew: 'דמויות פלוש', parentId: 'soft-toys' },
      { id: 'animal-plush', name: 'Animal Plush', hebrew: 'חיות פלוש', parentId: 'soft-toys' },
      { id: 'baby-toys', name: 'Baby Soft Toys', hebrew: 'צעצועים רכים לתינוקות', parentId: 'soft-toys' },
      { id: 'vintage-toys', name: 'Vintage Plush', hebrew: 'פלוש וינטג\'', parentId: 'soft-toys' },
    ],
  },

  // Books
  {
    id: 'hebrew-books',
    name: 'Hebrew Books',
    hebrew: 'ספרים בעברית',
    description: 'Books in Hebrew language',
    icon: '📚',
    popular: true,
    subcategories: [
      { id: 'hebrew-fiction', name: 'Fiction', hebrew: 'בדיוני', parentId: 'hebrew-books' },
      { id: 'hebrew-non-fiction', name: 'Non-Fiction', hebrew: 'עיוני', parentId: 'hebrew-books' },
      { id: 'hebrew-children', name: 'Children\'s Books', hebrew: 'ספרי ילדים', parentId: 'hebrew-books' },
      { id: 'hebrew-poetry', name: 'Poetry', hebrew: 'שירה', parentId: 'hebrew-books' },
      { id: 'hebrew-textbooks', name: 'Textbooks', hebrew: 'ספרי לימוד', parentId: 'hebrew-books' },
    ],
  },
  {
    id: 'english-books',
    name: 'English Books',
    hebrew: 'ספרים באנגלית',
    description: 'Books in English language',
    icon: '📖',
    subcategories: [
      { id: 'english-fiction', name: 'Fiction', hebrew: 'בדיוני', parentId: 'english-books' },
      { id: 'english-non-fiction', name: 'Non-Fiction', hebrew: 'עיוני', parentId: 'english-books' },
      { id: 'english-children', name: 'Children\'s Books', hebrew: 'ספרי ילדים', parentId: 'english-books' },
      { id: 'english-academic', name: 'Academic', hebrew: 'אקדמי', parentId: 'english-books' },
    ],
  },
  {
    id: 'other-books',
    name: 'Other Languages',
    hebrew: 'שפות אחרות',
    description: 'Books in other languages',
    icon: '🌍',
    subcategories: [
      { id: 'arabic-books', name: 'Arabic', hebrew: 'ערבית', parentId: 'other-books' },
      { id: 'russian-books', name: 'Russian', hebrew: 'רוסית', parentId: 'other-books' },
      { id: 'french-books', name: 'French', hebrew: 'צרפתית', parentId: 'other-books' },
      { id: 'other-languages', name: 'Other', hebrew: 'אחרות', parentId: 'other-books' },
    ],
  },
];

// Helper functions
export function getCategoryById(id: string): PeakeesCategory | undefined {
  return peakeesCategories.find(cat => cat.id === id);
}

export function getSubcategoriesByParent(parentId: string): PeakeesSubcategory[] {
  const category = getCategoryById(parentId);
  return category?.subcategories || [];
}

export function getPopularCategories(): PeakeesCategory[] {
  return peakeesCategories.filter(cat => cat.popular);
}

export function getCategoryDisplayName(category: PeakeesCategory, isHebrew: boolean = false): string {
  return isHebrew ? category.hebrew : category.name;
}

export function getSubcategoryDisplayName(subcategory: PeakeesSubcategory, isHebrew: boolean = false): string {
  return isHebrew ? subcategory.hebrew : subcategory.name;
}

export function searchCategories(query: string): PeakeesCategory[] {
  if (!query) return peakeesCategories;
  
  const searchTerm = query.toLowerCase();
  return peakeesCategories.filter(category => 
    category.name.toLowerCase().includes(searchTerm) ||
    category.hebrew.includes(searchTerm) ||
    category.description.toLowerCase().includes(searchTerm)
  );
}

export default peakeesCategories;