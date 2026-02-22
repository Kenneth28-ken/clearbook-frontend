
export enum AppView {
  LOGIN = 'LOGIN',
  STAFF_LOGIN = 'STAFF_LOGIN',
  SALES = 'SALES',
  CHECKOUT = 'CHECKOUT',
  RECEIPT = 'RECEIPT',
  CUSTOMER_MENU = 'CUSTOMER_MENU',
}

export enum SystemMode {
  SUPERMARKET = 'SUPERMARKET',
  RESTAURANT = 'RESTAURANT',
}

export enum ItemType {
  UNIT = 'UNIT',
  WEIGHT = 'WEIGHT',
}

export interface Modifier {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  category: string;
  type: ItemType;
  color?: string;
  modifiers?: Modifier[];
  stock: number;
}

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  price: number;
  costPrice: number;
  quantity: number;
  type: ItemType;
  selectedModifiers: Modifier[];
  taxRate: number;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Cashier' | 'Supervisor' | 'Manager';
  pin: string;
  avatarColor?: string;
}

export interface Attendant {
  id: string;
  name: string;
  role: 'Server' | 'Attendant';
}

export interface PaymentRecord {
  method: 'CASH' | 'CARD' | 'MOBILE';
  amount: number;
}

export interface TransactionRecord {
  id: string;
  timestamp: Date;
  sellerName: string;
  serverId?: string;
  serverName?: string;
  tableLabel?: string;
  items: CartItem[];
  payments: PaymentRecord[];
  total: number;
  mode: SystemMode;
  synced?: boolean;
  offline?: boolean;
  customerName?: string;
  customerPhone?: string;
}

export interface MobileOrder {
  id: string;
  items: CartItem[];
  customerName: string;
  timestamp: Date;
  assignedServerId?: string;
  tableNumber?: string;
}

export interface Customer {
  phone: string;
  name?: string;
  lastVisit: Date;
  visitCount: number;
}

export enum AuditType {
  SYSTEM = 'SYSTEM',
  SECURITY = 'SECURITY',
  INVENTORY = 'INVENTORY',
  SYNC = 'SYNC',
  TRANSACTION = 'TRANSACTION'
}

export interface AuditCheckpoint {
  id: string;
  type: AuditType;
  status: 'VALID' | 'WARNING' | 'CRITICAL';
  message: string;
  timestamp: Date;
  details?: any;
}