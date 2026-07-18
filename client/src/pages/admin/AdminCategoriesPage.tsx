import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

import { EntityImageUploader } from '@/components/admin/EntityImageUploader';
import { StatusPill } from '@/components/admin/StatusPill';
import { TableStateRow } from '@/components/admin/TableStateRow';
import { TableSkeletonRows } from '@/components/admin/TableSkeletonRows';
import { Button } from '@/components/ui/button';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from '@/redux/api/categoriesApi';
import {
  useCreateBrandMutation,
  useCreateSubCategoryMutation,
  useCreateTagMutation,
  useDeleteBrandMutation,
  useDeleteSubCategoryMutation,
  useDeleteTagMutation,
  useGetBrandsQuery,
  useGetSubCategoriesQuery,
  useGetTagsQuery,
  useUpdateBrandMutation,
  useUpdateSubCategoryMutation,
  useUpdateTagMutation,
} from '@/redux/api/taxonomyApi';
import { getErrorMessage } from '@/utils/getErrorMessage';

const TABS = ['Categories', 'Subcategories', 'Brands', 'Tags'] as const;
type Tab = (typeof TABS)[number];

const inputClass =
  'w-56 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary';

function CategoriesTab() {
  const { data, isLoading } = useGetCategoriesQuery({ includeInactive: true });
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pendingImage, setPendingImage] = useState<{ url: string; publicId: string } | null>(null);

  const categories = data?.data?.categories ?? [];

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory({
        name: name.trim(),
        description: description.trim(),
        image: pendingImage ?? undefined,
      }).unwrap();
      toast.success('Category created.');
      setName('');
      setDescription('');
      setPendingImage(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to create category.'));
    }
  };

  const handleImageUpload = async (id: string, image: { url: string; publicId: string }) => {
    await updateCategory({ id, image }).unwrap();
  };

  const handleRename = async (id: string, currentName: string) => {
    const next = window.prompt('New category name', currentName);
    if (!next || !next.trim() || next.trim() === currentName) return;
    try {
      await updateCategory({ id, name: next.trim() }).unwrap();
      toast.success('Category renamed.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to rename category.'));
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateCategory({ id, isActive: !isActive }).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update category.'));
    }
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (!window.confirm(`Delete category "${categoryName}"?`)) return;
    try {
      await deleteCategory(id).unwrap();
      toast.success('Category deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete category.'));
    }
  };

  return (
    <>
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold">Name</span>
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Beverages" className={inputClass} />
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
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold">Image (optional)</span>
          <EntityImageUploader
            imageUrl={pendingImage?.url}
            label={name || 'new category'}
            onUpload={(image) => setPendingImage(image)}
          />
        </label>
        <Button type="submit" disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" /> {isCreating ? 'Adding…' : 'Add category'}
        </Button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Image</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows columns={6} />
            ) : categories.length === 0 ? (
              <TableStateRow colSpan={6}>No categories yet. Add your first one above.</TableStateRow>
            ) : (
              categories.map((category) => (
                <tr key={category._id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <EntityImageUploader
                      imageUrl={category.image?.url}
                      label={category.name}
                      onUpload={(image) => handleImageUpload(category._id, image)}
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold">{category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{category.description || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusPill
                      tone={category.isActive ? 'success' : 'neutral'}
                      onClick={() => handleToggleActive(category._id, category.isActive)}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRename(category._id, category.name)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(category._id, category.name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SubCategoriesTab() {
  const { data: categoriesData } = useGetCategoriesQuery({ includeInactive: true });
  const categories = categoriesData?.data?.categories ?? [];

  const { data, isLoading } = useGetSubCategoriesQuery({ includeInactive: true });
  const [createSubCategory, { isLoading: isCreating }] = useCreateSubCategoryMutation();
  const [updateSubCategory] = useUpdateSubCategoryMutation();
  const [deleteSubCategory] = useDeleteSubCategoryMutation();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const subCategories = data?.data?.subCategories ?? [];

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !categoryId) return;
    try {
      await createSubCategory({ name: name.trim(), category: categoryId }).unwrap();
      toast.success('Subcategory created.');
      setName('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to create subcategory.'));
    }
  };

  const handleRename = async (id: string, currentName: string) => {
    const next = window.prompt('New subcategory name', currentName);
    if (!next || !next.trim() || next.trim() === currentName) return;
    try {
      await updateSubCategory({ id, name: next.trim() }).unwrap();
      toast.success('Subcategory renamed. Existing products were updated to match.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to rename subcategory.'));
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateSubCategory({ id, isActive: !isActive }).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update subcategory.'));
    }
  };

  const handleDelete = async (id: string, subName: string) => {
    if (!window.confirm(`Delete subcategory "${subName}"?`)) return;
    try {
      await deleteSubCategory(id).unwrap();
      toast.success('Subcategory deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete subcategory.'));
    }
  };

  return (
    <>
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold">Parent category</span>
          <select required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={inputClass}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold">Name</span>
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Potato Chips" className={inputClass} />
        </label>
        <Button type="submit" disabled={isCreating || !categoryId}>
          <Plus className="mr-2 h-4 w-4" /> {isCreating ? 'Adding…' : 'Add subcategory'}
        </Button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows columns={5} />
            ) : subCategories.length === 0 ? (
              <TableStateRow colSpan={5}>No subcategories yet. Add your first one above.</TableStateRow>
            ) : (
              subCategories.map((subCategory) => (
                <tr key={subCategory._id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-semibold">{subCategory.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {typeof subCategory.category === 'object' ? subCategory.category.name : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{subCategory.slug}</td>
                  <td className="px-4 py-3">
                    <StatusPill
                      tone={subCategory.isActive ? 'success' : 'neutral'}
                      onClick={() => handleToggleActive(subCategory._id, subCategory.isActive)}
                    >
                      {subCategory.isActive ? 'Active' : 'Inactive'}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRename(subCategory._id, subCategory.name)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(subCategory._id, subCategory.name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BrandsTab() {
  const { data, isLoading } = useGetBrandsQuery({ includeInactive: true });
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pendingLogo, setPendingLogo] = useState<{ url: string; publicId: string } | null>(null);

  const brands = data?.data?.brands ?? [];

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await createBrand({
        name: name.trim(),
        description: description.trim(),
        logo: pendingLogo ?? undefined,
      }).unwrap();
      toast.success('Brand created.');
      setName('');
      setDescription('');
      setPendingLogo(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to create brand.'));
    }
  };

  const handleLogoUpload = async (id: string, logo: { url: string; publicId: string }) => {
    await updateBrand({ id, logo }).unwrap();
  };

  const handleRename = async (id: string, currentName: string) => {
    const next = window.prompt('New brand name', currentName);
    if (!next || !next.trim() || next.trim() === currentName) return;
    try {
      await updateBrand({ id, name: next.trim() }).unwrap();
      toast.success('Brand renamed. Existing products were updated to match.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to rename brand.'));
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateBrand({ id, isActive: !isActive }).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update brand.'));
    }
  };

  const handleDelete = async (id: string, brandName: string) => {
    if (!window.confirm(`Delete brand "${brandName}"?`)) return;
    try {
      await deleteBrand(id).unwrap();
      toast.success('Brand deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete brand.'));
    }
  };

  return (
    <>
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold">Name</span>
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Lay's" className={inputClass} />
        </label>
        <label className="grid flex-1 min-w-[200px] gap-1.5 text-sm">
          <span className="font-semibold">Description (optional)</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="PepsiCo snack brand"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold">Logo (optional)</span>
          <EntityImageUploader
            imageUrl={pendingLogo?.url}
            label={name || 'new brand'}
            onUpload={(image) => setPendingLogo(image)}
          />
        </label>
        <Button type="submit" disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" /> {isCreating ? 'Adding…' : 'Add brand'}
        </Button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Logo</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows columns={6} />
            ) : brands.length === 0 ? (
              <TableStateRow colSpan={6}>No brands yet. Add your first one above.</TableStateRow>
            ) : (
              brands.map((brand) => (
                <tr key={brand._id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <EntityImageUploader
                      imageUrl={brand.logo?.url}
                      label={brand.name}
                      onUpload={(image) => handleLogoUpload(brand._id, image)}
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold">{brand.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{brand.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{brand.description || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusPill
                      tone={brand.isActive ? 'success' : 'neutral'}
                      onClick={() => handleToggleActive(brand._id, brand.isActive)}
                    >
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRename(brand._id, brand.name)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(brand._id, brand.name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TagsTab() {
  const { data, isLoading } = useGetTagsQuery({ includeInactive: true });
  const [createTag, { isLoading: isCreating }] = useCreateTagMutation();
  const [updateTag] = useUpdateTagMutation();
  const [deleteTag] = useDeleteTagMutation();

  const [name, setName] = useState('');

  const tags = data?.data?.tags ?? [];

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await createTag({ name: name.trim() }).unwrap();
      toast.success('Tag created.');
      setName('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to create tag.'));
    }
  };

  const handleRename = async (id: string, currentName: string) => {
    const next = window.prompt('New tag name', currentName);
    if (!next || !next.trim() || next.trim().toLowerCase() === currentName) return;
    try {
      await updateTag({ id, name: next.trim() }).unwrap();
      toast.success('Tag renamed. Existing products were updated to match.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to rename tag.'));
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateTag({ id, isActive: !isActive }).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update tag.'));
    }
  };

  const handleDelete = async (id: string, tagName: string) => {
    if (!window.confirm(`Delete tag "${tagName}"? It will be removed from any products using it.`)) return;
    try {
      await deleteTag(id).unwrap();
      toast.success('Tag deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete tag.'));
    }
  };

  return (
    <>
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold">Name</span>
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="spicy" className={inputClass} />
        </label>
        <Button type="submit" disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" /> {isCreating ? 'Adding…' : 'Add tag'}
        </Button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows columns={4} />
            ) : tags.length === 0 ? (
              <TableStateRow colSpan={4}>No tags yet. Add your first one above.</TableStateRow>
            ) : (
              tags.map((tag) => (
                <tr key={tag._id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-semibold">{tag.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tag.slug}</td>
                  <td className="px-4 py-3">
                    <StatusPill
                      tone={tag.isActive ? 'success' : 'neutral'}
                      onClick={() => handleToggleActive(tag._id, tag.isActive)}
                    >
                      {tag.isActive ? 'Active' : 'Inactive'}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRename(tag._id, tag.name)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(tag._id, tag.name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Categories');

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Category Management | Lotus Delight Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">Category Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage categories, subcategories, brands, and tags used across your catalog.
        </p>
      </div>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === tab
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/70 bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Categories' && <CategoriesTab />}
      {activeTab === 'Subcategories' && <SubCategoriesTab />}
      {activeTab === 'Brands' && <BrandsTab />}
      {activeTab === 'Tags' && <TagsTab />}
    </section>
  );
}
