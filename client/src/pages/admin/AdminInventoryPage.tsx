import { AlertTriangle, PackageX } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

import { TableSkeletonRows } from '@/components/admin/TableSkeletonRows';
import { SearchPagination } from '@/components/shared/SearchPagination';
import { useGetAllProductsForAdminQuery, useUpdateProductMutation } from '@/redux/api/adminProductsApi';
import { cldUrl } from '@/utils/cloudinaryImage';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatCurrency';
import { getErrorMessage } from '@/utils/getErrorMessage';

const TABS: Array<{ label: string; value?: 'low' | 'out' }> = [
  { label: 'All products' },
  { label: 'Low stock', value: 'low' },
  { label: 'Out of stock', value: 'out' },
];

function StockInput({ productId, value }: { productId: string; value: number }) {
  const [localValue, setLocalValue] = useState(value);
  const [updateProduct, { isLoading }] = useUpdateProductMutation();

  const commit = async () => {
    if (localValue === value) return;
    try {
      await updateProduct({ id: productId, availableQuantity: localValue, stock: localValue }).unwrap();
      toast.success('Stock updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update stock.'));
      setLocalValue(value);
    }
  };

  return (
    <input
      type="number"
      min={0}
      value={localValue}
      disabled={isLoading}
      onChange={(event) => setLocalValue(Number(event.target.value))}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
      }}
      className="h-9 w-24 rounded-lg border border-input bg-background px-2 text-sm outline-none focus:border-primary"
    />
  );
}

export default function AdminInventoryPage() {
  const [tab, setTab] = useState<'low' | 'out' | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetAllProductsForAdminQuery({ stockFilter: tab, page });
  const products = data?.data?.products ?? [];
  const pagination = data?.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Inventory | Lotus Delight Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage stock levels and keep an eye on low and out-of-stock products.
        </p>
      </div>

      <div className="flex gap-2">
        {TABS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setTab(item.value);
              setPage(1);
            }}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-semibold transition',
              tab === item.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/70 bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Stock quantity</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows columns={5} />
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nothing here — every product is well stocked.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isOutOfStock = product.availableQuantity <= 0;
                const isLowStock = !isOutOfStock && product.availableQuantity <= 10;

                return (
                  <tr key={product._id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={cldUrl(product.images?.[0]?.url, 'avatar')} alt="" loading="lazy" className="h-10 w-10 rounded-lg object-cover" />
                        <p className="font-semibold">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.sku}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(product.offerPrice)}</td>
                    <td className="px-4 py-3">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600">
                          <PackageX className="h-3 w-3" /> Out of stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
                          <AlertTriangle className="h-3 w-3" /> Low stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          In stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StockInput productId={product._id} value={product.availableQuantity} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <SearchPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </section>
  );
}
