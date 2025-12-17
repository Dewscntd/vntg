'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Department {
  id: string;
  key: string;
  href: string;
}

interface DepartmentGroup {
  id: string;
  key: string;
  departments: Department[];
}

const departmentGroups: DepartmentGroup[] = [
  {
    id: 'clothing',
    key: 'clothing',
    departments: [
      { id: 'tops', key: 'tops', href: '/products?type=tops' },
      { id: 'bottoms', key: 'bottoms', href: '/products?type=bottoms' },
      { id: 'dresses', key: 'dresses', href: '/products?type=dresses' },
      { id: 'outerwear', key: 'outerwear', href: '/products?type=outerwear' },
      { id: 'activewear', key: 'activewear', href: '/products?type=activewear' },
    ],
  },
  {
    id: 'accessories',
    key: 'accessoriesGroup',
    departments: [
      { id: 'bags', key: 'bags', href: '/products?type=bags' },
      { id: 'jewelry', key: 'jewelry', href: '/products?type=jewelry' },
      { id: 'belts', key: 'belts', href: '/products?type=belts' },
      { id: 'hats', key: 'hats', href: '/products?type=hats' },
      { id: 'scarves', key: 'scarves', href: '/products?type=scarves' },
    ],
  },
  {
    id: 'footwear',
    key: 'footwear',
    departments: [
      { id: 'sneakers', key: 'sneakers', href: '/products?type=sneakers' },
      { id: 'boots', key: 'boots', href: '/products?type=boots' },
      { id: 'sandals', key: 'sandals', href: '/products?type=sandals' },
      { id: 'heels', key: 'heels', href: '/products?type=heels' },
      { id: 'flats', key: 'flats', href: '/products?type=flats' },
    ],
  },
  {
    id: 'lifestyle',
    key: 'lifestyle',
    departments: [
      { id: 'books', key: 'books', href: '/products?type=books' },
      { id: 'vinyl', key: 'vinyl', href: '/products?type=vinyl' },
      { id: 'homeDecor', key: 'homeDecor', href: '/products?type=home' },
      { id: 'toys', key: 'toys', href: '/products?type=toys' },
      { id: 'games', key: 'games', href: '/products?type=games' },
    ],
  },
];

export function ShopDepartments() {
  const t = useTranslations('shopPage.departments');

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Section header */}
        <h2 className="mb-12 text-3xl font-light tracking-tight text-foreground md:mb-16 md:text-4xl">
          {t('title')}
        </h2>

        {/* Department grid - clean lists */}
        <div className="grid gap-12 md:grid-cols-4 md:gap-8">
          {departmentGroups.map((group) => (
            <div key={group.id}>
              {/* Group title */}
              <h3 className="mb-6 text-sm uppercase tracking-widest text-foreground">
                {t(`groups.${group.key}.title`)}
              </h3>

              {/* Clean list */}
              <ul className="space-y-4">
                {group.departments.map((dept) => (
                  <li key={dept.id}>
                    <Link
                      href={dept.href}
                      className="text-base text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t(`items.${dept.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* View all */}
              <Link
                href={`/products?department=${group.id}`}
                className="mt-8 inline-block border-b border-foreground pb-0.5 text-sm uppercase tracking-widest text-foreground"
              >
                {t('viewAll')}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
