import { ArrowDown, ArrowUp, ImageOff, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

import { EntityImageUploader } from '@/components/admin/EntityImageUploader';
import { StatusPill } from '@/components/admin/StatusPill';
import { Button } from '@/components/ui/button';
import {
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useGetBannersQuery,
  useUpdateBannerMutation,
} from '@/redux/api/bannersApi';
import type { Banner } from '@/types/banner';
import { cldUrl } from '@/utils/cloudinaryImage';
import { formatDate } from '@/utils/formatDate';
import { getErrorMessage } from '@/utils/getErrorMessage';

type BannerImage = { url: string; publicId?: string; alt?: string };

type BannerDraft = {
  heading: string;
  subheading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: BannerImage | null;
};

const EMPTY_DRAFT: BannerDraft = {
  heading: '',
  subheading: '',
  description: '',
  buttonText: '',
  buttonLink: '',
  image: null,
};

function toDraft(banner: Banner): BannerDraft {
  return {
    heading: banner.heading ?? '',
    subheading: banner.subheading ?? '',
    description: banner.description ?? '',
    buttonText: banner.buttonText ?? '',
    buttonLink: banner.buttonLink ?? '',
    image: banner.image ?? null,
  };
}

const fieldClass =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary';

function BannerForm({
  draft,
  onChange,
  label,
}: {
  draft: BannerDraft;
  onChange: (next: BannerDraft) => void;
  label: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm">
        <span className="font-semibold">
          Main heading <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <input
          value={draft.heading}
          onChange={(event) => onChange({ ...draft, heading: event.target.value })}
          placeholder="Leave empty to show only the image"
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-semibold">
          Sub heading <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <input
          value={draft.subheading}
          onChange={(event) => onChange({ ...draft, subheading: event.target.value })}
          className={fieldClass}
        />
      </label>
      <label className="col-span-full grid gap-1.5 text-sm">
        <span className="font-semibold">
          Description <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <textarea
          rows={2}
          value={draft.description}
          onChange={(event) => onChange({ ...draft, description: event.target.value })}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-semibold">
          Button text <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <input
          value={draft.buttonText}
          onChange={(event) => onChange({ ...draft, buttonText: event.target.value })}
          placeholder="Shop now"
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-semibold">
          Button link <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <input
          value={draft.buttonLink}
          onChange={(event) => onChange({ ...draft, buttonLink: event.target.value })}
          placeholder="/products?category=popcorn"
          className={fieldClass}
        />
      </label>
      <div className="col-span-full grid gap-1.5 text-sm">
        <span className="font-semibold">Banner image</span>
        <p className="text-xs text-muted-foreground">
          The homepage banner now displays at full width using the image's own aspect ratio (no cropping). For a
          premium wide look, upload a landscape image — recommended around 1920×600px (roughly 3:1).
        </p>
        <div className="flex items-center gap-3">
          <EntityImageUploader
            imageUrl={draft.image?.url}
            label={label}
            onUpload={(image) => onChange({ ...draft, image })}
          />
          {draft.image ? (
            <button
              type="button"
              onClick={() => onChange({ ...draft, image: null })}
              className="text-xs font-semibold text-destructive hover:underline"
            >
              Remove image
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BannerCard({
  banner,
  isFirst,
  isLast,
  onMove,
}: {
  banner: Banner;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: 'up' | 'down') => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<BannerDraft>(() => toDraft(banner));
  const [updateBanner, { isLoading: isSaving }] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const handleEdit = () => {
    setDraft(toDraft(banner));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(toDraft(banner));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!draft.heading.trim() && !draft.image) {
      toast.error('Provide at least a banner image or a heading.');
      return;
    }
    if ((draft.buttonText.trim() && !draft.buttonLink.trim()) || (draft.buttonLink.trim() && !draft.buttonText.trim())) {
      toast.error('Provide both button text and button link, or leave both empty.');
      return;
    }
    try {
      await updateBanner({
        id: banner._id,
        heading: draft.heading.trim(),
        subheading: draft.subheading.trim(),
        description: draft.description.trim(),
        buttonText: draft.buttonText.trim(),
        buttonLink: draft.buttonLink.trim(),
        image: draft.image,
      }).unwrap();
      toast.success('Banner updated.');
      setIsEditing(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update banner.'));
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateBanner({ id: banner._id, isActive: !banner.isActive }).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update banner.'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete the "${banner.heading || 'untitled'}" banner? This cannot be undone.`)) return;
    try {
      await deleteBanner(banner._id).unwrap();
      toast.success('Banner deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete banner.'));
    }
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-border/70 bg-muted">
            {banner.image?.url ? (
              <img src={cldUrl(banner.image.url, 'card')} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageOff className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="font-bold">
              {banner.heading || <span className="italic text-muted-foreground">Image only — no heading</span>}
            </p>
            {banner.subheading ? <p className="text-sm text-muted-foreground">{banner.subheading}</p> : null}
            <p className="mt-1 text-xs text-muted-foreground">
              Order {banner.order + 1} · Last updated {formatDate(banner.updatedAt, 'long')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <StatusPill tone={banner.isActive ? 'success' : 'neutral'} onClick={handleToggleActive}>
            {banner.isActive ? 'Active' : 'Inactive'}
          </StatusPill>
          <Button type="button" variant="ghost" size="sm" disabled={isFirst} onClick={() => onMove('up')} title="Move up">
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={isLast} onClick={() => onMove('down')} title="Move down">
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          {!isEditing ? (
            <Button type="button" variant="outline" size="sm" onClick={handleEdit}>
              Edit
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-5 border-t border-border/70 pt-5">
          <BannerForm draft={draft} onChange={setDraft} label={banner.heading || 'this banner'} />
          <div className="mt-4 flex gap-2">
            <Button type="button" size="sm" disabled={isSaving} onClick={handleSave}>
              {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              Reset / Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NewBannerCard({ nextOrder, onDone }: { nextOrder: number; onDone: () => void }) {
  const [draft, setDraft] = useState<BannerDraft>(EMPTY_DRAFT);
  const [createBanner, { isLoading }] = useCreateBannerMutation();

  const handleCreate = async () => {
    if (!draft.heading.trim() && !draft.image) {
      toast.error('Provide at least a banner image or a heading.');
      return;
    }
    if ((draft.buttonText.trim() && !draft.buttonLink.trim()) || (draft.buttonLink.trim() && !draft.buttonText.trim())) {
      toast.error('Provide both button text and button link, or leave both empty.');
      return;
    }
    try {
      await createBanner({
        heading: draft.heading.trim(),
        subheading: draft.subheading.trim() || undefined,
        description: draft.description.trim() || undefined,
        buttonText: draft.buttonText.trim() || undefined,
        buttonLink: draft.buttonLink.trim() || undefined,
        image: draft.image ?? undefined,
        order: nextOrder,
      }).unwrap();
      toast.success('Banner created.');
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to create banner.'));
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-bold">New banner</p>
        <Button type="button" variant="ghost" size="icon" aria-label="Cancel new banner" onClick={onDone}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <BannerForm draft={draft} onChange={setDraft} label="new banner" />
      <div className="mt-4 flex gap-2">
        <Button type="button" size="sm" disabled={isLoading} onClick={handleCreate}>
          {isLoading ? 'Creating…' : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Reset / Cancel
        </Button>
      </div>
    </div>
  );
}

export default function AdminBannersPage() {
  const { data, isLoading } = useGetBannersQuery({ includeInactive: true });
  const [updateBanner] = useUpdateBannerMutation();
  const [isAdding, setIsAdding] = useState(false);

  const banners = [...(data?.data?.banners ?? [])].sort((a, b) => a.order - b.order);

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const current = banners[index];
    const target = banners[targetIndex];
    try {
      await Promise.all([
        updateBanner({ id: current._id, order: target.order }).unwrap(),
        updateBanner({ id: target._id, order: current.order }).unwrap(),
      ]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to reorder banners.'));
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Homepage Banners | Lotus Delight Admin</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Homepage banners</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the hero banners shown at the top of the homepage. Changes appear immediately.
          </p>
        </div>
        {!isAdding ? (
          <Button type="button" onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add banner
          </Button>
        ) : null}
      </div>

      {isAdding ? <NewBannerCard nextOrder={banners.length} onDone={() => setIsAdding(false)} /> : null}

      {isLoading ? (
        <div className="rounded-2xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
          Loading banners…
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
          No banners yet. Add your first one above.
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <BannerCard
              key={banner._id}
              banner={banner}
              isFirst={index === 0}
              isLast={index === banners.length - 1}
              onMove={(direction) => handleMove(index, direction)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
