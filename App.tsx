
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { auth, db, firebase } from './firebase';
import PrismaticAuditModal from './components/PrismaticAuditModal';
import { AppView, CartItem, Product, Staff, ItemType, Modifier, PaymentRecord, TransactionRecord, Attendant, MobileOrder, SystemMode, Customer, AuditCheckpoint, AuditType, Expense } from './types';
import { MOCK_PRODUCTS as INITIAL_PRODUCTS, TAX_RATE, CATEGORIES, SERVER_LIST, STAFF_LIST } from './constants';

// Components
import LoginScreen from './components/LoginScreen';
import StaffLoginScreen from './components/StaffLoginScreen';
import TopBar from './components/TopBar';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import BottomBar from './components/BottomBar';
import CheckoutModal from './components/CheckoutModal';
import ModifierModal from './components/ModifierModal';
import ReceiptModal from './components/ReceiptModal';
import WeightModal from './components/WeightModal';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';
import AddProductModal from './components/AddProductModal';
import EditProductModal from './components/EditProductModal';
import ServerModal from './components/ServerModal';
import QRCodeModal from './components/QRCodeModal';
import MobileOrdersModal from './components/MobileOrdersModal';
import InventoryModal from './components/InventoryModal';
import ServerHubModal from './components/ServerHubModal';
import TokenRechargeModal from './components/TokenRechargeModal';
import CRMModal from './components/CRMModal';
import StaffManagementModal from './components/StaffManagementModal';
import EditMobileOrderModal from './components/EditMobileOrderModal';
import MasterDashboardModal from './components/MasterDashboardModal';
import ProfitHistoryModal from './components/ProfitHistoryModal';

const MASTER_EMAIL = "perfectmaney200@gmail.com";
const STOCK_THRESHOLD = 10;
const DEFAULT_WEBHOOK = "https://valaq122.app.n8n.cloud/webhook/vis";

const sanitize = (obj: any) => {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    result[key] = obj[key] === undefined ? null : obj[key];
  });
  return result;
};

const parseDate = (dateVal: any): Date => {
  if (!dateVal) return new Date();
  if (typeof dateVal.toDate === 'function') return dateVal.toDate();
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? new Date() : d;
};

