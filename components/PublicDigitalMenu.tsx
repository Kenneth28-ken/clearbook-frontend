
import React, { useState, useEffect } from 'react';
import { db, firebase } from '../firebase';
import { Product, CartItem, ItemType, MenuTheme, SystemMode } from '../types';
import { ShoppingCart, Plus, Minus, Search, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PublicDigitalMenuProps {
  businessUid: string;
}

const PublicDigitalMenu: React.FC<PublicDigitalMenuProps> = ({ businessUid }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [businessName, setBusinessName] = useState('Digital Menu');
  const [currencySymbol, setCurrencySymbol] = useState('₦');
  const [menuTheme, setMenuTheme] = useState<MenuTheme>(MenuTheme.PASTEL);
  const [systemMode, setSystemMode] = useState<SystemMode>(SystemMode.RESTAURANT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'IDLE' | 'PLACING' | 'SUCCESS'>('IDLE');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [showTablePrompt, setShowTablePrompt] = useState(false);

  useEffect(() => {
    if (!businessUid) {
      setError("No Business ID provided in the URL.");
      setLoading(false);
      return;
    }
    
    // Check if Firebase is configured
    if (!db || !db.app) {
      setError("System configuration error: Firebase is not initialized.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Timeout for loading
    const timeoutId = setTimeout(() => {
      // Use the latest value of loading from the current render cycle
      // If we are still loading, it's likely a connection or permission issue
      console.warn("Firestore menu load timed out for UID:", businessUid);
      setError("The menu is taking too long to load. This can happen if the business hasn't set up their products yet or if there's a connectivity issue.");
      setLoading(false);
    }, 12000); // Increased to 12 seconds

    console.log("Starting menu fetch for business:", businessUid);

    // Check URL for table number
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table');
    if (table) setTableNumber(table);
    else if (systemMode === SystemMode.RESTAURANT) setShowTablePrompt(true);

    // Fetch Business Info
    const unsubConfig = db.collection("users").doc(businessUid).collection("config").doc("terminal")
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data?.businessName) setBusinessName(data.businessName);
          if (data?.currency) setCurrencySymbol(data.currency);
          if (data?.menuTheme) setMenuTheme(data.menuTheme as MenuTheme);
          if (data?.systemMode) setSystemMode(data.systemMode as SystemMode);
          if (data?.categories) setCategories(['All', ...data.categories]);
        }
      }, (err: any) => {
        console.error("Config fetch error:", err);
      });

    // Check Master Enablement
    const unsubAccount = db.collection("pos_accounts").doc(businessUid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data?.menuEnabled === false) {
            setError("This digital menu has been deactivated by the administrator.");
            setLoading(false);
          }
          if (data?.status === 'SHUTDOWN') {
            setError("This account is currently inactive.");
            setLoading(false);
          }
        }
      });

    // Fetch Products
    const unsubProducts = db.collection("users").doc(businessUid).collection("products")
      .onSnapshot((snapshot) => {
        try {
          const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setProducts(fetched);
          setLoading(false);
          clearTimeout(timeoutId);
        } catch (err) {
          console.error("Product mapping error:", err);
          setError("Failed to parse menu data.");
          setLoading(false);
        }
      }, (err: any) => {
        console.error("Products fetch error:", err);
        const isPermissionError = err.message?.toLowerCase().includes("permission") || err.code === 'permission-denied';
        setError(isPermissionError 
          ? "Access Denied: Menu products cannot be loaded. Security rules check failed."
          : `Could not load menu: ${err.message}`);
        setLoading(false);
      });

    return () => {
      unsubConfig();
      unsubAccount();
      unsubProducts();
      clearTimeout(timeoutId);
    };
  }, [businessUid]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      const newItem: CartItem = {
        cartId: `mobile_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        costPrice: product.costPrice,
        quantity: 1,
        type: product.type,
        selectedModifiers: []
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.productId !== productId);
    });
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      alert("Please enter your name");
      return;
    }

    setOrderStatus('PLACING');
    
    try {
      const orderId = `MOB-${Date.now().toString().slice(-6)}`;
      await db.collection("users").doc(businessUid).collection("mobile_orders").doc(orderId).set({
        id: orderId,
        items: cart,
        customerName: customerName,
        tableNumber: tableNumber,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'PENDING'
      });
      
      // Haptic feedback if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }
      
      setOrderStatus('SUCCESS');
      setCart([]);
      setTimeout(() => setOrderStatus('IDLE'), 8000); // 8 seconds visibility for success
    } catch (e) {
      console.error("Order failed:", e);
      setOrderStatus('IDLE');
      alert("Something went wrong. Please try again.");
    }
  };

  const getThemeColors = () => {
    switch (menuTheme) {
      case MenuTheme.WHITE: return { bg: 'bg-white', card: 'bg-white', text: 'text-gray-900' };
      case MenuTheme.VIBRANT: return { bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900' };
      default: return { bg: 'bg-blue-50/30', card: 'bg-white', text: 'text-gray-900' };
    }
  };

  const themeColors = getThemeColors();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Loading Menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-10 text-center">
        <div className="max-w-sm">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase">Menu Unavailable</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            {error}
            <br />
            <span className="text-[10px] text-gray-400 mt-4 block font-mono">Ref: {businessUid}</span>
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all active:scale-95"
            >
              Try to Reconnect
            </button>
            <p className="text-[10px] text-gray-400 font-medium">Please ensure the business owner has deployed their digital menu rules.</p>
          </div>
        </div>
      </div>
    );
  }

  const getProductColor = (product: Product) => {
    if (menuTheme === MenuTheme.WHITE) return 'bg-white';
    
    const palettes = {
      [MenuTheme.PASTEL]: ['bg-blue-50', 'bg-red-50', 'bg-green-50', 'bg-yellow-50', 'bg-purple-50', 'bg-pink-50', 'bg-indigo-50', 'bg-orange-50'],
      [MenuTheme.VIBRANT]: ['bg-blue-100', 'bg-red-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100', 'bg-indigo-100', 'bg-orange-100'],
    };

    if (product.color && product.color !== 'bg-white') return product.color;

    const selectedPalette = palettes[menuTheme] || palettes[MenuTheme.PASTEL];
    const str = (product.category + product.name).toLowerCase();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % selectedPalette.length;
    return selectedPalette[index];
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen ${themeColors.bg} font-sans pb-32`}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 px-6 py-6 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-gray-900">{businessName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Digital Menu
              </p>
              {tableNumber && (
                <span className="bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">
                  Table {tableNumber}
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-900" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-8">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search for items..."
            className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm focus:outline-none focus:border-blue-500 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
          {(categories.length > 0 ? categories : ['All']).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 shadow-sm border ${
                selectedCategory === cat 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => {
              const cartItem = cart.find(item => item.productId === product.id);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={product.id}
                  className={`${getProductColor(product)} p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group active:shadow-md transition-shadow`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{product.category}</p>
                    <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                    <p className="text-lg font-black text-gray-900">{currencySymbol}{product.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-4">
                    {cartItem ? (
                      <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                        <button 
                          onClick={() => removeFromCart(product.id)}
                          className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center shadow hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="w-10 text-center font-black text-gray-900">{cartItem.quantity}</span>
                        <button 
                          onClick={() => addToCart(product)}
                          className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center shadow hover:bg-green-50 hover:text-green-600 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all active:scale-90"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Checkout Bar */}
      <AnimatePresence>
        {cart.length > 0 && orderStatus === 'IDLE' && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]"
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex gap-3">
                <input 
                  type="text"
                  placeholder="Your Name / Ref"
                  className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-sm focus:outline-none focus:border-blue-500"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                {systemMode === SystemMode.RESTAURANT && (
                  <input 
                    type="text"
                    placeholder="Table #"
                    className="w-24 bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-sm text-center focus:outline-none focus:border-blue-500"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                )}
              </div>
              <button 
                onClick={placeOrder}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-600 transition-all active:scale-95 shadow-xl"
              >
                PLACE ORDER • {currencySymbol}{total.toLocaleString()}
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Number Prompt */}
      <AnimatePresence>
        {showTablePrompt && !tableNumber && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Welcome!</h2>
              <p className="text-gray-500 font-medium mb-8">Please enter your table number to view the menu.</p>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Enter Table Number"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-5 text-center font-black text-2xl outline-none shadow-inner"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  autoFocus
                />
                <button 
                  onClick={() => setShowTablePrompt(false)}
                  disabled={!tableNumber}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${
                    tableNumber ? 'bg-gray-900 text-white active:scale-95 hover:bg-blue-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Table
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {orderStatus !== 'IDLE' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-12 w-full max-w-sm text-center shadow-2xl overflow-hidden relative"
            >
              {orderStatus === 'PLACING' ? (
                <div className="space-y-6">
                  <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Sending Order...</h2>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                    <Check className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Order Confirmed!</h2>
                    <p className="text-gray-500 font-medium">Head to the counter or wait for your server.</p>
                  </div>
                  <button 
                    onClick={() => setOrderStatus('IDLE')}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicDigitalMenu;
