
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  // Ração por KG (Granel)
  { id: '1', code: 'RAC-KG', name: 'Ração Golden Adulto Frango (Granel)', costPrice: 12.00, price: 18.50, category: 'Ração', stock: 50, unitType: 'kg' },
  { id: '2', code: 'RAC-KG2', name: 'Ração Royal Canin Gatos (Granel)', costPrice: 25.00, price: 38.90, category: 'Ração', stock: 30, unitType: 'kg' },
  
  // Sacos Fechados (Unidade)
  { id: '3', code: 'SAC-15', name: 'Ração Golden Adulto Frango Saco 15kg', costPrice: 140.00, price: 189.90, category: 'Ração', stock: 10, unitType: 'un' },
  { id: '4', code: 'SAC-10', name: 'Ração Premier Filhotes Saco 10kg', costPrice: 160.00, price: 215.00, category: 'Ração', stock: 5, unitType: 'un' },
  
  // Acessórios e Higiene (Sempre Unidade)
  { id: '5', code: 'ACE001', name: 'Coleira de Couro Ajustável', costPrice: 15.00, price: 35.00, category: 'Acessórios', stock: 10, unitType: 'un' },
  { id: '6', code: 'HIG001', name: 'Shampoo Neutro 500ml', costPrice: 18.00, price: 32.00, category: 'Higiene', stock: 15, unitType: 'un' },

  // Serviços
  { id: 's1', code: 'SRV001', name: 'Banho - Porte Pequeno', costPrice: 15.00, price: 50.00, category: 'Serviços', stock: 999, unitType: 'un' },
];

export const CATEGORIES = ['Todos', 'Ração', 'Acessórios', 'Higiene', 'Saúde', 'Serviços'];
