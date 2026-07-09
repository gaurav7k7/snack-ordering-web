import { Truck, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { useAssignDeliveryMutation } from '@/redux/api/ordersApi';
import type { AssignedDelivery } from '@/types/order';

export function AssignDeliveryCard({
  orderId,
  assignedDelivery,
}: {
  orderId: string;
  assignedDelivery?: AssignedDelivery;
}) {
  const [assignDelivery, { isLoading }] = useAssignDeliveryMutation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAssign = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      await assignDelivery({ id: orderId, name: name.trim(), phone: phone.trim() }).unwrap();
      toast.success('Delivery partner assigned.');
      setName('');
      setPhone('');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to assign delivery.');
    }
  };

  const handleClear = async () => {
    try {
      await assignDelivery({ id: orderId, clear: true }).unwrap();
      toast.success('Delivery assignment cleared.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to clear delivery assignment.');
    }
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-black">Delivery assignment</h2>
      </div>

      {assignedDelivery?.name ? (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-border/70 bg-background p-4 text-sm">
          <div>
            <p className="font-semibold">{assignedDelivery.name}</p>
            {assignedDelivery.phone && <p className="text-muted-foreground">{assignedDelivery.phone}</p>}
            {assignedDelivery.notes && <p className="mt-1 text-xs text-muted-foreground">{assignedDelivery.notes}</p>}
            {assignedDelivery.assignedAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Assigned {new Date(assignedDelivery.assignedAt).toLocaleString('en-IN')}
              </p>
            )}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} disabled={isLoading}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <form onSubmit={handleAssign} className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Delivery partner name"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone number (optional)"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <Button type="submit" variant="outline" className="w-full" disabled={!name.trim() || isLoading}>
            {isLoading ? 'Assigning…' : 'Assign delivery partner'}
          </Button>
        </form>
      )}
    </div>
  );
}
