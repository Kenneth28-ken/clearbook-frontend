
import { Product, ItemType, Staff, Attendant } from './types';

export const TAX_RATE = 0.10; // 10% standard tax

export const STAFF_LIST: Staff[] = [
  { id: 'S01', name: 'Blessing Sales', role: 'Cashier', pin: '0000', avatarColor: 'bg-pink-500' },
  { id: 'S02', name: 'Chisom Retail', role: 'Cashier', pin: '2345', avatarColor: 'bg-emerald-500' },
  { id: 'S03', name: 'Grace Lead', role: 'Supervisor', pin: '1111', avatarColor: 'bg-indigo-500' },
  { id: 'S04', name: 'Main Manager', role: 'Manager', pin: '2222', avatarColor: 'bg-gray-800' },
];

export const SERVER_LIST: Attendant[] = [
  { id: 'V01', name: 'Amaka Eze', role: 'Server' },
  { id: 'V02', name: 'Chidi Okafor', role: 'Server' },
  { id: 'V03', name: 'Tunde Bakare', role: 'Server' },
  { id: 'V04', name: 'Blessing Udoh', role: 'Server' },
];

export const CATEGORIES = [
  'All',
  'Groceries',
  'Beverages',
  'Fresh Produce',
  'Hot Kitchen',
  'Combos',
  'Bakery',
];

// Added costPrice to each mock product to satisfy the Product interface requirement
export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Whole Milk 2L', price: 4.50, costPrice: 3.00, category: 'Groceries', type: ItemType.UNIT, color: 'bg-blue-100', stock: 50 },
  { id: '2', name: 'White Bread', price: 3.20, costPrice: 1.50, category: 'Bakery', type: ItemType.UNIT, color: 'bg-yellow-50', stock: 25 },
  { id: '3', name: 'Eggs (Dozen)', price: 5.80, costPrice: 4.00, category: 'Groceries', type: ItemType.UNIT, color: 'bg-orange-50', stock: 8 },
  { id: '4', name: 'Fuji Apples', price: 4.99, costPrice: 2.50, category: 'Fresh Produce', type: ItemType.WEIGHT, color: 'bg-red-50', stock: 100 },
  { id: '5', name: 'Bananas', price: 3.50, costPrice: 1.80, category: 'Fresh Produce', type: ItemType.WEIGHT, color: 'bg-yellow-100', stock: 15 },
  { id: '10', name: 'Coca Cola 500ml', price: 2.50, costPrice: 1.20, category: 'Beverages', type: ItemType.UNIT, color: 'bg-red-100', stock: 200 },
  { id: '11', name: 'Sparkling Water', price: 1.80, costPrice: 0.80, category: 'Beverages', type: ItemType.UNIT, color: 'bg-blue-50', stock: 12 },
  { id: '12', name: 'Orange Juice', price: 3.90, costPrice: 2.00, category: 'Beverages', type: ItemType.UNIT, color: 'bg-orange-100', stock: 5 },
  { 
    id: '20', name: 'Classic Burger', price: 12.50, costPrice: 6.00, category: 'Hot Kitchen', type: ItemType.UNIT, color: 'bg-indigo-100', stock: 40,
    modifiers: [
      { id: 'm1', name: 'Add Cheese', price: 1.50 },
      { id: 'm2', name: 'Add Bacon', price: 2.50 },
      { id: 'm3', name: 'No Onion', price: 0 },
    ]
  },
  { 
    id: '21', name: 'Large Pepperoni Pizza', price: 18.00, costPrice: 9.00, category: 'Hot Kitchen', type: ItemType.UNIT, color: 'bg-indigo-100', stock: 30,
    modifiers: [
      { id: 'm4', name: 'Extra Cheese', price: 2.00 },
      { id: 'm5', name: 'Thin Crust', price: 0 },
    ]
  },
  { id: '22', name: 'Chicken Salad', price: 10.50, costPrice: 4.50, category: 'Hot Kitchen', type: ItemType.UNIT, color: 'bg-green-100', stock: 15 },
  { id: '30', name: 'Burger Combo', price: 15.00, costPrice: 7.50, category: 'Combos', type: ItemType.UNIT, color: 'bg-purple-100', stock: 20 },
];
