
import { Product } from './types.ts';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', code: 'RAC-KG', name: 'Ração Golden Adulto Frango (Granel)', costPrice: 12.00, price: 18.50, category: 'Ração', stock: 50, unitType: 'kg', backgroundColor: '#fef3c7' },
  { id: '2', code: 'RAC-KG2', name: 'Ração Royal Canin Gatos (Granel)', costPrice: 25.00, price: 38.90, category: 'Ração', stock: 30, unitType: 'kg', backgroundColor: '#fef3c7' },
  { id: '3', code: 'SAC-15', name: 'Ração Golden Adulto Frango Saco 15kg', costPrice: 140.00, price: 189.90, category: 'Ração', stock: 10, unitType: 'un', backgroundColor: '#fff7ed' },
  { id: '4', code: 'SAC-10', name: 'Ração Premier Filhotes Saco 10kg', costPrice: 160.00, price: 215.00, category: 'Ração', stock: 5, unitType: 'un', backgroundColor: '#fff7ed' },
  { id: '5', code: 'ACE001', name: 'Coleira de Couro Ajustável', costPrice: 15.00, price: 35.00, category: 'Acessórios', stock: 10, unitType: 'un', backgroundColor: '#dcfce7' },
  { id: '6', code: 'HIG001', name: 'Shampoo Neutro 500ml', costPrice: 18.00, price: 32.00, category: 'Higiene', stock: 15, unitType: 'un', backgroundColor: '#dbeafe' },
  { id: 's1', code: 'SRV001', name: 'Banho - Porte Pequeno', costPrice: 15.00, price: 50.00, category: 'Serviços', stock: 999, unitType: 'un', backgroundColor: '#f3e8ff' },
];

export const CATEGORIES = ['Todos', 'Ração', 'Acessórios', 'Vestuário', 'Higiene', 'Saúde', 'Serviços'];

export const PRODUCT_COLORS = [
  { name: 'Branco', hex: '#ffffff' },
  { name: 'Âmbar', hex: '#fef3c7' },
  { name: 'Laranja', hex: '#ffedd5' },
  { name: 'Verde', hex: '#dcfce7' },
  { name: 'Azul', hex: '#dbeafe' },
  { name: 'Roxo', hex: '#f3e8ff' },
  { name: 'Rosa', hex: '#fae8ff' },
  { name: 'Cinza', hex: '#f1f5f9' },
  { name: 'Amarelo', hex: '#fef9c3' },
  { name: 'Ciano', hex: '#cffafe' },
];
