import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import { ProductImageUploader } from '@/components/admin/ProductImageUploader';
import { PageLoader } from '@/components/shared/PageLoader';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi';
import {
  useCreateProductMutation,
  useGetProductByIdForAdminQuery,
  useUpdateProductMutation,
} from '@/redux/api/adminProductsApi';
import { useGetBrandsQuery, useGetSubCategoriesQuery, useGetTagsQuery } from '@/redux/api/taxonomyApi';
import type { ProductFormInput } from '@/types/product';
import { getErrorMessage } from '@/utils/getErrorMessage';

const EMPTY_FORM: ProductFormInput = {
  name: '',
  slug: '',
  description: '',
  ingredients: [],
  weight: '',
  nutritionFacts: {
    servingSize: '',
    calories: 0,
    protein: '',
    carbs: '',
    fat: '',
    sugar: '',
    sodium: '',
  },
  mrp: 0,
  discount: 0,
  offerPrice: 0,
  images: [],
  category: '',
  subCategory: '',
  stock: 0,
  availableQuantity: 0,
  sku: '',
  brand: '',
  tags: [],
  isActive: true,
  isFeatured: false,
  isTrending: false,
  isBestSeller: false,
  deliveryEstimate: '2-4 business days',
  returnPolicy: '7-day replacement if unopened.',
  shippingInformation: 'Ships within 24 hours.',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function FieldLabel({ children }: { children: string }) {
  return <span className="text-sm font-semibold">{children}</span>;
}

const inputClass =
  'rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary';

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: categoriesData } = useGetCategoriesQuery({ includeInactive: true });
  const categories = categoriesData?.data?.categories ?? [];

  const { data: brandsData } = useGetBrandsQuery({ includeInactive: true });
  const brands = brandsData?.data?.brands ?? [];

  const { data: tagsData } = useGetTagsQuery({ includeInactive: true });
  const tags = tagsData?.data?.tags ?? [];

  const { data: existingData, isLoading: isLoadingExisting } = useGetProductByIdForAdminQuery(id ?? '', {
    skip: !isEditMode,
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [form, setForm] = useState<ProductFormInput>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const { data: subCategoriesData } = useGetSubCategoriesQuery(
    { category: form.category, includeInactive: true },
    { skip: !form.category },
  );
  const subCategories = subCategoriesData?.data?.subCategories ?? [];

  useEffect(() => {
    const product = existingData?.data?.product;
    if (!product) return;

    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      ingredients: product.ingredients,
      weight: product.weight,
      nutritionFacts: product.nutritionFacts,
      mrp: product.mrp,
      discount: product.discount,
      offerPrice: product.offerPrice,
      images: product.images,
      category: typeof product.category === 'string' ? product.category : product.category?._id ?? '',
      subCategory: product.subCategory,
      stock: product.stock,
      availableQuantity: product.availableQuantity,
      sku: product.sku,
      brand: product.brand,
      tags: product.tags,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isTrending: product.isTrending,
      isBestSeller: product.isBestSeller,
      deliveryEstimate: product.deliveryEstimate,
      returnPolicy: product.returnPolicy,
      shippingInformation: product.shippingInformation,
    });
    setIngredientsInput(product.ingredients.join(', '));
    setTagsInput(product.tags.join(', '));
    setSlugTouched(true);
  }, [existingData]);

  const computedOfferPrice = useMemo(() => {
    if (!form.mrp) return form.offerPrice;
    return Math.round(form.mrp * (1 - form.discount / 100));
  }, [form.mrp, form.discount]);

  const handleNameChange = (name: string) => {
    setForm((current) => ({
      ...current,
      name,
      slug: slugTouched ? current.slug : slugify(name),
    }));
  };

  const handlePricingChange = (field: 'mrp' | 'discount', value: number) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      next.offerPrice = Math.round(next.mrp * (1 - next.discount / 100));
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.category) {
      toast.error('Please select a category.');
      return;
    }
    if (form.images.length === 0) {
      toast.error('Add at least one product image.');
      return;
    }

    const payload: ProductFormInput = {
      ...form,
      ingredients: ingredientsInput.split(',').map((value) => value.trim()).filter(Boolean),
      tags: tagsInput.split(',').map((value) => value.trim()).filter(Boolean),
      stock: form.availableQuantity,
      offerPrice: computedOfferPrice,
    };

    try {
      if (isEditMode && id) {
        await updateProduct({ id, ...payload }).unwrap();
        toast.success('Product updated.');
      } else {
        await createProduct(payload).unwrap();
        toast.success('Product created.');
      }
      navigate(ROUTES.adminProducts);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to save product.'));
    }
  };

  if (isEditMode && isLoadingExisting) {
    return <PageLoader />;
  }

  return (
    <section className="space-y-6">
      <Helmet>
        <title>{isEditMode ? 'Edit product' : 'Add product'} | SnackCo Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">{isEditMode ? 'Edit product' : 'Add product'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditMode ? `Editing ${form.name || 'product'}` : 'Create a new product in your catalog.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-black">Basic information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <FieldLabel>Name</FieldLabel>
              <input
                required
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Slug</FieldLabel>
              <input
                required
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setForm((current) => ({ ...current, slug: event.target.value }));
                }}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Brand</FieldLabel>
              <select
                required
                value={form.brand}
                onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
                className={inputClass}
              >
                <option value="">Select a brand</option>
                {form.brand && !brands.some((brand) => brand.name === form.brand) && (
                  <option value={form.brand}>{form.brand} (not in brand list)</option>
                )}
                {brands.map((brand) => (
                  <option key={brand._id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">
                Manage brands under Categories → Brands.
              </span>
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>SKU</FieldLabel>
              <input
                required
                value={form.sku}
                onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value.toUpperCase() }))}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Category</FieldLabel>
              <select
                required
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value, subCategory: '' }))
                }
                className={inputClass}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Sub-category</FieldLabel>
              <select
                required
                disabled={!form.category}
                value={form.subCategory}
                onChange={(event) => setForm((current) => ({ ...current, subCategory: event.target.value }))}
                className={inputClass}
              >
                <option value="">{form.category ? 'Select a subcategory' : 'Select a category first'}</option>
                {form.subCategory && !subCategories.some((sub) => sub.name === form.subCategory) && (
                  <option value={form.subCategory}>{form.subCategory} (not in subcategory list)</option>
                )}
                {subCategories.map((subCategory) => (
                  <option key={subCategory._id} value={subCategory.name}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">
                Manage subcategories under Categories → Subcategories.
              </span>
            </label>
          </div>
          <label className="mt-4 grid gap-1.5">
            <FieldLabel>Description</FieldLabel>
            <textarea
              required
              minLength={20}
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className={inputClass}
            />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <FieldLabel>Ingredients (comma-separated)</FieldLabel>
              <input
                value={ingredientsInput}
                onChange={(event) => setIngredientsInput(event.target.value)}
                placeholder="Potato, Sunflower oil, Salt"
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Tags (comma-separated)</FieldLabel>
              <input
                list="taxonomy-tag-options"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="chips, spicy, best seller"
                className={inputClass}
              />
              <datalist id="taxonomy-tag-options">
                {tags.map((tag) => (
                  <option key={tag._id} value={tag.name} />
                ))}
              </datalist>
              <span className="text-xs text-muted-foreground">
                Manage tags under Categories → Tags.
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-black">Images</h2>
          <div className="mt-4">
            <ProductImageUploader
              images={form.images}
              onChange={(images) => setForm((current) => ({ ...current, images }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-black">Pricing &amp; inventory</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-1.5">
              <FieldLabel>MRP (₹)</FieldLabel>
              <input
                required
                type="number"
                min={0}
                value={form.mrp}
                onChange={(event) => handlePricingChange('mrp', Number(event.target.value))}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Discount (%)</FieldLabel>
              <input
                type="number"
                min={0}
                max={100}
                value={form.discount}
                onChange={(event) => handlePricingChange('discount', Number(event.target.value))}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Offer price (₹)</FieldLabel>
              <input
                readOnly
                value={computedOfferPrice}
                className={`${inputClass} bg-muted text-muted-foreground`}
              />
              <span className="text-xs text-muted-foreground">Auto-calculated from MRP and discount.</span>
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Weight / size</FieldLabel>
              <input
                required
                value={form.weight}
                onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
                placeholder="150g"
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Stock quantity</FieldLabel>
              <input
                required
                type="number"
                min={0}
                value={form.availableQuantity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, availableQuantity: Number(event.target.value) }))
                }
                className={inputClass}
              />
              <span className="text-xs text-muted-foreground">
                {form.availableQuantity <= 0
                  ? 'Will show as out of stock.'
                  : form.availableQuantity <= 10
                    ? 'Will show as low stock.'
                    : 'In stock.'}
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-black">Nutrition facts</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <label className="grid gap-1.5">
              <FieldLabel>Serving size</FieldLabel>
              <input
                required
                value={form.nutritionFacts.servingSize}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nutritionFacts: { ...current.nutritionFacts, servingSize: event.target.value },
                  }))
                }
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Calories</FieldLabel>
              <input
                required
                type="number"
                min={0}
                value={form.nutritionFacts.calories}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nutritionFacts: { ...current.nutritionFacts, calories: Number(event.target.value) },
                  }))
                }
                className={inputClass}
              />
            </label>
            {(['protein', 'carbs', 'fat', 'sugar', 'sodium'] as const).map((field) => (
              <label key={field} className="grid gap-1.5">
                <FieldLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</FieldLabel>
                <input
                  required
                  value={form.nutritionFacts[field]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nutritionFacts: { ...current.nutritionFacts, [field]: event.target.value },
                    }))
                  }
                  placeholder={field === 'sodium' ? '180mg' : '3g'}
                  className={inputClass}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-black">Delivery &amp; policies</h2>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5">
              <FieldLabel>Delivery estimate</FieldLabel>
              <input
                required
                value={form.deliveryEstimate}
                onChange={(event) => setForm((current) => ({ ...current, deliveryEstimate: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Return policy</FieldLabel>
              <textarea
                required
                rows={2}
                value={form.returnPolicy}
                onChange={(event) => setForm((current) => ({ ...current, returnPolicy: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5">
              <FieldLabel>Shipping information</FieldLabel>
              <textarea
                required
                rows={2}
                value={form.shippingInformation}
                onChange={(event) =>
                  setForm((current) => ({ ...current, shippingInformation: event.target.value }))
                }
                className={inputClass}
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-black">Status &amp; merchandising</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ['isActive', 'Active (published)'],
                ['isFeatured', 'Featured product'],
                ['isTrending', 'Trending product'],
                ['isBestSeller', 'Best seller'],
              ] as const
            ).map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={form[field]}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.adminProducts)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? 'Saving…' : isEditMode ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </form>
    </section>
  );
}
