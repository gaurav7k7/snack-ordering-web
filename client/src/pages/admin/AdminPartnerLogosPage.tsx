import { ArrowDown, ArrowUp, ImageOff, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

import { EntityImageUploader } from '@/components/admin/EntityImageUploader';
import { StatusPill } from '@/components/admin/StatusPill';
import { Button } from '@/components/ui/button';
import {
  useCreatePartnerLogoMutation,
  useDeletePartnerLogoMutation,
  useGetPartnerLogosQuery,
  useUpdatePartnerLogoMutation,
} from '@/redux/api/partnerLogosApi';
import type { PartnerLogo, PartnerLogoCategory } from '@/types/partnerLogo';
import { cldUrl } from '@/utils/cloudinaryImage';
import { formatDate } from '@/utils/formatDate';
import { getErrorMessage } from '@/utils/getErrorMessage';

type LogoImage = { url: string; publicId?: string; alt?: string };

type LogoDraft = {
  name: string;
  link: string;
  image: LogoImage | null;
};

const EMPTY_DRAFT: LogoDraft = { name: '', link: '', image: null };

function toDraft(logo: PartnerLogo): LogoDraft {
  return { name: logo.name, link: logo.link ?? '', image: logo.logo ?? null };
}

const fieldClass =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary';

function LogoForm({
  draft,
  onChange,
  label,
}: {
  draft: LogoDraft;
  onChange: (next: LogoDraft) => void;
  label: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm">
        <span className="font-semibold">Name</span>
        <input
          required
          value={draft.name}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          placeholder="Company / publication name"
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-semibold">
          Link <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <input
          value={draft.link}
          onChange={(event) => onChange({ ...draft, link: event.target.value })}
          placeholder="https://example.com"
          className={fieldClass}
        />
      </label>
      <div className="col-span-full grid gap-1.5 text-sm">
        <span className="font-semibold">Logo</span>
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
        {draft.image?.url ? (
          <div className="mt-1 flex h-16 w-40 items-center justify-center rounded-lg border bg-muted p-3">
            <img src={cldUrl(draft.image.url, 'logo')} alt="Preview" className="h-full w-full object-contain" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LogoCard({
  logo,
  isFirst,
  isLast,
  onMove,
}: {
  logo: PartnerLogo;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: 'up' | 'down') => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<LogoDraft>(() => toDraft(logo));
  const [updateLogo, { isLoading: isSaving }] = useUpdatePartnerLogoMutation();
  const [deleteLogo] = useDeletePartnerLogoMutation();

  const handleEdit = () => {
    setDraft(toDraft(logo));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(toDraft(logo));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!draft.name.trim()) {
      toast.error('A name is required.');
      return;
    }
    if (!draft.image) {
      toast.error('A logo image is required.');
      return;
    }
    try {
      await updateLogo({
        id: logo._id,
        name: draft.name.trim(),
        link: draft.link.trim(),
        logo: draft.image,
      }).unwrap();
      toast.success('Logo updated.');
      setIsEditing(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update logo.'));
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateLogo({ id: logo._id, isActive: !logo.isActive }).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update logo.'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${logo.name}"? This cannot be undone.`)) return;
    try {
      await deleteLogo(logo._id).unwrap();
      toast.success('Logo deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete logo.'));
    }
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-border/70 bg-muted p-2">
            {logo.logo?.url ? (
              <img src={cldUrl(logo.logo.url, 'logo')} alt="" className="h-full w-full object-contain" />
            ) : (
              <ImageOff className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="font-bold">{logo.name}</p>
            {logo.link ? <p className="text-sm text-muted-foreground">{logo.link}</p> : null}
            <p className="mt-1 text-xs text-muted-foreground">
              Order {logo.order + 1} · Last updated {formatDate(logo.updatedAt, 'long')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <StatusPill tone={logo.isActive ? 'success' : 'neutral'} onClick={handleToggleActive}>
            {logo.isActive ? 'Active' : 'Inactive'}
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
          <LogoForm draft={draft} onChange={setDraft} label={logo.name} />
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

function NewLogoCard({
  category,
  nextOrder,
  onDone,
}: {
  category: PartnerLogoCategory;
  nextOrder: number;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState<LogoDraft>(EMPTY_DRAFT);
  const [createLogo, { isLoading }] = useCreatePartnerLogoMutation();

  const handleCreate = async () => {
    if (!draft.name.trim()) {
      toast.error('A name is required.');
      return;
    }
    if (!draft.image) {
      toast.error('A logo image is required.');
      return;
    }
    try {
      await createLogo({
        name: draft.name.trim(),
        link: draft.link.trim() || undefined,
        logo: draft.image,
        category,
        order: nextOrder,
      }).unwrap();
      toast.success('Logo added.');
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to add logo.'));
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-bold">New logo</p>
        <Button type="button" variant="ghost" size="icon" aria-label="Cancel new logo" onClick={onDone}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <LogoForm draft={draft} onChange={setDraft} label="new logo" />
      <div className="mt-4 flex gap-2">
        <Button type="button" size="sm" disabled={isLoading} onClick={handleCreate}>
          {isLoading ? 'Adding…' : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Reset / Cancel
        </Button>
      </div>
    </div>
  );
}

function PartnerLogoSection({
  category,
  title,
  description,
}: {
  category: PartnerLogoCategory;
  title: string;
  description: string;
}) {
  const { data, isLoading } = useGetPartnerLogosQuery({ category, includeInactive: true });
  const [updateLogo] = useUpdatePartnerLogoMutation();
  const [isAdding, setIsAdding] = useState(false);

  const logos = [...(data?.data?.logos ?? [])].sort((a, b) => a.order - b.order);

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= logos.length) return;
    const current = logos[index];
    const target = logos[targetIndex];
    try {
      await Promise.all([
        updateLogo({ id: current._id, order: target.order }).unwrap(),
        updateLogo({ id: target._id, order: current.order }).unwrap(),
      ]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to reorder logos.'));
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        {!isAdding ? (
          <Button type="button" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add logo
          </Button>
        ) : null}
      </div>

      {isAdding ? (
        <NewLogoCard category={category} nextOrder={logos.length} onDone={() => setIsAdding(false)} />
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : logos.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
          No logos yet. Add your first one above.
        </div>
      ) : (
        <div className="space-y-4">
          {logos.map((logo, index) => (
            <LogoCard
              key={logo._id}
              logo={logo}
              isFirst={index === 0}
              isLast={index === logos.length - 1}
              onMove={(direction) => handleMove(index, direction)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminPartnerLogosPage() {
  return (
    <div className="space-y-10">
      <Helmet>
        <title>B2B Clients & Media Coverage | Lotus Delight Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">B2B clients & media coverage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the animated logo carousels shown at the bottom of the homepage. Changes appear immediately —
          edit section headings from Site Settings.
        </p>
      </div>

      <PartnerLogoSection
        category="b2b_client"
        title="Our B2B Clients"
        description="Companies and partners shown in the homepage's B2B clients carousel."
      />

      <PartnerLogoSection
        category="media_coverage"
        title="Media Coverage"
        description="Publications and outlets shown in the homepage's media coverage carousel."
      />
    </div>
  );
}
