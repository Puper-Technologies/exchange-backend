import { Types } from 'mongoose';
import { WeightingScheme } from '@config/constants';

export interface ExpertCryptocaseInterface {
  name: string;
  expertId: Types.ObjectId;
  quoteSymbol: string;
  description: string;
  weightingScheme: WeightingScheme;
}

export class CryptocasePricing {
  free: Boolean;
  monthly: Number;
  weekly: Number;
  yearly: Number;
}