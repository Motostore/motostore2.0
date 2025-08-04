import { StyledString } from "next/dist/build/swc";
import { ServiceEnum, TransactionEnum } from "./enums";

export type ZinliPayload = {
    id: string;
    type: string;
    ownerEmail: string;
    status: string;
  };

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
  }

export type TransactionVerify = {
  message: String;
  status: TransactionEnum;
  notificationMessage: string;
  notificationRecipient: number;
  url: string;
}

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
}

export type FetchError = {
  error: boolean;
	message: string;
	status?: number;
}

export type Streaming = {
  id?: number;
  name: string;
  description: string;
  image?: string;
  price: number;
  duration: number;
  status: boolean;
  serviceType: string;
}

export type StreamingAccount = {
  id?: number;
  streamingProvider: Streaming;
  description: string;
  stock: number;
  status: boolean;
}

export type StreamingProfile = {
  id?: number;
  idStreamingAccount: number;
  profileUser: string;
  profileKey: string;
  client: number;
  status: boolean;
}

export type Recharge = {
  id?: number;
  provider: string;
  name: string;
  description: string;
  image?: string;
  prices: number[];
  status: boolean;
  serviceType: string;
}

export type LicenseProvider = {
  id?: number;
  name: string;
  description: string;
  image?: string;
  price: number;
  duration: number;
  status: boolean;
  serviceType: string;
}
export type License = {
  id?: number;
  user: string;
  key: string;
  providerId: number;
  status: boolean;
  provider: any;
}

export type Marketing = {
  id?: number;
  name: string;
  description: string;
  image?: string;
  price: number;
  duration: number;
  status: boolean;
  serviceType: string;
}

export type ContentModal = {
  header: string,
  body: string;
  loading: string;
  target: any;
}

export type ProductGuest = {
  id: number;
  name: string;
  price: number;
  duration: number;
  image: string;
}