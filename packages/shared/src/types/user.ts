export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  auth0Id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  storeName: string | null;
  storeDescription: string | null;
  stripeAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  auth0Id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface UpdateUserDto {
  name?: string;
  avatar?: string;
  storeName?: string;
  storeDescription?: string;
}

export interface BecomeSellerDto {
  storeName: string;
  storeDescription?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  storeName: string | null;
  storeDescription: string | null;
}
