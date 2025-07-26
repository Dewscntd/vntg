// Israeli mall brands commonly found in second-hand stores
// Organized by category for better UX

export interface Brand {
  name: string;
  category: string[];
  hebrew?: string;
  popular?: boolean;
}

export const israeliBrands: Brand[] = [
  // Israeli Fashion Brands
  { name: 'Factory 54', category: ['clothing'], hebrew: 'פקטורי 54', popular: true },
  { name: 'Golf', category: ['clothing'], hebrew: 'גולף', popular: true },
  { name: 'Hoodies', category: ['clothing'], hebrew: 'הודיס', popular: true },
  { name: 'Castro', category: ['clothing'], hebrew: 'קסטרו', popular: true },
  { name: 'Gio Benitez', category: ['clothing'], hebrew: 'ג\'יו בניטז' },
  { name: 'Terminal X', category: ['clothing'], hebrew: 'טרמינל X', popular: true },
  { name: 'Renuar', category: ['clothing'], hebrew: 'רנואר', popular: true },
  { name: 'Golbary', category: ['clothing'], hebrew: 'גולברי' },
  { name: 'American Eagle Israel', category: ['clothing'], popular: true },
  { name: 'Fox', category: ['clothing'], hebrew: 'פוקס', popular: true },
  { name: 'Honigman', category: ['clothing'], hebrew: 'הוניגמן' },
  { name: 'Comme Il Faut', category: ['clothing'], hebrew: 'קום איל פו' },
  { name: 'Sarit Hadad Fashion', category: ['clothing'], hebrew: 'שרית חדד אופנה' },

  // International Fashion Brands (common in Israeli malls)
  { name: 'Zara', category: ['clothing'], popular: true },
  { name: 'H&M', category: ['clothing'], popular: true },
  { name: 'Mango', category: ['clothing'], popular: true },
  { name: 'Pull & Bear', category: ['clothing'], popular: true },
  { name: 'Bershka', category: ['clothing'], popular: true },
  { name: 'Uniqlo', category: ['clothing'], popular: true },
  { name: 'Gap', category: ['clothing'], popular: true },
  { name: 'Banana Republic', category: ['clothing'] },
  { name: 'Old Navy', category: ['clothing'] },
  { name: 'American Eagle', category: ['clothing'], popular: true },
  { name: 'Hollister', category: ['clothing'] },
  { name: 'Abercrombie & Fitch', category: ['clothing'] },
  { name: 'Tommy Hilfiger', category: ['clothing'] },
  { name: 'Calvin Klein', category: ['clothing'] },
  { name: 'Lacoste', category: ['clothing'] },
  { name: 'Ralph Lauren', category: ['clothing'] },
  { name: 'Polo Ralph Lauren', category: ['clothing'] },
  { name: 'Levi\'s', category: ['clothing'], popular: true },
  { name: 'Wrangler', category: ['clothing'] },
  { name: 'Lee', category: ['clothing'] },
  { name: 'Diesel', category: ['clothing'] },
  { name: 'Guess', category: ['clothing'] },
  { name: 'Armani Exchange', category: ['clothing'] },
  { name: 'Hugo Boss', category: ['clothing'] },
  { name: 'Versace', category: ['clothing'] },
  { name: 'Emporio Armani', category: ['clothing'] },

  // Shoes Brands
  { name: 'Nike', category: ['shoes'], popular: true },
  { name: 'Adidas', category: ['shoes'], popular: true },
  { name: 'Puma', category: ['shoes'], popular: true },
  { name: 'New Balance', category: ['shoes'], popular: true },
  { name: 'Converse', category: ['shoes'], popular: true },
  { name: 'Vans', category: ['shoes'], popular: true },
  { name: 'Reebok', category: ['shoes'] },
  { name: 'Fila', category: ['shoes'] },
  { name: 'Skechers', category: ['shoes'], popular: true },
  { name: 'Crocs', category: ['shoes'], popular: true },
  { name: 'Birkenstock', category: ['shoes'] },
  { name: 'Dr. Martens', category: ['shoes'] },
  { name: 'Timberland', category: ['shoes'] },
  { name: 'UGG', category: ['shoes'] },
  { name: 'Clarks', category: ['shoes'] },
  { name: 'Ecco', category: ['shoes'] },
  { name: 'Geox', category: ['shoes'] },
  { name: 'Havaianas', category: ['shoes'] },
  { name: 'Teva', category: ['shoes'] },
  { name: 'Naot', category: ['shoes'], hebrew: 'נאות' },

  // Children's Shoes & Clothing
  { name: 'Shoresh', category: ['shoes'], hebrew: 'שורש', popular: true },
  { name: 'Step2Wo', category: ['shoes'], popular: true },
  { name: 'Superfit', category: ['shoes'] },
  { name: 'Bobux', category: ['shoes'] },
  { name: 'Start-Rite', category: ['shoes'] },

  // Luxury Fashion
  { name: 'Gucci', category: ['clothing', 'shoes'] },
  { name: 'Prada', category: ['clothing', 'shoes'] },
  { name: 'Louis Vuitton', category: ['clothing', 'shoes'] },
  { name: 'Chanel', category: ['clothing'] },
  { name: 'Dior', category: ['clothing'] },
  { name: 'Burberry', category: ['clothing'] },
  { name: 'Fendi', category: ['clothing', 'shoes'] },
  { name: 'Balenciaga', category: ['clothing', 'shoes'] },
  { name: 'Saint Laurent', category: ['clothing', 'shoes'] },
  { name: 'Bottega Veneta', category: ['clothing', 'shoes'] },

  // Sportswear
  { name: 'Under Armour', category: ['clothing', 'shoes'] },
  { name: 'Columbia', category: ['clothing', 'shoes'] },
  { name: 'The North Face', category: ['clothing', 'shoes'] },
  { name: 'Patagonia', category: ['clothing'] },
  { name: 'Champion', category: ['clothing'] },
  { name: 'Kappa', category: ['clothing'] },
  { name: 'Umbro', category: ['clothing'] },

  // Children's Clothing
  { name: 'Carter\'s', category: ['clothing'], popular: true },
  { name: 'OshKosh', category: ['clothing'] },
  { name: 'Gymboree', category: ['clothing'] },
  { name: 'Children\'s Place', category: ['clothing'] },
  { name: 'Next Kids', category: ['clothing'] },
  { name: 'Mothercare', category: ['clothing'] },

  // Soft Toys Brands
  { name: 'Teddy Bear', category: ['toys'], hebrew: 'דובי' },
  { name: 'Build-A-Bear', category: ['toys'] },
  { name: 'Ty Beanie Babies', category: ['toys'], popular: true },
  { name: 'Steiff', category: ['toys'] },
  { name: 'Jellycat', category: ['toys'] },
  { name: 'Gund', category: ['toys'] },
  { name: 'Disney Plush', category: ['toys'], popular: true },
  { name: 'Hello Kitty', category: ['toys'], popular: true },
  { name: 'Pokemon Plush', category: ['toys'], popular: true },
  { name: 'Care Bears', category: ['toys'] },
  { name: 'My Little Pony', category: ['toys'] },
  { name: 'Winnie the Pooh', category: ['toys'] },
  { name: 'Minions', category: ['toys'] },
  { name: 'Frozen Characters', category: ['toys'], popular: true },

  // Book Publishers (Hebrew & English)
  { name: 'Kinneret', category: ['books'], hebrew: 'כנרת' },
  { name: 'Am Oved', category: ['books'], hebrew: 'עם עובד' },
  { name: 'Sifriat Poalim', category: ['books'], hebrew: 'ספריית פועלים' },
  { name: 'Yedioth Books', category: ['books'], hebrew: 'ידיעות ספרים' },
  { name: 'Miskal', category: ['books'], hebrew: 'מסקל' },
  { name: 'Hakibbutz Hameuchad', category: ['books'], hebrew: 'הקיבוץ המאוחד' },
  { name: 'Zmora Bitan', category: ['books'], hebrew: 'זמורה ביתן' },
  { name: 'Korim', category: ['books'], hebrew: 'קורים' },
  { name: 'Penguin Random House', category: ['books'] },
  { name: 'HarperCollins', category: ['books'] },
  { name: 'Simon & Schuster', category: ['books'] },
  { name: 'Scholastic', category: ['books'] },
  { name: 'Macmillan', category: ['books'] },
  { name: 'Oxford University Press', category: ['books'] },
  { name: 'Cambridge University Press', category: ['books'] },
  
  // Generic/Other
  { name: 'Vintage', category: ['clothing', 'shoes', 'toys', 'books'], hebrew: 'וינטג\'', popular: true },
  { name: 'No Brand', category: ['clothing', 'shoes', 'toys', 'books'], hebrew: 'ללא מותג', popular: true },
  { name: 'Handmade', category: ['clothing', 'toys'], hebrew: 'עבודת יד' },
  { name: 'Unknown', category: ['clothing', 'shoes', 'toys', 'books'], hebrew: 'לא ידוע' },
];

// Helper functions
export function getBrandsByCategory(category: string): Brand[] {
  return israeliBrands.filter(brand => brand.category.includes(category));
}

export function getPopularBrands(): Brand[] {
  return israeliBrands.filter(brand => brand.popular);
}

export function searchBrands(query: string, category?: string): Brand[] {
  const filteredBrands = category 
    ? getBrandsByCategory(category) 
    : israeliBrands;
    
  if (!query) return filteredBrands;
  
  const searchTerm = query.toLowerCase();
  return filteredBrands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm) ||
    (brand.hebrew && brand.hebrew.includes(searchTerm))
  );
}

export function getBrandDisplayName(brand: Brand, isHebrew: boolean = false): string {
  if (isHebrew && brand.hebrew) {
    return `${brand.hebrew} (${brand.name})`;
  }
  return brand.name;
}

export default israeliBrands;