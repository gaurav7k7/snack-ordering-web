import { Trophy } from 'lucide-react';

import { formatCurrency } from '@/utils/formatCurrency';

type TopProduct = {
  _id: string;
  name: string;
  image?: string;
  totalQuantity: number;
  totalRevenue: number;
};

export function TopSellingProducts({ products }: { products: TopProduct[] }) {
  if (!products.length) {
    return <p className="text-sm text-muted-foreground">No sales yet.</p>;
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div key={product._id} className="flex items-center gap-3 rounded-xl border border-border/70 bg-background p-3">
          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
            {index === 0 ? <Trophy className="h-3.5 w-3.5 text-amber-500" /> : index + 1}
          </div>
          <img src={product.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.totalQuantity} sold</p>
          </div>
          <p className="shrink-0 text-sm font-semibold">{formatCurrency(product.totalRevenue)}</p>
        </div>
      ))}
    </div>
  );
}
