
export enum AppTheme {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface Customer {
  id: string;
  name: string;
  taxId: string; // CPF or CNPJ
  address: string;
  phone: string;
  email: string;
  pondCount: number;
  pondsWithLarvae: number;
  observations?: string;
  createdAt: number;
}

export type PaymentType = 'Dinheiro' | 'PIX' | 'Cartão' | 'Boleto';

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  larvaeQuantity: number;
  pricePerThousand: number;
  totalValue: number;
  date: string;
  paymentType: PaymentType;
  pondsStocked: number;
  phone: string;
  observations?: string;
  postponedUntil?: string; // ISO date string
  dismissedFromAfterSales?: boolean;
}

export interface Visit {
  id: string;
  date: string;
  name: string;
  region: string;
  pondCount: number;
  pondsWithLarvae: number;
  area: string;
  stockedQuantity: string;
  density: string;
  observations?: string;
}

export interface Goal {
  id: string;
  targetLarvae: number;
  targetRevenue: number;
  deadline: string;
  createdAt: number;
}

export interface Settings {
  theme: AppTheme;
  contactIntervalDays: number;
  userName: string;
  email: string;
}

export type Tab = 'dashboard' | 'customers' | 'sales' | 'aftersales' | 'visits' | 'reports' | 'settings';
