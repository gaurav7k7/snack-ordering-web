import bcrypt from 'bcrypt';
import { Schema, model, type InferSchemaType } from 'mongoose';

import { USER_ROLES } from '../constants/roles.js';

type UserDocument = InferSchemaType<typeof userSchema> & {
  comparePassword(candidatePassword: string): Promise<boolean>;
};

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    avatar: { type: String },
    phone: { type: String },
    addresses: { type: Array, default: [] },
    wishlist: { type: [Schema.Types.ObjectId], ref: 'Product', default: [] },
    coupons: { type: Array, default: [] },
    wallet: { type: Object, default: { balance: 0, currency: 'INR' } },
    notifications: { type: Array, default: [] },
    recentlyViewed: { type: Array, default: [] },
    supportTickets: { type: Array, default: [] },
    reviews: { type: Array, default: [] },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.customer,
    },
    googleId: { type: String, index: true, sparse: true },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    blockedAt: { type: Date },
    blockedReason: { type: String },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model<UserDocument>('User', userSchema);
