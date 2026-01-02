// src/app/lib/definitions.ts

import { ServiceEnum, TransactionEnum } from "./enums";

// **Zinli Payload**
export type ZinliPayload = {
  id: string;
  type: string;
  ownerEmail: string;
  status: string;
};

// **Zinli Transaction**
export type ZinliTransaction = {
  serviceId: number;
  paymentMethodId: number;
  amount: number;
  name: string;
  reference: string;
  email: string;
  serviceType: string;
  message: string;
  url?: string;
};

// **Transaction Verification**
export type TransactionVerify = {
  message: string;
  status: TransactionEnum;
  notificationMessage: string;
  notificationRecipient: number;
  url: string;
};

// **Provider For Transaction**
export type ProviderForTransaction = {
  id: number;
  name: string;
  description: string;
  price: number;
  status: boolean;
  duration: number;
  image: string;
  profiles: number;
  accounts: number;
};

// **Fetch Error**
export type FetchError = {
  error: boolean;
  message: string;
  status?: number;
};

// **Streaming**
export type Streaming = {
  id?: number;
  name: string;
  description: string;
  image?: string;
  price: number;
  duration: number;
  status: boolean;
  serviceType: string;
};

// **Streaming Account**
export type StreamingAccount = {
  id?: number;
  streamingProvider: Streaming;
  description: string;
  stock: number;
  status: boolean;
};

// **Streaming Profile**
export type StreamingProfile = {
  id?: number;
  idStreamingAccount: number;
  profileUser: string;
  profileKey: string;
  client: number;
  status: boolean;
};

// **Recharge**
export type Recharge = {
  id?: number;
  provider: string;
  name: string;
  description: string;
  image?: string;
  prices: number[];
  status: boolean;
  serviceType: string;
};

// **License Provider**
export type LicenseProvider = {
  id?: number;
  name: string;
  description: string;
  image?: string;
  price: number;
  duration: number;
  status: boolean;
  serviceType: string;
};

// **License**
export type License = {
  id?: number;
  user: string;
  key: string;
  providerId: number;
  status: boolean;
  provider: any;
};

// **Marketing**
export type Marketing = {
  id?: number;
  name: string;
  description: string;
  image?: string;
  price: number;
  duration: number;
  status: boolean;
  serviceType: string;
};

// **Content Modal**
export type ContentModal = {
  header: string;
  body: string;
  loading: string;
  target: any;
};

// **Product Guest**
export type ProductGuest = {
  id: number;
  name: string;
  price: number;
  duration: number;
  image: string;
};
