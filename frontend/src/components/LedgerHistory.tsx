import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { databases, DB_ID, COL_TRANSACTIONS } from '../lib/appwrite';
import { Query, ID } from 'appwrite';
import { useAuth } from '../lib/AuthContext';

const SwipeableItem = ({ children, onEdit, onDelete }: { children: React.ReactNode; onEdit: () => void; onDelete: () => void }) => {
  const [translateX, setTranslateX] = useState(0);
  const startXRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startXRef.current;
    if (diff < 0 && diff > -160) setTranslateX(diff);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - startXRef.current;
    setTranslateX(diff < -80 ? -160 : 0);
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-outline-variant/30">
      <div className="absolute right-0 top-0 h-full flex">
        <button onClick={onEdit} className="bg-primary text-white w-20 flex flex-col items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[18px]">edit</span>
          <span className="text-[10px] font-bold">EDIT</span>
        </button>
        <button onClick={onDelete} className="bg-danger text-white w-20 flex flex-col items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[18px]">delete</span>
          <span className="text-[10px] font-bold">DELETE</span>
        </button>
      </div>
      <div
        className="relative z-10 bg-white p-4 transition-transform duration-300 ease-out cursor-pointer active:bg-surface-container"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setTranslateX(0)}
      >
        {children}
      </div>
    </div>
  );
};

export default function LedgerHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState('sale');
  const [newTxDesc, setNewTxDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        DB_ID,
        COL_TRANSACTIONS,
        [
          Query.equal('user_id', user.$id),
          Query.orderDesc('timestamp'),
          Query.limit(100)
        ]
      );
      setTransactions(response.documents);
    } catch (error) {
      console.error("Error fetching ledger", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTxAmount) return;

    setIsSubmitting(true);
    try {
      await databases.createDocument(
        DB_ID,
        COL_TRANSACTIONS,
        ID.unique(),
        {
          user_id: user.$id,
          amount: parseFloat(newTxAmount),
          type: newTxType,
          description: newTxDesc || newTxType,
          source: 'manual',
          timestamp: new Date().toISOString()
        }
      );

      // Reset and close
      setNewTxAmount('');
      setNewTxType('sale');
      setNewTxDesc('');
      setIsAddModalOpen(false);

      // Refresh
      fetchTransactions();
    } catch (err) {
      console.error("Failed to save transaction", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transform Appwrite 'type' to our UI Filter names: 'Sale' | 'Expense' | 'Debt'
  const getFilterType = (type: string) => {
    if (type === 'sale') return 'Sale';
    if (type === 'expense') return 'Expense';
    if (type.includes('debt')) return 'Debt';
    return type;
  };

  const filtered = transactions.filter(tr => {
    const matchesFilter = filter === 'All' || getFilterType(tr.type) === filter;
    const matchesSearch = (tr.description || tr.type).toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading && transactions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-accent"><span className="material-symbols-outlined animate-spin text-4xl">refresh</span></div>;
  }

  return (
    <div className="text-text-primary min-h-screen font-inter relative">
      <main className="px-4 md:px-8 py-6 w-full max-w-[1600px] mx-auto space-y-4 pb-32 md:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-primary">{t('navLedger') || 'Ledger History'}</h2>
            <p className="text-sm text-text-secondary">Track your income and expenses</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            <span className="hidden sm:inline">Add Entry</span>
          </button>
        </div>

        {/* Filter Tabs + Search */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['All', 'Sale', 'Expense', 'Debt'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm flex-shrink-0 active:scale-95 transition-all font-medium ${
                  filter === f ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-surface-container border border-outline-variant/30'
                }`}
              >
                {f === 'All' ? (t('filterAll') || 'All') : f === 'Sale' ? (t('filterSales') || 'Sales') : f === 'Expense' ? (t('filterExpenses') || 'Expenses') : (t('filterDebts') || 'Debts')}
              </button>
            ))}
          </div>
          <div className="relative flex-1 md:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-outline-variant/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              placeholder={t('searchPlaceholder') || 'Search...'}
            />
          </div>
        </div>

        {/* Transaction List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length > 0 ? filtered.map((trx) => {
            const uiType = getFilterType(trx.type);
            const color = uiType === 'Sale' ? 'accent' : uiType === 'Debt' ? 'danger' : 'primary';
            const icon = trx.source === 'voice' || trx.source === 'voice_call' ? 'mic' : 'keyboard';

            return (
              <SwipeableItem key={trx.$id} onEdit={() => {}} onDelete={() => {}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      color === 'accent' ? 'bg-accent/10' : color === 'danger' ? 'bg-danger-surface' : 'bg-surface-container'
                    }`}>
                      <span className={`material-symbols-outlined text-[18px] ${
                        color === 'accent' ? 'text-accent' : color === 'danger' ? 'text-danger' : 'text-primary'
                      }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">{trx.description || trx.type}</h3>
                      <p className="text-xs text-text-secondary">{new Date(trx.timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})} • {trx.source === 'voice' ? 'Web Voice' : trx.source === 'voice_call' ? 'Phone' : 'Typed'}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-base font-semibold ${
                      color === 'accent' ? 'text-accent' : color === 'danger' ? 'text-danger' : 'text-text-primary'
                    }`}>₦{trx.amount.toLocaleString()}</p>
                    <span className={`px-2 py-[2px] rounded text-[10px] font-bold uppercase ${
                      color === 'accent' ? 'bg-accent/10 text-accent' : color === 'danger' ? 'bg-danger-surface text-danger' : 'bg-surface-container text-text-secondary'
                    }`}>
                      {uiType}
                    </span>
                  </div>
                </div>
              </SwipeableItem>
            );
          }) : (
            <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-20 h-20 bg-surface-container flex items-center justify-center rounded-full">
                <span className="material-symbols-outlined text-outline-variant text-[40px]">history</span>
              </div>
              <p className="text-sm text-text-secondary">{t('emptyLedger')}</p>
            </div>
          )}
        </div>
      </main>

      {/* Manual Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
          <div 
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container/30">
              <h3 className="text-lg font-bold text-primary">Log Manual Transaction</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-outline-variant/20 transition-colors text-text-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddEntry} className="p-6 space-y-5">
              <div className="flex gap-2 bg-surface-container/30 p-1.5 rounded-xl border border-outline-variant/30">
                {['sale', 'expense', 'debt_given'].map((tType) => (
                  <button
                    key={tType}
                    type="button"
                    onClick={() => setNewTxType(tType)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      newTxType === tType 
                        ? (tType === 'sale' ? 'bg-accent text-white shadow' : tType === 'expense' ? 'bg-primary text-white shadow' : 'bg-danger text-white shadow')
                        : 'text-text-secondary hover:bg-outline-variant/20'
                    }`}
                  >
                    {tType.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Amount (₦)</label>
                <input 
                  type="number" 
                  required
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  className="w-full h-14 px-4 text-xl border border-outline-variant/50 rounded-xl focus:border-accent focus:ring-2 focus:ring-accent outline-none font-bold text-primary"
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description <span className="normal-case font-normal">(Optional)</span></label>
                <input 
                  type="text" 
                  value={newTxDesc}
                  onChange={(e) => setNewTxDesc(e.target.value)}
                  className="w-full h-12 px-4 border border-outline-variant/50 rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none font-medium"
                  placeholder="e.g., Sold 5 bags of rice"
                />
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70 shadow-md hover:shadow-lg ${
                    newTxType === 'sale' ? 'bg-accent' : newTxType === 'expense' ? 'bg-primary' : 'bg-danger'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  )}
                  {isSubmitting ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