const safeJsonStringify = (obj: any) => {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    // If standard stringify fails, use a replacer to handle circular references
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return; // Discard circular reference
        cache.add(value);
      }
      return value;
    });
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [systemMode, setSystemMode] = useState<SystemMode>(SystemMode.RESTAURANT);
  const [user, setUser] = useState<firebase.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [activeUid, setActiveUid] = useState<string>('');

  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [currentServer, setCurrentServer] = useState<Attendant | null>(null);
  
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('cb_staff');
    return saved ? JSON.parse(saved) : STAFF_LIST;
  });

  const [attendantsList, setAttendantsList] = useState<Attendant[]>(() => {
    const saved = localStorage.getItem('cb_attendants');
    return saved ? JSON.parse(saved) : SERVER_LIST;
  });
  
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('cb_categories');
    return saved ? JSON.parse(saved) : CATEGORIES;
  });
  const [couponRate, setCouponRate] = useState<number>(() => {
    const saved = localStorage.getItem('cb_couponRate');
    return saved !== null ? parseFloat(saved) : 5;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cb_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem('cb_history');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((tx: any) => ({ ...tx, timestamp: new Date(tx.timestamp) }));
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('cb_customers');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((c: any) => ({ ...c, lastVisit: new Date(c.lastVisit) }));
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('cb_expenses');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) }));
  });

  const [tokens, setTokens] = useState<number>(() => {
    const saved = localStorage.getItem('cb_tokens');
    return saved ? parseInt(saved) : 0;
  });

  const [whatsappTokens, setWhatsappTokens] = useState<number>(() => {
    const saved = localStorage.getItem('cb_wa_tokens');
    return saved ? parseInt(saved) : 0;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cb_active_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTableLabel, setActiveTableLabel] = useState(() => localStorage.getItem('cb_active_table') || '');
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModifier, setShowModifier] = useState<Product | null>(null);
  const [showWeight, setShowWeight] = useState<Product | null>(null);
  const [showReceipt, setShowReceipt] = useState<TransactionRecord | null>(null);
  const [showServerSelect, setShowServerSelect] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showMobileOrders, setShowMobileOrders] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showServerHub, setShowServerHub] = useState(false);
  const [showTokenRecharge, setShowTokenRecharge] = useState(false);
  const [showCRM, setShowCRM] = useState(false);
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const [showMasterDashboard, setShowMasterDashboard] = useState(false);
  const [showProfitHistory, setShowProfitHistory] = useState(false);
  const [showPrismaticAudit, setShowPrismaticAudit] = useState(false);
  const [impersonatedUid, setImpersonatedUid] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<'ACTIVE' | 'RESTRICTED' | 'SHUTDOWN'>('ACTIVE');
  const [editingMobileOrder, setEditingMobileOrder] = useState<MobileOrder | null>(null);
  const [isManagerOverride, setIsManagerOverride] = useState(false);
  
  const knownOrderIds = useRef<Set<string>>(new Set());
  const [newOrderNotification, setNewOrderNotification] = useState<string | null>(null);
  const [inventoryNotification, setInventoryNotification] = useState<string | null>(null);
  const lastLowStockCount = useRef<number>(0);

  const [mobileOrders, setMobileOrders] = useState<MobileOrder[]>(() => {
    const saved = localStorage.getItem('cb_mobile_orders');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) }));
  });

  const [currencySymbol, setCurrencySymbol] = useState(() => localStorage.getItem('cb_currency') || '₦');
  const [whatsappApi, setWhatsappApi] = useState(() => localStorage.getItem('cb_wa_api') || DEFAULT_WEBHOOK);
  const [whatsappMethod, setWhatsappMethod] = useState<'POST' | 'GET'>(() => (localStorage.getItem('cb_wa_method') as 'POST' | 'GET') || 'POST');
  const [whatsappCompatibilityMode, setWhatsappCompatibilityMode] = useState<boolean>(() => localStorage.getItem('cb_wa_compat') === 'true');
  const [thermalProxy, setThermalProxy] = useState(() => localStorage.getItem('cb_thermal_proxy') || '');

  const [printerType, setPrinterType] = useState<'USB' | 'BLUETOOTH' | 'PROXY'>(() => (localStorage.getItem('cb_printer_type') as any) || 'USB');
  const [firstTimeMessage, setFirstTimeMessage] = useState(() => localStorage.getItem('cb_first_time_msg') || 'Welcome to ClearBook! Thank you for your first purchase. Here is a coupon for your next visit!');
  const [businessName, setBusinessName] = useState(() => localStorage.getItem('cb_business_name') || 'Clear Book POS');

  const [isSyncing, setIsSyncing] = useState(false);

  const auditCheckpoints = useMemo<AuditCheckpoint[]>(() => {
    const list: AuditCheckpoint[] = [
      {
        id: 'network',
        type: AuditType.SYSTEM,
        status: isOnline ? 'VALID' : 'CRITICAL',
        message: isOnline ? 'Network Connectivity Stable' : 'Network Disconnected',
        timestamp: new Date()
      },
      {
        id: 'sync',
        type: AuditType.SYNC,
        status: isSyncing ? 'WARNING' : 'VALID',
        message: isSyncing ? 'Synchronizing with Cloud' : 'Cloud Sync Complete',
        timestamp: new Date()
      },
      {
        id: 'auth',
        type: AuditType.SECURITY,
        status: user ? 'VALID' : 'CRITICAL',
        message: user ? `Authenticated as ${user.email}` : 'No Active User Session',
        timestamp: new Date()
      },
      {
        id: 'inventory',
        type: AuditType.INVENTORY,
        status: products.some(p => p.stock < STOCK_THRESHOLD) ? 'WARNING' : 'VALID',
        message: products.some(p => p.stock < STOCK_THRESHOLD) ? 'Low Stock Detected' : 'Inventory Levels Optimal',
        timestamp: new Date()
      },
      {
        id: 'persistence',
        type: AuditType.SYSTEM,
        status: 'VALID',
        message: 'Offline Persistence Active',
        timestamp: new Date()
      }
    ];
    return list;
  }, [isOnline, isSyncing, user, products]);

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTxs = history.filter(tx => tx.timestamp.toISOString().split('T')[0] === today);
    
    let revenue = 0;
    let cost = 0;
    let profit = 0;

    todayTxs.forEach(tx => {
      revenue += tx.total;
      tx.items.forEach(item => {
        const itemCost = (item.costPrice || 0) * item.quantity;
        cost += itemCost;
        profit += (item.price * item.quantity) - itemCost;
      });
    });

    return { revenue, cost, profit };
  }, [history]);

  const isMasterMode = useMemo(() => user?.email === MASTER_EMAIL, [user]);
  const isTerminalLocked = tokens <= 0;

  const playAlertSound = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, context.currentTime); 
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
    } catch (e) { console.warn("Audio Context blocked or failed."); }
  };

  useEffect(() => {
    const lowStockItems = products.filter(p => p.stock < STOCK_THRESHOLD);
    const currentLowCount = lowStockItems.length;
    if (currentLowCount > lastLowStockCount.current) {
      playAlertSound();
      setInventoryNotification(`${currentLowCount} items are running low on stock!`);
      setTimeout(() => setInventoryNotification(null), 5000);
    }
    lastLowStockCount.current = currentLowCount;
  }, [products]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'customer') {
      setView(AppView.CUSTOMER_MENU);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cb_staff', safeJsonStringify(staffList));
      localStorage.setItem('cb_attendants', safeJsonStringify(attendantsList));
      localStorage.setItem('cb_categories', safeJsonStringify(categories));
      localStorage.setItem('cb_couponRate', couponRate.toString());
      localStorage.setItem('cb_products', safeJsonStringify(products));
      localStorage.setItem('cb_history', safeJsonStringify(history));
      localStorage.setItem('cb_customers', safeJsonStringify(customers));
      localStorage.setItem('cb_tokens', tokens.toString());
      localStorage.setItem('cb_wa_tokens', whatsappTokens.toString());
      localStorage.setItem('cb_active_cart', safeJsonStringify(cart));
      localStorage.setItem('cb_active_table', activeTableLabel);
      localStorage.setItem('cb_currency', currencySymbol);
      localStorage.setItem('cb_wa_api', whatsappApi);
      localStorage.setItem('cb_wa_method', whatsappMethod);
      localStorage.setItem('cb_wa_compat', whatsappCompatibilityMode.toString());
      localStorage.setItem('cb_thermal_proxy', thermalProxy);
      localStorage.setItem('cb_mobile_orders', safeJsonStringify(mobileOrders));
      localStorage.setItem('cb_printer_type', printerType);
      localStorage.setItem('cb_first_time_msg', firstTimeMessage);
      localStorage.setItem('cb_business_name', businessName);
      localStorage.setItem('cb_expenses', safeJsonStringify(expenses));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }, [staffList, attendantsList, products, history, customers, tokens, whatsappTokens, cart, activeTableLabel, currencySymbol, whatsappApi, whatsappMethod, whatsappCompatibilityMode, thermalProxy, mobileOrders, printerType, firstTimeMessage, businessName, expenses]);

  useEffect(() => {
    if (!activeUid) return;
    const unsubConfig = db.collection("users").doc(activeUid).collection("config").doc("terminal")
      .onSnapshot((doc) => {
        if (doc.exists) {
            setTokens(doc.data()?.tokens || 0);
            setWhatsappTokens(doc.data()?.whatsappTokens || 0);
            if (doc.data()?.couponRate !== undefined) setCouponRate(doc.data()?.couponRate);
            if (doc.data()?.categories) setCategories(doc.data()?.categories);
        }
      });
    const unsubStaff = db.collection("users").doc(activeUid).collection("staff")
      .onSnapshot((snap) => {
        if (!snap.empty) setStaffList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Staff)));
      });
    const unsubAttendants = db.collection("users").doc(activeUid).collection("attendants")
      .onSnapshot((snap) => {
        if (!snap.empty) setAttendantsList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Attendant)));
      });
    const unsubProducts = db.collection("users").doc(activeUid).collection("products")
      .onSnapshot((snap) => {
        if (!snap.empty) {
          const loadedProducts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
          loadedProducts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setProducts(loadedProducts);
        }
      });
    const unsubHistory = db.collection("users").doc(activeUid).collection("history")
      .orderBy("timestamp", "desc")
      .onSnapshot((snap) => {
        if (!snap.empty) {
          setHistory(snap.docs.map(d => ({
            ...d.data(),
            id: d.id,
            timestamp: parseDate(d.data()?.timestamp)
          } as TransactionRecord)));
        }
      });
    const unsubExpenses = db.collection("users").doc(activeUid).collection("expenses")
      .orderBy("timestamp", "desc")
      .onSnapshot((snap) => {
        if (!snap.empty) {
          setExpenses(snap.docs.map(d => ({
            ...d.data(),
            id: d.id,
            timestamp: parseDate(d.data()?.timestamp)
          } as Expense)));
        } else {
          setExpenses([]);
        }
      });
    const unsubCustomers = db.collection("users").doc(activeUid).collection("customers")
      .onSnapshot((snap) => {
        if (!snap.empty) {
          setCustomers(snap.docs.map(d => ({
            ...d.data(),
            phone: d.id,
            lastVisit: parseDate(d.data()?.lastVisit)
          } as Customer)));
        }
      });
    const unsubMobile = db.collection("users").doc(activeUid).collection("mobile_orders")
      .onSnapshot((snap) => {
        if (!snap.empty) {
          const incoming = snap.docs.map(d => ({
            ...d.data(),
            id: d.id,
            timestamp: parseDate(d.data()?.timestamp)
          } as MobileOrder));
          incoming.forEach(order => {
            if (!knownOrderIds.current.has(order.id)) {
              knownOrderIds.current.add(order.id);
              setNewOrderNotification(`Incoming order from ${order.customerName || 'Table ' + (order.tableNumber || '?')}`);
              setTimeout(() => setNewOrderNotification(null), 6000);
            }
          });
          setMobileOrders(incoming);
        } else {
          setMobileOrders([]);
          knownOrderIds.current.clear();
        }
      });
    return () => { unsubConfig(); unsubStaff(); unsubAttendants(); unsubProducts(); unsubHistory(); unsubExpenses(); unsubCustomers(); unsubMobile(); };
  }, [activeUid]);

  useEffect(() => {
    if (user && activeUid && !impersonatedUid) {
      db.collection("pos_accounts").doc(user.uid).set({
        email: user.email,
        lastLogin: firebase.firestore.Timestamp.now(),
      }, { merge: true }).catch(e => console.warn("Registry sync failed", e));
    }
  }, [user, activeUid, impersonatedUid]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const uid = impersonatedUid || u.uid;
        setActiveUid(uid);

        // Update central users registry in background (don't block UI)
        db.collection("pos_accounts").doc(u.uid).set({
          email: u.email,
          lastLogin: firebase.firestore.Timestamp.now(),
        }, { merge: true }).catch(e => console.warn("Background registry sync failed", e));

        // Check account status for the active UID (don't block UI)
        db.collection("pos_accounts").doc(uid).get().then(userDoc => {
          if (userDoc.exists) {
            setAccountStatus(userDoc.data()?.status || 'ACTIVE');
            if (userDoc.data()?.businessName) setBusinessName(userDoc.data()?.businessName);
          }
        }).catch(e => console.warn("Background status check failed", e));

        if (view !== AppView.CUSTOMER_MENU) setView(AppView.STAFF_LOGIN);
      } else {
        setUser(null);
        setActiveUid('');
        setImpersonatedUid(null);
        setAccountStatus('ACTIVE');
        if (view !== AppView.CUSTOMER_MENU) setView(AppView.LOGIN);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, [impersonatedUid]);

  const handleImpersonate = (uid: string) => {
    setImpersonatedUid(uid);
    setShowMasterDashboard(false);
    alert(`Impersonating account: ${uid}`);
  };

  const stopImpersonating = () => {
    setImpersonatedUid(null);
    if (user) setActiveUid(user.uid);
    alert("Returned to Master Account");
  };

  const handleSaveCustomer = async (phone: string, name: string, transactionId?: string, couponEarned: number = 0, couponRedeemed: number = 0) => {
    if (!phone) return;
    const now = new Date();
    const existing = customers.find(c => c.phone === phone);
    const updatedCustomer: Customer = {
      phone,
      name: name || existing?.name || '',
      lastVisit: now,
      visitCount: (existing?.visitCount || 0) + 1,
      couponBalance: (existing?.couponBalance || 0) + couponEarned - couponRedeemed
    };
    
    setCustomers(prev => {
      const other = prev.filter(c => c.phone !== phone);
      return [updatedCustomer, ...other];
    });

    if (activeUid) {
      try {
        await db.collection("users").doc(activeUid).collection("customers").doc(phone).set({
          name: updatedCustomer.name,
          lastVisit: firebase.firestore.Timestamp.fromDate(now),
          visitCount: updatedCustomer.visitCount,
          couponBalance: updatedCustomer.couponBalance
        }, { merge: true });

        // Associate this customer with the transaction if provided
        if (transactionId) {
          // Update local history state instantly
          setHistory(prev => prev.map(tx => tx.id === transactionId ? { ...tx, customerName: name, customerPhone: phone } : tx));
          // Update cloud Firestore
          await db.collection("users").doc(activeUid).collection("history").doc(transactionId).set({
             customerName: name,
             customerPhone: phone
          }, { merge: true });
        }
      } catch (e) { console.error("Customer sync failed", e); }
    }
  };

  const handleSendWhatsAppReceipt = (phone: string, name: string) => {
    if (whatsappTokens <= 0) {
      alert("INSUFFICIENT WA TOKENS: Please recharge your balance.");
      return;
    }

    const receipt = history.find(h => h.id === showReceipt?.id);
    if (!receipt) return;

    const itemsText = receipt.items.map(item => 
      `• ${item.quantity}${item.type === 'WEIGHT' ? 'kg' : 'x'} ${item.name} - ${currencySymbol}${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const message = `*CLEARBOOK DIGITAL RECEIPT*\n` +
                    `---------------------------\n` +
                    `*ORDER ID:* #${receipt.id}\n` +
                    `*CUSTOMER:* ${name.toUpperCase()}\n` +
                    `*PHONE:* ${phone}\n` +
                    `---------------------------\n` +
                    `*ITEMS PURCHASED:*\n` +
                    `${itemsText}\n` +
                    `---------------------------\n` +
                    `*TOTAL PAID: ${currencySymbol}${receipt.total.toFixed(2)}*\n` +
                    `---------------------------\n` +
                    `_Thank you for your repeat patronage!_`;

    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    handleDeductWhatsAppToken();
  };

  const handleRestoreData = (data: any) => {
    if (data.cb_staff) setStaffList(data.cb_staff);
    if (data.cb_attendants) setAttendantsList(data.cb_attendants);
    if (data.cb_products) setProducts(data.cb_products);
    if (data.cb_history) setHistory(data.cb_history.map((tx: any) => ({ ...tx, timestamp: new Date(tx.timestamp) })));
    if (data.cb_customers) setCustomers(data.cb_customers.map((c: any) => ({ ...c, lastVisit: new Date(c.lastVisit) })));
    if (data.cb_tokens !== undefined) setTokens(parseInt(data.cb_tokens));
    if (data.cb_wa_tokens !== undefined) setWhatsappTokens(parseInt(data.cb_wa_tokens));
    if (data.cb_currency) setCurrencySymbol(data.cb_currency);
    if (data.cb_wa_api) setWhatsappApi(data.cb_wa_api);
    if (data.cb_wa_method) setWhatsappMethod(data.cb_wa_method);
    if (data.cb_wa_compat) setWhatsappCompatibilityMode(data.cb_wa_compat === 'true');
    if (data.cb_thermal_proxy) setThermalProxy(data.cb_thermal_proxy);
    if (data.cb_mobile_orders) setMobileOrders(data.cb_mobile_orders.map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) })));
    alert("System database restored successfully from file.");
  };

  const handleUpdateStaff = async (staffId: string, updates: Partial<Staff>) => {
    const existing = staffList.find(s => s.id === staffId);
    const fullUpdate = sanitize({ ...existing, ...updates });
    setStaffList(prev => prev.map(s => s.id === staffId ? { ...s, ...updates } : s));
    if (activeUid) {
      try { await db.collection("users").doc(activeUid).collection("staff").doc(staffId).set(fullUpdate, { merge: true }); } catch (e) {}
    }
  };

  const handleAddStaff = async (staff: Omit<Staff, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newStaff = sanitize({ ...staff, id });
    setStaffList(prev => [...prev, { ...staff, id }]);
    if (activeUid) {
      try { await db.collection("users").doc(activeUid).collection("staff").doc(id).set(newStaff); } catch (e) {}
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    setStaffList(prev => prev.filter(s => s.id !== staffId));
    if (activeUid) {
      try { await db.collection("users").doc(activeUid).collection("staff").doc(staffId).delete(); } catch (e) {}
    }
  };

  const handleUpdateAttendant = async (id: string, updates: Partial<Attendant>) => {
    const existing = attendantsList.find(s => s.id === id);
    const fullUpdate = sanitize({ ...existing, ...updates });
    setAttendantsList(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    if (activeUid) {
      try { await db.collection("users").doc(activeUid).collection("attendants").doc(id).set(fullUpdate, { merge: true }); } catch (e) {}
    }
  };

  const handleAddAttendant = async (staff: Omit<Attendant, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newStaff = sanitize({ ...staff, id });
    setAttendantsList(prev => [...prev, { ...staff, id }]);
    if (activeUid) {
      try { await db.collection("users").doc(activeUid).collection("attendants").doc(id).set(newStaff); } catch (e) {}
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newExpense: Expense = {
      ...expense,
      id,
      timestamp: new Date()
    };
    setExpenses(prev => [newExpense, ...prev]);
    if (activeUid) {
      try {
        await db.collection("users").doc(activeUid).collection("expenses").doc(id).set({
          ...newExpense,
          timestamp: firebase.firestore.Timestamp.fromDate(newExpense.timestamp)
        });
      } catch (e) {
        console.error("Failed to add expense", e);
      }
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    if (activeUid) {
      try {
        await db.collection("users").doc(activeUid).collection("products").doc(product.id).set(sanitize(product), { merge: true });
      } catch (e) {
        console.error("Product sync failed", e);
      }
    }
  };

  const handleUpdateProductField = async (productId: string, field: keyof Product, value: any) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, [field]: value } : p));
    if (activeUid) {
      try {
        await db.collection("users").doc(activeUid).collection("products").doc(productId).update({ [field]: value });
      } catch (e) {
        console.error("Product field sync failed", e);
      }
    }
  };

  const handleAddProduct = async (product: Product) => {
    setProducts(prev => [product, ...prev]);
    if (activeUid) {
      try {
        await db.collection("users").doc(activeUid).collection("products").doc(product.id).set(sanitize(product));
      } catch (e) {
        console.error("Add product sync failed", e);
      }
    }
  };

  const handleRemoveAttendant = async (id: string) => {
    setAttendantsList(prev => prev.filter(s => s.id !== id));
    if (activeUid) {
      try { await db.collection("users").doc(activeUid).collection("attendants").doc(id).delete(); } catch (e) {}
    }
  };

  const addToCart = (product: Product, modifiers: Modifier[] = [], weight?: number) => {
    const qty = weight || 1;
    const cartId = Math.random().toString(36).substr(2, 9);
    const newItem: CartItem = {
      cartId,
      productId: product.id,
      name: product.name,
      price: product.price + modifiers.reduce((acc, m) => acc + m.price, 0),
      costPrice: product.costPrice || 0,
      quantity: qty,
      type: product.type,
      selectedModifiers: modifiers,
      taxRate: TAX_RATE,
    };
    setCart(prev => [...prev, newItem]);
  };

  // Barcode Scanner Listener
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      const currentTime = Date.now();
      // If more than 50ms between keystrokes, reset buffer (scanners type very fast)
      if (currentTime - lastKeyTime > 50) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 0) {
          // Process barcode
          const scannedProduct = products.find(p => p.barcode === barcodeBuffer);
          if (scannedProduct) {
            addToCart(scannedProduct);
            playAlertSound();
          }
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1) {
        // Append printable characters
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  const updateCartQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = item.type === ItemType.WEIGHT ? Math.max(0.1, item.quantity + (delta * 0.1)) : Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleParkToHub = (label?: string) => {
    if (cart.length === 0) return;
    const orderId = Math.random().toString(36).substr(2, 5).toUpperCase();
    const newOrder: MobileOrder = {
      id: orderId,
      items: [...cart],
      customerName: label || `Table ${activeTableLabel || '?' }`,
      tableNumber: activeTableLabel,
      timestamp: new Date(),
      assignedServerId: currentServer?.id
    };
    setMobileOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setActiveTableLabel('');
    setCurrentServer(null);
    if (activeUid) {
      const firestorePayload = sanitize({
        ...newOrder,
        timestamp: firebase.firestore.Timestamp.fromDate(newOrder.timestamp)
      });
      db.collection("users").doc(activeUid).collection("mobile_orders").doc(orderId).set(firestorePayload);
    }
  };

  const handleMergeOrders = (sourceId: string, targetId: string) => {
    setMobileOrders(prev => {
      const source = prev.find(o => o.id === sourceId);
      const target = prev.find(o => o.id === targetId);
      if (!source || !target) return prev;
      const mergedItems = [...target.items, ...source.items];
      const updatedOrders = prev
        .filter(o => o.id !== sourceId)
        .map(o => o.id === targetId ? { ...o, items: mergedItems } : o);
      if (activeUid) {
        db.collection("users").doc(activeUid).collection("mobile_orders").doc(sourceId).delete();
        db.collection("users").doc(activeUid).collection("mobile_orders").doc(targetId).update(sanitize({ items: mergedItems }));
      }
      return updatedOrders;
    });
  };

  const handleAcceptMobileOrder = (order: MobileOrder) => {
    setCart(order.items);
    setActiveTableLabel(order.tableNumber || '');
    if (order.assignedServerId) {
       const server = attendantsList.find(s => s.id === order.assignedServerId) as any;
       if (server) setCurrentServer(server);
    }
    setMobileOrders(prev => prev.filter(o => o.id !== order.id));
    if (activeUid) db.collection("users").doc(activeUid).collection("mobile_orders").doc(order.id).delete();
    setShowMobileOrders(false);
    setShowServerHub(false);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleFinalizeSale = async (payments: PaymentRecord[], customerName?: string, discount: number = 0, customerPhone?: string, couponRedeemed: number = 0) => {
    if (tokens <= 0) { alert("Terminal Locked: No Tokens Remaining"); return; }
    const transactionId = Math.random().toString(36).substr(2, 5).toUpperCase();
    const now = new Date();
    
    const finalSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = finalSubtotal - discount;

    // Calculate coupon earned based on dynamic rate
    const couponEarned = finalTotal * (couponRate / 100);

    const itemsWithValidatedCost = cart.map(item => ({
      ...item,
      costPrice: typeof item.costPrice === 'number' && !isNaN(item.costPrice) ? item.costPrice : 0,
    }));

    const transactionData: TransactionRecord = {
      id: transactionId,
      timestamp: now,
      sellerName: currentStaff?.name || 'Manager',
      serverId: currentServer?.id,
      serverName: currentServer?.name,
      tableLabel: activeTableLabel,
      items: itemsWithValidatedCost,
      payments: payments,
      total: finalTotal,
      subtotal: finalSubtotal,
      discount: discount,
      couponApplied: couponRedeemed > 0,
      couponEarned: couponEarned,
      couponRate: couponRate,
      mode: systemMode,
      offline: !isOnline,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
    };
    
    // Prepend to history for instant UI update
    setHistory(prev => [transactionData, ...prev]);
    setTokens(prev => Math.max(0, prev - 1));
    
    const updatedProducts = products.map(p => {
      const sold = cart.find(i => i.productId === p.id);
      return sold ? { ...p, stock: Math.max(0, p.stock - sold.quantity) } : p;
    });
    setProducts(updatedProducts);
    
    setShowCheckout(false);
    setShowReceipt(transactionData);
    setCart([]);
    setCurrentServer(null);
    setActiveTableLabel('');

    // Update customer balance if phone is provided
    if (customerPhone) {
      handleSaveCustomer(customerPhone, customerName || '', transactionId, couponEarned, couponRedeemed);
    }
    
    if (activeUid) {
      setIsSyncing(true);
      try {
        // Sync stock changes to Firestore
        const stockUpdates = cart.map(async (item) => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const newStock = Math.max(0, product.stock - item.quantity);
            return db.collection("users").doc(activeUid).collection("products").doc(item.productId).update({ stock: newStock });
          }
        });
        await Promise.all(stockUpdates);

        const firestorePayload = {
          id: transactionData.id,
          timestamp: firebase.firestore.Timestamp.fromDate(transactionData.timestamp),
          sellerName: transactionData.sellerName,
          serverId: transactionData.serverId || null,
          serverName: transactionData.serverName || null,
          tableLabel: transactionData.tableLabel || null,
          items: transactionData.items.map(item => ({
            cartId: item.cartId,
            productId: item.productId,
            name: item.name,
            price: item.price,
            costPrice: item.costPrice,
            quantity: item.quantity,
            type: item.type,
            selectedModifiers: item.selectedModifiers.map(m => ({ id: m.id, name: m.name, price: m.price })),
            taxRate: item.taxRate,
          })),
          payments: transactionData.payments.map(p => ({ method: p.method, amount: p.amount })),
          total: transactionData.total,
          subtotal: transactionData.subtotal,
          discount: transactionData.discount || 0,
          couponApplied: transactionData.couponApplied || false,
          couponEarned: transactionData.couponEarned || 0,
          couponRate: transactionData.couponRate || 0,
          mode: transactionData.mode,
          offline: transactionData.offline || false,
          customerName: transactionData.customerName || null,
          customerPhone: transactionData.customerPhone || null,
        };
        await db.collection("users").doc(activeUid).collection("history").doc(transactionId).set(firestorePayload);
        await db.collection("users").doc(activeUid).collection("config").doc("terminal").update({ tokens: Math.max(0, tokens - 1) });
      } catch (e) {
        console.error("Sale sync failed", e);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleDeductWhatsAppToken = async () => {
    setWhatsappTokens(prev => Math.max(0, prev - 1));
    if (activeUid) {
      try {
        await db.collection("users").doc(activeUid).collection("config").doc("terminal").update({ whatsappTokens: whatsappTokens - 1 });
      } catch (e) { console.error("Failed to sync token deduction."); }
    }
  };

  const handleTokenRecharge = async (amount: number, type: 'SALES' | 'WHATSAPP') => {
    if (type === 'SALES') {
      const newVal = tokens + amount;
      setTokens(newVal);
      if (activeUid) await db.collection("users").doc(activeUid).collection("config").doc("terminal").set({ tokens: newVal }, { merge: true });
    } else {
      const newVal = whatsappTokens + amount;
      setWhatsappTokens(newVal);
      if (activeUid) await db.collection("users").doc(activeUid).collection("config").doc("terminal").set({ whatsappTokens: newVal }, { merge: true });
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const transactionToDelete = history.find(tx => tx.id === transactionId);
    if (!transactionToDelete) return;

    // Ask for confirmation
    if (!window.confirm(`Are you sure you want to permanently delete transaction #${transactionId}? This action cannot be undone.`)) {
      return;
    }

    // 1. Reverse stock levels
    const stockUpdates: { [productId: string]: number } = {};
    transactionToDelete.items.forEach(item => {
      stockUpdates[item.productId] = (stockUpdates[item.productId] || 0) + item.quantity;
    });

    setProducts(prevProducts => 
      prevProducts.map(p => 
        stockUpdates[p.id] ? { ...p, stock: p.stock + stockUpdates[p.id] } : p
      )
    );

    // 2. Remove transaction from local state
    setHistory(prev => prev.filter(tx => tx.id !== transactionId));

    // 3. Sync changes to Firestore
    if (activeUid) {
      setIsSyncing(true);
      try {
        // Sync stock updates
        const stockUpdatePromises = Object.keys(stockUpdates).map(productId => {
          const product = products.find(p => p.id === productId);
          if (product) {
            const newStock = product.stock + stockUpdates[productId];
            return db.collection("users").doc(activeUid).collection("products").doc(productId).update({ stock: newStock });
          }
          return Promise.resolve();
        });
        await Promise.all(stockUpdatePromises);

        // Delete transaction from Firestore
        await db.collection("users").doc(activeUid).collection("history").doc(transactionId).delete();
        
        alert(`Transaction #${transactionId} has been deleted and stock levels have been restored.`);

      } catch (e) {
        console.error("Transaction deletion sync failed", e);
        // If sync fails, we should ideally revert local state changes, but for now, we'll just alert the user.
        alert("Error deleting transaction from the cloud. Please check your connection and try again.");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleSendMobileOrder = async (order: MobileOrder) => {
    if (activeUid) {
      const firestorePayload = sanitize({
        ...order,
        timestamp: firebase.firestore.Timestamp.fromDate(order.timestamp)
      });
      await db.collection("users").doc(activeUid).collection("mobile_orders").doc(order.id).set(firestorePayload);
    } else {
      setMobileOrders(prev => [...prev, order]);
    }
  };

  const handleUpdateBusinessName = async (name: string) => {
    setBusinessName(name);
    if (activeUid) {
      await db.collection("pos_accounts").doc(activeUid).set({ businessName: name }, { merge: true });
    }
  };

  const handleUpdateCategories = async (newCategories: string[]) => {
    setCategories(newCategories);
    if (activeUid) {
      await db.collection("users").doc(activeUid).collection("config").doc("terminal").set({ categories: newCategories }, { merge: true });
    }
  };

  const handleUpdateCouponRate = async (rate: number) => {
    setCouponRate(rate);
    if (activeUid) {
      await db.collection("users").doc(activeUid).collection("config").doc("terminal").set({ couponRate: rate }, { merge: true });
    }
  };

  const handleLogout = () => { auth.signOut(); setCurrentStaff(null); setView(AppView.LOGIN); };

  if (authLoading) return <div className="h-screen bg-gray-900 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (view === AppView.LOGIN) return <LoginScreen setSystemMode={setSystemMode} onPasswordRecovery={() => {}} />;
  if (view === AppView.STAFF_LOGIN) return <StaffLoginScreen staffList={staffList} onStaffAuthenticated={(s) => { setCurrentStaff(s); setView(AppView.SALES); }} onLogoutManager={handleLogout} />;

  if (accountStatus === 'SHUTDOWN' && !isMasterMode) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">Account Suspended</h1>
          <p className="text-gray-500 font-bold mb-8 uppercase text-xs tracking-widest leading-loose">
            This account has been shut down by the system administrator. Please contact support for more information.
          </p>
          <button onClick={() => auth.signOut()} className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl uppercase tracking-widest text-sm">Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {impersonatedUid && (
        <div className="bg-amber-500 text-amber-950 px-6 py-2 flex justify-between items-center font-black text-[10px] uppercase tracking-widest shadow-lg z-[100]">
          <div className="flex items-center gap-3">
            <span className="animate-pulse">⚠️ IMPERSONATION MODE ACTIVE</span>
            <span className="opacity-50">UID: {impersonatedUid}</span>
          </div>
          <button onClick={stopImpersonating} className="bg-amber-950 text-white px-4 py-1 rounded-full hover:bg-black transition-all">STOP IMPERSONATING</button>
        </div>
      )}
      {/* Notifications */}
      {newOrderNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] bg-orange-600 text-gray-900 px-10 py-5 rounded-[2.5rem] shadow-[0_20px_60px_rgba(234,88,12,0.6)] font-black uppercase text-sm animate-in slide-in-from-top-12 duration-500 flex items-center gap-5 border-4 border-orange-400">
           <div className="bg-gray-900 p-2 rounded-full">
             <svg className="w-6 h-6 text-orange-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
           </div>
           <span className="tracking-tight">{newOrderNotification}</span>
        </div>
      )}

      {inventoryNotification && (
        <div className="fixed top-48 left-1/2 -translate-x-1/2 z-[2000] bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black uppercase text-xs animate-in slide-in-from-top-8 duration-500 flex items-center gap-4 border-2 border-red-400">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <span>{inventoryNotification}</span>
        </div>
      )}

      <TopBar 
        staff={currentStaff}
        time={new Date()}
        onLogout={handleLogout}
        onSwitchStaff={() => setView(AppView.STAFF_LOGIN)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenInventory={() => setShowInventory(true)}
        onOpenServerHub={() => setShowServerHub(true)}
        onOpenTokenRecharge={() => setShowTokenRecharge(true)}
        onOpenCRM={() => setShowCRM(true)}
        onSimulateOrder={() => {}} 
        lowStockCount={products.filter(p => p.stock < STOCK_THRESHOLD).length}
        isEditMode={false}
        onToggleEditMode={() => {}}
        onOpenQRCode={() => setShowQRCode(true)}
        onOpenMobileOrders={() => setShowMobileOrders(true)}
        mobileOrderCount={mobileOrders.length}
        systemMode={systemMode}
        tokens={tokens}
        whatsappTokens={whatsappTokens}
        isTerminalLocked={isTerminalLocked || (accountStatus === 'RESTRICTED' && !isMasterMode)}
        isOnline={isOnline}
        isSyncing={isSyncing}
        isMaster={isMasterMode}
        onOpenStaffManagement={() => setShowStaffManagement(true)}
        onOpenMasterDashboard={() => setShowMasterDashboard(true)}
        onOpenPrismaticAudit={() => setShowPrismaticAudit(true)}
      />

      {showPrismaticAudit && (
        <PrismaticAuditModal 
          checkpoints={auditCheckpoints}
          onClose={() => setShowPrismaticAudit(false)}
        />
      )}

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 p-6">
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold shadow-sm outline-none transition-all text-gray-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>{cat}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ProductGrid 
              products={products}
              category={selectedCategory}
              search={search}
              currencySymbol={currencySymbol}
              onSelect={(p) => {
                if (p.modifiers) setShowModifier(p);
                else if (p.type === ItemType.WEIGHT) setShowWeight(p);
                else addToCart(p);
              }}
            />
          </div>
        </div>

        <div className="w-[420px] bg-white border-l shadow-2xl flex flex-col z-10">
          <Cart 
            items={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            currencySymbol={currencySymbol}
            currentServer={currentServer}
            onOpenServerSelect={() => setShowServerSelect(true)}
            onRemoveServer={() => setCurrentServer(null)}
            systemMode={systemMode}
            tableLabel={activeTableLabel}
            onUpdateTableLabel={setActiveTableLabel}
            onParkToHub={handleParkToHub}
          />
        </div>
      </main>

      <BottomBar 
        subtotal={subtotal} 
        tax={tax} 
        total={total} 
        currencySymbol={currencySymbol} 
        onPay={() => setShowCheckout(true)} 
        onShowHistory={() => setShowHistory(true)} 
        disabled={cart.length === 0} 
        tokens={tokens}
        todayProfit={todayStats.profit}
        todayCost={todayStats.cost}
        todayRevenue={todayStats.revenue}
        isMaster={isMasterMode}
        canSeeProfit={currentStaff?.role === 'Manager'}
        onOpenProfitHistory={() => setShowProfitHistory(true)}
      />

      {showCheckout && <CheckoutModal total={total} currencySymbol={currencySymbol} customers={customers} onClose={() => setShowCheckout(false)} onComplete={handleFinalizeSale} />}
      {showHistory && <HistoryModal history={history} currencySymbol={currencySymbol} onClose={() => setShowHistory(false)} onReprint={setShowReceipt} onDeleteTransaction={handleDeleteTransaction} currentStaff={currentStaff} />}
      {showSettings && <SettingsModal 
        currencySymbol={currencySymbol} 
        onSetCurrency={setCurrencySymbol} 
        whatsappApi={whatsappApi} 
        onSetWhatsappApi={setWhatsappApi} 
        whatsappMethod={whatsappMethod} 
        onSetWhatsappMethod={setWhatsappMethod} 
        whatsappCompatibilityMode={whatsappCompatibilityMode} 
        onSetWhatsappCompatibilityMode={setWhatsappCompatibilityMode} 
        thermalProxy={thermalProxy} 
        onSetThermalProxy={setThermalProxy} 
        onOpenRecharge={() => setShowTokenRecharge(true)} 
        onSimulateOrder={() => {}} 
        onClose={() => setShowSettings(false)} 
        onRestoreData={handleRestoreData} 
        printerType={printerType}
        onSetPrinterType={setPrinterType}
        firstTimeMessage={firstTimeMessage}
        onSetFirstTimeMessage={setFirstTimeMessage}
        businessName={businessName}
        onSetBusinessName={handleUpdateBusinessName}
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
        couponRate={couponRate}
        onUpdateCouponRate={handleUpdateCouponRate}
      />}
      {showInventory && <InventoryModal products={products} history={history} expenses={expenses} onAddExpense={handleAddExpense} currencySymbol={currencySymbol} onUpdateStock={(id, s) => handleUpdateProductField(id, 'stock', s)} onEditProduct={setEditingProduct} onUpdateProductField={handleUpdateProductField} onAddNewProduct={() => setShowAddProduct(true)} onClose={() => setShowInventory(false)} isMaster={isMasterMode} isManagerOverride={isManagerOverride} onSetManagerOverride={setIsManagerOverride} />}
      {showAddProduct && <AddProductModal onAdd={(p) => { handleAddProduct(p); setShowAddProduct(false); }} onClose={() => setShowAddProduct(false)} currencySymbol={currencySymbol} categories={categories} />}
      {editingProduct && <EditProductModal product={editingProduct} onUpdate={(p) => { handleUpdateProduct(p); setEditingProduct(null); }} onClose={() => setEditingProduct(null)} currencySymbol={currencySymbol} categories={categories} />}
      {showModifier && <ModifierModal product={showModifier} currencySymbol={currencySymbol} onConfirm={(mods) => { addToCart(showModifier, mods); setShowModifier(null); }} onClose={() => setShowModifier(null)} />}
      {showWeight && <WeightModal product={showWeight} currencySymbol={currencySymbol} onConfirm={(w) => { addToCart(showWeight, [], w); setShowWeight(null); }} onClose={() => setShowWeight(null)} />}
      {showReceipt && (
        <ReceiptModal 
          transaction={showReceipt} 
          staff={currentStaff} 
          currencySymbol={currencySymbol} 
          onClose={() => setShowReceipt(null)} 
          onReturnToMainMenu={() => setShowReceipt(null)} 
          onSaveCustomer={handleSaveCustomer}
          whatsappApi={whatsappApi}
          whatsappMethod={whatsappMethod}
          whatsappCompatibilityMode={whatsappCompatibilityMode}
          thermalProxy={thermalProxy}
          whatsappTokens={whatsappTokens}
          onDeductToken={handleDeductWhatsAppToken}
          customers={customers}
          printerType={printerType}
          firstTimeMessageTemplate={firstTimeMessage}
          businessName={businessName}
        />
      )}
      {showServerSelect && <ServerModal attendants={attendantsList} onSelect={setCurrentServer} onClose={() => setShowServerSelect(false)} />}
      {showTokenRecharge && <TokenRechargeModal onRecharge={handleTokenRecharge} onClose={() => setShowTokenRecharge(false)} currencySymbol={currencySymbol} />}
      {showCRM && <CRMModal customers={customers} onClose={() => setShowCRM(false)} whatsappTokens={whatsappTokens} onUpdateName={(p, n) => handleSaveCustomer(p, n)} />}
      {showStaffManagement && <StaffManagementModal staffList={staffList} attendantsList={attendantsList} onClose={() => setShowStaffManagement(false)} onUpdateStaff={handleUpdateStaff} onAddStaff={handleAddStaff} onRemoveStaff={handleRemoveStaff} onUpdateAttendant={handleUpdateAttendant} onAddAttendant={handleAddAttendant} onRemoveAttendant={handleRemoveAttendant} />}
      {showQRCode && <QRCodeModal onClose={() => setShowQRCode(false)} />}
      {showMobileOrders && <MobileOrdersModal orders={mobileOrders} attendants={attendantsList} currencySymbol={currencySymbol} onAccept={handleAcceptMobileOrder} onEdit={setEditingMobileOrder} onAssignServer={(id, s) => {
         setMobileOrders(prev => prev.map(o => o.id === id ? { ...o, assignedServerId: s } : o));
         if (activeUid) db.collection("users").doc(activeUid).collection("mobile_orders").doc(id).update(sanitize({ assignedServerId: s }));
      }} onClose={() => setShowMobileOrders(false)} />}
      {showServerHub && <ServerHubModal orders={mobileOrders} attendants={attendantsList} currencySymbol={currencySymbol} onAccept={handleAcceptMobileOrder} onEdit={setEditingMobileOrder} onAssignServer={(id, s) => {
         setMobileOrders(prev => prev.map(o => o.id === id ? { ...o, assignedServerId: s } : o));
         if (activeUid) db.collection("users").doc(activeUid).collection("mobile_orders").doc(id).update(sanitize({ assignedServerId: s }));
      }} onMerge={handleMergeOrders} onClose={() => setShowServerHub(false)} />}
      {editingMobileOrder && <EditMobileOrderModal order={editingMobileOrder} products={products} onUpdate={(o) => {
         setMobileOrders(prev => prev.map(old => old.id === o.id ? o : old));
         if (activeUid) db.collection("users").doc(activeUid).collection("mobile_orders").doc(o.id).update(sanitize({ items: o.items }));
         setEditingMobileOrder(null);
      }} onClose={() => setEditingMobileOrder(null)} currencySymbol={currencySymbol} />}
      {showMasterDashboard && user && (
        <MasterDashboardModal 
          onClose={() => setShowMasterDashboard(false)} 
          onImpersonate={handleImpersonate} 
          currentImpersonatedUid={impersonatedUid}
          masterUid={user.uid}
        />
      )}
      {showProfitHistory && (
        <ProfitHistoryModal 
          history={history} 
          products={products}
          onClose={() => setShowProfitHistory(false)} 
          currencySymbol={currencySymbol} 
        />
      )}
    </div>
  );
};

export default App;