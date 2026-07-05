import { PackageCheck, RotateCcw, Truck } from 'lucide-react';

import type { HomeProduct } from '@/types/home';

type ProductInfoPanelsProps = {
  product: HomeProduct;
};

export function ProductInfoPanels({ product }: ProductInfoPanelsProps) {
  const facts = [
    { label: 'Serving size', value: product.nutritionFacts.servingSize },
    { label: 'Calories', value: `${product.nutritionFacts.calories}` },
    { label: 'Protein', value: product.nutritionFacts.protein },
    { label: 'Carbs', value: product.nutritionFacts.carbs },
    { label: 'Fat', value: product.nutritionFacts.fat },
    { label: 'Sugar', value: product.nutritionFacts.sugar },
    { label: 'Sodium', value: product.nutritionFacts.sodium },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <section className="rounded-lg border bg-card p-5 lg:col-span-2">
        <h2 className="text-xl font-bold">Product details</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Category</dt>
            <dd className="mt-1">{product.category}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Sub category</dt>
            <dd className="mt-1">{product.subCategory}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Brand</dt>
            <dd className="mt-1">{product.brand}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">SKU</dt>
            <dd className="mt-1">{product.sku}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Weight</dt>
            <dd className="mt-1">{product.weight}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">Stock</dt>
            <dd className="mt-1 capitalize">{product.stock.replace('_', ' ')}</dd>
          </div>
        </dl>

        <h3 className="mt-7 font-bold">Ingredients</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.ingredients.map((ingredient) => (
            <span key={ingredient} className="rounded-full border bg-background px-3 py-1 text-sm">
              {ingredient}
            </span>
          ))}
        </div>

        <h3 className="mt-7 font-bold">Nutrition facts</h3>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-md border bg-background p-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="mt-1 font-bold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-xl font-bold">Delivery & policies</h2>
        <div className="mt-5 space-y-5">
          <div className="flex gap-3">
            <Truck className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Delivery estimate</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{product.deliveryEstimate}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <RotateCcw className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Return policy</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{product.returnPolicy}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <PackageCheck className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Shipping information</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{product.shippingInformation}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
