import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import GstCalculator from './components/GstCalculator';
import RestaurantBilling from './components/RestaurantBilling';
import PrintTemplates from './components/PrintTemplates';
import Toast from './components/Toast';
import {
  formatINR,
  inrToWords,
  calculateGeneralGST,
  calculateRestaurantBill
} from './utils/helpers';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');
  const [activeTab, setActiveTab] = useState('tab-gst-calc');

  // Tab 1: General GST Calculator State
  const [generalState, setGeneralState] = useState({
    baseAmount: 10000,
    quantity: 1,
    discountType: 'percent', // 'percent' | 'amount'
    discountValue: 10,
    gstRate: 18,
    isCustomGst: false,
    taxMode: 'exclusive', // 'exclusive' | 'inclusive'
    supplyType: 'intra' // 'intra' | 'inter'
  });

  // Tab 2: Restaurant Food Billing State
  const [restState, setRestState] = useState({
    receiptFormat: 'thermal80', // 'thermal80' | 'formalA4' | 'kot' | 'mini58'
    name: 'The Royal Dine Restaurant',
    phone: '+91 9876543210',
    address: '102, MG Road, Connaught Place, New Delhi - 110001',
    gstin: '27AABCU9603R1ZM',
    fssai: '10019011000123',
    orderType: 'Dine-In',
    tableNo: 'Table T-4',
    serverName: 'Rahul (Steward)',
    customer: 'Guest',
    paymentMode: 'UPI / QR (GPay/PhonePe)',
    billNo: 'INV-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    items: [
      { id: 1, name: 'Paneer Butter Masala', qty: 2, price: 280 },
      { id: 2, name: 'Butter Naan', qty: 4, price: 45 },
      { id: 3, name: 'Veg Dum Biryani', qty: 1, price: 240 },
      { id: 4, name: 'Fresh Lime Soda', qty: 2, price: 60 }
    ],
    discountType: 'percent',
    discountVal: 5,
    gstRate: 5,
    serviceChargeType: 'percent',
    serviceChargeVal: 5,
    packagingCharge: 0,
    tip: 0,
    footerNote: 'Thank You! Visit Again!'
  });

  // History & Toast states
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gst_calc_history') || '[]');
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState({ visible: false, message: '', isError: false });
  const [activePrintType, setActivePrintType] = useState(null); // 'general' | 'restaurant' | null

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Sync history to localStorage
  useEffect(() => {
    localStorage.setItem('gst_calc_history', JSON.stringify(history));
  }, [history]);

  // Toast Helper
  const showToast = useCallback((message, isError = false) => {
    setToast({ visible: true, message, isError });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // Calculations
  const generalCalc = useMemo(() => calculateGeneralGST(generalState), [generalState]);
  const restCalc = useMemo(() => calculateRestaurantBill(restState), [restState]);

  // Action: Toggle Theme
  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Action: Reset All
  const handleResetAll = () => {
    setGeneralState({
      baseAmount: 10000,
      quantity: 1,
      discountType: 'percent',
      discountValue: 10,
      gstRate: 18,
      isCustomGst: false,
      taxMode: 'exclusive',
      supplyType: 'intra'
    });

    setRestState(prev => ({
      ...prev,
      billNo: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      discountVal: 5,
      serviceChargeVal: 5,
      gstRate: 5,
      packagingCharge: 0,
      tip: 0
    }));

    showToast('Calculators reset to default values!');
  };

  // Action: Save General Calculation to History
  const handleSaveHistory = () => {
    const record = {
      id: Date.now(),
      date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      baseAmount: generalState.baseAmount,
      qty: generalCalc.qty,
      discount: generalCalc.discountLabel,
      discountVal: generalCalc.discountAmount,
      gstRate: generalCalc.gstRate,
      taxMode: generalState.taxMode,
      grandTotal: generalCalc.grandTotal
    };

    setHistory(prev => [record, ...prev.slice(0, 19)]);
    showToast('Calculation saved to history!');
  };

  // Action: Load from History
  const handleLoadHistory = (item) => {
    setGeneralState(prev => ({
      ...prev,
      baseAmount: item.baseAmount,
      quantity: item.qty || 1,
      gstRate: item.gstRate,
      taxMode: item.taxMode || 'exclusive',
      isCustomGst: ![0, 5, 12, 18, 28].includes(item.gstRate)
    }));
    showToast('Loaded calculation from history!');
  };

  // Action: Clear History
  const handleClearHistory = () => {
    setHistory([]);
    showToast('History cleared.');
  };

  // Action: Copy General Bill Summary (WhatsApp / Email formatted)
  const handleCopyGeneralSummary = () => {
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const taxDetails = generalState.supplyType === 'intra'
      ? `• CGST (${generalCalc.gstRate / 2}%): ${formatINR(generalCalc.totalGstAmount / 2)}\n• SGST (${generalCalc.gstRate / 2}%): ${formatINR(generalCalc.totalGstAmount / 2)}`
      : `• IGST (${generalCalc.gstRate}%): ${formatINR(generalCalc.totalGstAmount)}`;

    const text = `🧾 *ESTIMATED TAX INVOICE SUMMARY*
Date: ${dateStr}
----------------------------------------
Base Amount: ${formatINR(generalState.baseAmount)} × ${generalCalc.qty} qty
Gross Subtotal: ${formatINR(generalCalc.grossSubtotal)}
Discount (${generalCalc.discountLabel}): - ${formatINR(generalCalc.discountAmount)}
----------------------------------------
Net Taxable Value: ${formatINR(generalCalc.taxableValue)}
GST Rate: ${generalCalc.gstRate}% (${generalState.taxMode.toUpperCase()})
${taxDetails}
Total GST Tax: + ${formatINR(generalCalc.totalGstAmount)}
----------------------------------------
*FINAL GRAND TOTAL: ${formatINR(generalCalc.grandTotal)}*
(${inrToWords(Math.round(generalCalc.grandTotal))})
----------------------------------------
Generated via Smart Indian GST Calculator`;

    navigator.clipboard.writeText(text)
      .then(() => showToast('Bill summary copied for WhatsApp / Email!'))
      .catch(() => showToast('Failed to copy to clipboard', true));
  };

  // Action: Copy Restaurant WhatsApp Bill
  const handleCopyRestaurantWhatsApp = () => {
    let displayDate = restState.date;
    if (restState.date && restState.date.includes('-')) {
      const [y, m, d] = restState.date.split('-');
      if (y && m && d) displayDate = `${d}/${m}/${y}`;
    }

    const itemLines = restState.items
      .map(i => `• ${i.name || 'Item'} (x${i.qty}) = ₹${(i.qty * i.price).toFixed(2)}`)
      .join('\n');
    const phoneLine = restState.phone ? `Ph: ${restState.phone}\n` : '';
    const fssaiLine = restState.fssai ? `FSSAI Lic: ${restState.fssai}\n` : '';
    const billNum = restState.billNo.startsWith('#') ? restState.billNo : `#${restState.billNo}`;

    let extraLines = '';
    if (restCalc.packagingAmount > 0) {
      extraLines += `Packaging / Parcel: + ${formatINR(restCalc.packagingAmount)}\n`;
    }
    if (restCalc.tipAmount > 0) {
      extraLines += `Tip / Gratuity: + ${formatINR(restCalc.tipAmount)}\n`;
    }

    const text = `🍽️ *${restState.name.toUpperCase()}*
${restState.address}
${phoneLine}GSTIN: ${restState.gstin}
${fssaiLine}----------------------------------------
🧾 *TAX INVOICE / BILL*
Bill No: ${billNum} | ${restState.orderType} | ${restState.tableNo}
Date: ${displayDate} ${restState.time || ''}
Server: ${restState.serverName} | Customer: ${restState.customer}
Pay Mode: ${restState.paymentMode}
----------------------------------------
*ORDER ITEMS:*
${itemLines}
----------------------------------------
Food Subtotal: ${formatINR(restCalc.foodSubtotal)}
Discount (${restCalc.discountLabel}): - ${formatINR(restCalc.discountAmount)}
Service Charge (${restCalc.serviceChargeLabel}): + ${formatINR(restCalc.serviceChargeAmount)}
${extraLines}----------------------------------------
Net Taxable: ${formatINR(restCalc.taxableValue)}
CGST (${restCalc.halfGstRate}%): + ${formatINR(restCalc.cgstAmount)}
SGST (${restCalc.halfGstRate}%): + ${formatINR(restCalc.sgstAmount)}
----------------------------------------
*GRAND TOTAL: ${formatINR(restCalc.grandTotal)}*
(${inrToWords(restCalc.grandTotal)})
----------------------------------------
${restState.footerNote || 'Thank You! Visit Again!'}`;

    navigator.clipboard.writeText(text)
      .then(() => showToast('Restaurant bill copied for WhatsApp!'))
      .catch(() => showToast('Failed to copy to clipboard', true));
  };

  // Action: Print General
  const handlePrintGeneral = () => {
    setActivePrintType('general');
    document.body.classList.remove('printing-restaurant');
    document.body.classList.add('printing-general');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-general');
        setActivePrintType(null);
      }, 1000);
    }, 100);
  };

  // Action: Print Restaurant
  const handlePrintRestaurant = () => {
    setActivePrintType('restaurant');
    document.body.classList.remove('printing-general');
    document.body.classList.add('printing-restaurant');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-restaurant');
        setActivePrintType(null);
      }, 1000);
    }, 100);
  };

  return (
    <div className="react-app-wrapper">
      {/* Background decorations */}
      <div className="background-decorations">
        <div className="glow-sphere sphere-1"></div>
        <div className="glow-sphere sphere-2"></div>
        <div className="glow-sphere sphere-3"></div>
      </div>

      <div className="app-container">
        {/* Header */}
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onResetAll={handleResetAll}
        />

        {/* Navigation Tabs */}
        <nav className="main-tabs-nav">
          <button
            type="button"
            className={`main-tab-btn ${activeTab === 'tab-gst-calc' ? 'active' : ''}`}
            onClick={() => setActiveTab('tab-gst-calc')}
          >
            <i className="fa-solid fa-calculator"></i>
            <span>General GST & Discount</span>
          </button>
          <button
            type="button"
            className={`main-tab-btn ${activeTab === 'tab-restaurant-bill' ? 'active' : ''}`}
            onClick={() => setActiveTab('tab-restaurant-bill')}
          >
            <i className="fa-solid fa-utensils"></i>
            <span>Restaurant Food Bill & Invoice</span>
            <span className="tab-badge">New</span>
          </button>
        </nav>

        {/* Active Tab View */}
        {activeTab === 'tab-gst-calc' ? (
          <GstCalculator
            generalState={generalState}
            setGeneralState={setGeneralState}
            calculation={generalCalc}
            history={history}
            onSaveHistory={handleSaveHistory}
            onLoadHistory={handleLoadHistory}
            onClearHistory={handleClearHistory}
            onCopySummary={handleCopyGeneralSummary}
            onPrint={handlePrintGeneral}
          />
        ) : (
          <RestaurantBilling
            restState={restState}
            setRestState={setRestState}
            calculation={restCalc}
            onPrint={handlePrintRestaurant}
            onCopyWhatsApp={handleCopyRestaurantWhatsApp}
            showToast={showToast}
          />
        )}

        {/* Footer */}
        <footer className="app-footer">
          <p>
            GST & Discount Calculator & Restaurant Food Invoicing for Indian Businesses • Formatted in Indian Rupee (₹ INR) • React Edition
          </p>
        </footer>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        isError={toast.isError}
        visible={toast.visible}
      />

      {/* Hidden Print Templates */}
      <PrintTemplates
        activePrintType={activePrintType}
        generalState={generalState}
        generalCalc={generalCalc}
        restState={restState}
        restCalc={restCalc}
      />
    </div>
  );
}
