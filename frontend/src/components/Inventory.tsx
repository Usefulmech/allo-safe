import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { databases, DB_ID, COL_INVENTORY } from '../lib/appwrite';
import { Query, ID } from 'appwrite';
import { useAuth } from '../lib/AuthContext';

export default function Inventory() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemThreshold, setNewItemThreshold] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        DB_ID,
        COL_INVENTORY,
        [
          Query.equal('user_id', user.$id),
          Query.orderAsc('name')
        ]
      );
      setItems(response.documents);
    } catch (error) {
      console.error("Error fetching inventory", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newItemName || !newItemQty) return;

    setIsSubmitting(true);
    try {
      await databases.createDocument(
        DB_ID,
        COL_INVENTORY,
        ID.unique(),
        {
          user_id: user.$id,
          name: newItemName,
          quantity: parseInt(newItemQty) || 0,
          price: parseFloat(newItemPrice) || 0,
          threshold: parseInt(newItemThreshold) || 5,
        }
      );
      
      // Reset and close
      setNewItemName('');
      setNewItemQty('');
      setNewItemPrice('');
      setNewItemThreshold('');
      setIsAddModalOpen(false);
      
      // Refresh list
      fetchInventory();
    } catch (err) {
      console.error("Failed to add item", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && items.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-accent"><span className="material-symbols-outlined animate-spin text-4xl">refresh</span></div>;
  }

  return (
    <div className="text-text-primary min-h-screen font-inter relative">
      <main className="px-4 md:px-8 py-6 w-full max-w-[1600px] mx-auto pb-32 md:pb-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-primary">{t('navInventory') || 'Inventory'}</h2>
            <p className="text-sm text-text-secondary">Manage your market items</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 active:scale-95 transition-transform shadow-md text-sm cursor-pointer hover:bg-primary-hover"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            <span className="hidden sm:inline">{t('addStock') || 'Add Item'}</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 md:col-span-2">
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Total Inventory Value</span>
            <p className="text-2xl font-bold text-primary mt-1">
              ₦{items.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20">
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Total Items</span>
            <p className="text-2xl font-bold text-primary mt-1">{items.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-danger/30">
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Low Stock</span>
            <p className="text-2xl font-bold text-danger mt-1">
              {items.filter(i => i.quantity <= (i.threshold || 5)).length} <span className="text-sm">Items</span>
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
          <input
            className="w-full h-12 pl-12 pr-4 bg-white border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all shadow-sm"
            placeholder="Search inventory..."
            type="text"
          />
        </div>

        {/* Inventory Grid — 2 col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const goal = (item.threshold || 10) * 4;
            const pct = Math.min(100, Math.max(0, (item.quantity / goal) * 100));

            let status = 'good';
            if (item.quantity <= (item.threshold || 5)) status = 'critical';
            else if (pct < 30) status = 'low';

            return (
              <div key={item.$id} className="bg-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-outline-variant/20">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-text-primary text-base">{item.name}</h4>
                    {status === 'critical' && <span className="bg-danger-surface text-danger text-[10px] font-bold px-2 py-0.5 rounded uppercase">Critical</span>}
                    {status === 'low' && <span className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-0.5 rounded uppercase">Low</span>}
                    {status === 'good' && <span className="bg-success-surface text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">Good</span>}
                  </div>
                  <p className="text-sm text-text-secondary font-medium">Est. Value: ₦{((item.price || 0) * item.quantity).toLocaleString()}</p>
                </div>

                <div className="p-4 bg-surface-container/30">
                  <div className="flex justify-between text-sm font-bold text-primary mb-2">
                    <span>{item.quantity} {item.unit || 'units'}</span>
                    <span className="text-text-secondary font-medium text-xs">Target: {goal}</span>
                  </div>
                  <div className="w-full bg-outline-variant/30 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${status === 'critical' ? 'bg-danger' : status === 'low' ? 'bg-accent' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Voice FAB - mobile only */}
      <button
        className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40 border-2 border-white/20"
        onClick={() => setIsVoiceActive(true)}
      >
        <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
      </button>

      {/* Voice Overlay */}
      <div className={`fixed inset-0 bg-primary/90 backdrop-blur-sm z-[60] flex-col items-center justify-center p-6 transition-opacity duration-300 ${isVoiceActive ? 'flex opacity-100' : 'hidden opacity-0'}`}>
        <div className="bg-white w-full max-w-sm rounded-[32px] p-8 flex flex-col items-center shadow-2xl scale-100 transform transition-transform">
          <div className="flex items-end gap-2 h-16 mb-8">
            {[6, 12, 16, 8, 14].map((h, i) => (
              <div key={i} className="w-2 bg-accent rounded-full animate-bounce" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
          <h4 className="text-2xl font-bold text-primary mb-2">{t('listening') || 'Listening...'}</h4>
          <p className="text-text-secondary text-center mb-10 italic font-medium">"Add ten bags of Oloyin beans..."</p>
          <button
            className="w-full bg-surface-container text-primary py-4 rounded-2xl font-black active:scale-95 transition-transform hover:bg-outline-variant/30"
            onClick={() => setIsVoiceActive(false)}
          >
            {t('cancel') || 'Cancel'}
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
          <div 
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container/30">
              <h3 className="text-lg font-bold text-primary">Add New Inventory Item</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-outline-variant/20 transition-colors text-text-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Item Name</label>
                <input 
                  type="text" 
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full h-12 px-4 border border-outline-variant/50 rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none font-medium"
                  placeholder="e.g., Rice (50kg Bag)"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Quantity</label>
                  <input 
                    type="number" 
                    required
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="w-full h-12 px-4 border border-outline-variant/50 rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none font-medium"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Threshold <span className="text-[10px] normal-case font-normal">(Low Stock)</span></label>
                  <input 
                    type="number" 
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(e.target.value)}
                    className="w-full h-12 px-4 border border-outline-variant/50 rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none font-medium"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Estimated Value (₦)</label>
                <input 
                  type="number" 
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full h-12 px-4 border border-outline-variant/50 rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none font-medium"
                  placeholder="Price per unit"
                />
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-accent text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70 shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">save</span>
                  )}
                  {isSubmitting ? 'Saving Item...' : 'Save Item to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
