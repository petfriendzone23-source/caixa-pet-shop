
import { Product } from './types.ts';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', code: 'RAC-KG1', name: 'Ração Golden Adulto Frango (Granel)', subgroup: 'GOLDEN', costPrice: 12.00, price: 18.50, category: 'Ração', stock: 50, unitType: 'kg', backgroundColor: '#fef3c7' },
  { id: '2', code: 'RAC-KG2', name: 'Ração Special Dog Prime (Granel)', subgroup: 'SPECIAL DOG', costPrice: 15.00, price: 25.90, category: 'Ração', stock: 30, unitType: 'kg', backgroundColor: '#fef3c7' },
  { id: '3', code: 'SAC-15', name: 'Ração Golden Adulto Frango Saco 15kg', subgroup: 'GOLDEN', costPrice: 140.00, price: 189.90, category: 'Ração', stock: 10, unitType: 'un', backgroundColor: '#fff7ed' },
  { id: '4', code: 'SAC-SNOW', name: 'Ração Snow Cat Mix Gatos 10kg', subgroup: 'SNOW CAT', costPrice: 110.00, price: 155.00, category: 'Ração', stock: 5, unitType: 'un', backgroundColor: '#fff7ed' },
  { id: '5', code: 'RAC-PAN', name: 'Ração Panelaço Premium 20kg', subgroup: 'PANELAÇO', costPrice: 130.00, price: 175.00, category: 'Ração', stock: 8, unitType: 'un', backgroundColor: '#fff7ed' },
  { id: 'cam-01', code: 'CAM-001', name: 'Cama Pet Luxo M', subgroup: 'Panelaço', costPrice: 45.00, price: 89.90, category: 'Cama', stock: 5, unitType: 'un', backgroundColor: '#fae8ff' },
  { id: '6', code: 'ACE001', name: 'Coleira de Couro Ajustável', subgroup: 'Nexus', costPrice: 15.00, price: 35.00, category: 'Acessórios', stock: 10, unitType: 'un', backgroundColor: '#dcfce7' },
  { id: '7', code: 'HIG001', name: 'Shampoo Neutro 500ml', subgroup: 'PetClean', costPrice: 18.00, price: 32.00, category: 'Higiene', stock: 15, unitType: 'un', backgroundColor: '#dbeafe' },
  { id: 's1', code: 'SRV001', name: 'Banho - Porte Pequeno', subgroup: 'Serviço', costPrice: 15.00, price: 50.00, category: 'Serviços', stock: 999, unitType: 'un', backgroundColor: '#f3e8ff' },
];

export const CATEGORIES = ['Todos', 'Ração', 'Sache', 'Cama', 'Acessórios', 'Vestuário', 'Higiene', 'Saúde', 'Serviços'];

export const SUBGROUPS_RACAO = [
  'SPECIAL DOG', 
  'SNOW CAT', 
  'PANELAÇO', 
  'GOLDEN'
];

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
