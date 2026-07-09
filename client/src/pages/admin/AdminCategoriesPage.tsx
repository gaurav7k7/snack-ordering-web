import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from '@/redux/api/categoriesApi';

export default function AdminCategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery({ includeInactive: true });
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const categories = data?.data?.categories ?? [];

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      await createCategory({ name: name.trim(), description: description.trim() }).unwrap();
      toast.success('Category created.');
      setName('');
      setDescription('');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to create category.');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateCategory({ id, isActive: !isActive }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to update category.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteCategory(id).unwrap();
      toast.success('Category deleted.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to delete category.');
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Categories | SnackCo Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} — required before adding products.
        </p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold">Name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Beverages"
            className="w-56 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="grid flex-1 min-w-[200px] gap-1.5 text-sm">
          <span className="font-semibold">Description (optional)</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Cold drinks and juices"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <Button type="submit" disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" /> {isCreating ? 'Adding…' : 'Add category'}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Loading categories…
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No categories yet. Add your first one above.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-semibold">{category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{category.description || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(category._id, category.isActive)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        category.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(category._id, category.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
