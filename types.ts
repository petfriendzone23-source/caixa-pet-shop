
export interface Product {
  id: string;
  code: string;
  name: string;
  costPrice: number;
  price: number;
  category: string;
  stock: number;
  unitType: 'un' | 'kg'; // un = Unidade/Saco Fechado, kg = Peso/Granel
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  document?: string;
}

export interface CompanyInfo {
  name: string;
  document: string;
  address: string;
  phone?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface PaymentEntry {
  method: string;
  amount: number;
  feeAmount: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  feePercent: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  change?: number;
  timestamp: number;
  payments: PaymentEntry[];
  customerId?: string;
  customerName?: string;
}

export type View = 'pos' | 'inventory' | 'dashboard' | 'settings' | 'customers' | 'sales';
