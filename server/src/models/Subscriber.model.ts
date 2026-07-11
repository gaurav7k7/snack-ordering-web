import { Schema, model } from 'mongoose';

const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true },
);

export const SubscriberModel = model('Subscriber', subscriberSchema);
