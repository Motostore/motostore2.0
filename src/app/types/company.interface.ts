import { Address } from './address.interface';
import { Phone } from './phone.interface';
import { Social } from './social.interface';

export interface Company {
    name: string;
    rif: string;
    logo: string;
    copyright: number;
    status: boolean;
    main: boolean;
    addresses?: Address[];
    phones?: Phone[];
    socialNetworks?: Social[];
  }