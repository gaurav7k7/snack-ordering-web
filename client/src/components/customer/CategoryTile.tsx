import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { CategoryTile as CategoryTileType } from '@/types/home';

type CategoryTileProps = {
  category: CategoryTileType;
};

export function CategoryTile({ category }: CategoryTileProps) {
  return (
    <Link
      to={`/products?category=${category.id}`}
      className="group relative isolate block overflow-hidden rounded-lg border bg-card"
    >
      <img
        src={category.image}
        alt={category.name}
        loading="lazy"
        className="aspect-[5/4] w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-white">
        <div>
          <h3 className="text-lg font-bold">{category.name}</h3>
          <p className="text-sm text-white/80">{category.itemCount} products</p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-foreground">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
