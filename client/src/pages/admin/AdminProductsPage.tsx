import {
  AlertTriangle,
  Download,
  Pencil,
  Plus,
  Star,
  Trash2,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { StatusPill } from '@/components/admin/StatusPill';
import { RefreshingIndicator, TableStateRow } from '@/components/admin/TableStateRow';
import { SearchPagination } from '@/components/customer/SearchPagination';
import { Button } from '@/components/ui/button';
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi';
import {
  useDeleteProductMutation,
  useGetAllProductsForAdminQuery,
  useLazyExportProductsQuery,
  useUpdateProductMutation,
  useBulkImportProductsMutation,
} from '@/redux/api/adminProductsApi';
import type { BulkImportResult } from '@/redux/api/adminProductsApi';
import { cldUrl } from '@/utils/cloudinaryImage';
import { cn } from '@/utils/cn';
import { downloadCsv } from '@/utils/csv';
import { exportProductsToCsv, generateProductCsvTemplate, parseProductsCsv } from '@/utils/productCsv';
import { formatCurrency } from '@/utils/formatCurrency';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('');
  const [page, setPage] = useState(1);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData } = useGetCategoriesQuery({ includeInactive: true });
  const categories = categoriesData?.data?.categories ?? [];

  const { data, isLoading, isFetching } = useGetAllProductsForAdminQuery({
    search: search || undefined,
    category: category || undefined,
    status: status || undefined,
    page,
  });
  const products = data?.data?.products ?? [];
  const pagination = data?.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 };

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [triggerExport, { isFetching: isExporting }] = useLazyExportProductsQuery();
  const [bulkImport] = useBulkImportProductsMutation();

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleToggle = async (id: string, field: 'isFeatured' | 'isTrending' | 'isActive', value: boolean) => {
    try {
      await updateProduct({ id, [field]: !value }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to update product.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success('Product deleted.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to delete product.');
    }
  };

  const handleExport = async () => {
    try {
      const result = await triggerExport().unwrap();
      const products = result.data?.products ?? [];
      downloadCsv(`snackco-products-${new Date().toISOString().slice(0, 10)}.csv`, exportProductsToCsv(products));
      toast.success(`Exported ${products.length} products.`);
    } catch {
      toast.error('Unable to export products.');
    }
  };

  const handleDownloadTemplate = () => {
    downloadCsv('snackco-product-import-template.csv', generateProductCsvTemplate());
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const rows = parseProductsCsv(text);
      if (!rows.length) {
        toast.error('No rows found in that file.');
        return;
      }
      const result = await bulkImport({ products: rows }).unwrap();
      setImportResult(result.data ?? null);
      if (result.data) {
        toast.success(`Imported ${result.data.created} of ${rows.length} products.`);
      }
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to process that file.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Manage Products | SnackCo Admin</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination.total} product{pagination.total === 1 ? '' : 's'} in your catalog.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            CSV template
          </Button>
          <Button variant="outline" disabled={isImporting} onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> {isImporting ? 'Importing…' : 'Bulk import'}
          </Button>
          <Button variant="outline" disabled={isExporting} onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> {isExporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button asChild>
            <Link to="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" /> Add product
            </Link>
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={handleImportFile} />
        </div>
      </div>

      {importResult && (
        <div className="rounded-2xl border border-border/70 bg-card p-4 text-sm shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold">
              Import complete: {importResult.created} created, {importResult.failed.length} failed.
            </p>
            <button type="button" onClick={() => setImportResult(null)} className="text-muted-foreground hover:text-foreground">
              Dismiss
            </button>
          </div>
          {importResult.failed.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-destructive">
              {importResult.failed.map((failure) => (
                <li key={failure.row}>
                  Row {failure.row}{failure.sku ? ` (${failure.sku})` : ''}: {failure.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 min-w-[220px] gap-2">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name, brand, SKU…"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <Button type="submit" variant="outline">Search</Button>
        </form>
        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as 'active' | 'inactive' | '');
            setPage(1);
          }}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Flags</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableStateRow colSpan={7}>Loading products…</TableStateRow>
            ) : products.length === 0 ? (
              <TableStateRow colSpan={7}>No products match this filter.</TableStateRow>
            ) : (
              products.map((product) => {
                const isOutOfStock = product.availableQuantity <= 0;
                const isLowStock = !isOutOfStock && product.availableQuantity <= 10;
                const categoryName =
                  typeof product.category === 'string' ? product.category : product.category?.name;

                return (
                  <tr key={product._id} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={cldUrl(product.images?.[0]?.url, 'avatar')}
                          alt=""
                          loading="lazy"
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{categoryName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{formatCurrency(product.offerPrice)}</p>
                      {product.discount > 0 && (
                        <p className="text-xs text-muted-foreground line-through">{formatCurrency(product.mrp)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill tone={isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'}>
                        {isOutOfStock && <AlertTriangle className="h-3 w-3" />}
                        {product.availableQuantity}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          title="Toggle featured"
                          onClick={() => handleToggle(product._id, 'isFeatured', product.isFeatured)}
                          className={cn(
                            'grid h-7 w-7 place-items-center rounded-full transition',
                            product.isFeatured ? 'bg-amber-500/15 text-amber-600' : 'bg-muted text-muted-foreground',
                          )}
                        >
                          <Star className="h-3.5 w-3.5" fill={product.isFeatured ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          type="button"
                          title="Toggle trending"
                          onClick={() => handleToggle(product._id, 'isTrending', product.isTrending)}
                          className={cn(
                            'grid h-7 w-7 place-items-center rounded-full transition',
                            product.isTrending ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                          )}
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        tone={product.isActive ? 'success' : 'neutral'}
                        onClick={() => handleToggle(product._id, 'isActive', product.isActive)}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/admin/products/${product._id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(product._id, product.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {isFetching && !isLoading && <RefreshingIndicator />}
      </div>

      {pagination.totalPages > 1 && (
        <SearchPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </section>
  );
}
