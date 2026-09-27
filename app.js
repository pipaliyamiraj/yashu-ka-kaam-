/**
 * Indian GST, Discount & Restaurant Billing Generator
 * Unified application logic for both General GST Calculator and Restaurant POS Bill Generator.
 */

// =========================================================================
// APPLICATION STATE
// =========================================================================
const appState = {
  activeTab: 'tab-gst-calc',

  // Tab 1: General Calculator State
  general: {
    baseAmount: 10000,
    quantity: 1,
    discountType: 'percent', // 'percent' | 'amount'
    discountValue: 10,
    gstRate: 18,
    isCustomGst: false,
    taxMode: 'exclusive', // 'exclusive' | 'inclusive'
    supplyType: 'intra', // 'intra' | 'inter'
  },

  // Tab 2: Restaurant Bill State
  restaurant: {
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
    discountType: 'percent', // 'percent' | 'amount'
    discountVal: 5,
    gstRate: 5, // 5% Standard Restaurant GST
    serviceChargeType: 'percent', // 'percent' | 'amount'
    serviceChargeVal: 5, // 5% Service charge
    packagingCharge: 0,
    tip: 0,
    footerNote: 'Thank You! Visit Again!'
  },

  theme: localStorage.getItem('app_theme') || 'dark',
  history: JSON.parse(localStorage.getItem('gst_calc_history') || '[]')
};

// =========================================================================
// DOM ELEMENTS REFERENCE
// =========================================================================

// Tabs
const tabBtns = document.querySelectorAll('.main-tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// General Calculator DOM
const baseAmountInput = document.getElementById('baseAmount');
const quantityInput = document.getElementById('quantity');
const qtyMinusBtn = document.getElementById('qtyMinus');
const qtyPlusBtn = document.getElementById('qtyPlus');
const discountSegmentBtns = document.querySelectorAll('[data-discount-type]');
const discountValueInput = document.getElementById('discountValue');
const discountSymbol = document.getElementById('discountSymbol');
const discountPercentChips = document.getElementById('discountPercentChips');
const discountAmountChips = document.getElementById('discountAmountChips');
const taxModeBtns = document.querySelectorAll('[data-tax-mode]');
const gstSlabBtns = document.querySelectorAll('[data-gst]');
const customGstInput = document.getElementById('customGstInput');
const currentGstBadge = document.getElementById('currentGstBadge');
const supplyTypeRadios = document.querySelectorAll('input[name="gstSupplyType"]');

// General Summary Displays
const displayGrandTotal = document.getElementById('displayGrandTotal');
const displayAmountWords = document.getElementById('displayAmountWords');
const displayGrossSubtotal = document.getElementById('displayGrossSubtotal');
const displayDiscountAmount = document.getElementById('displayDiscountAmount');
const summaryDiscountLabel = document.getElementById('summaryDiscountLabel');
const summaryQty = document.getElementById('summaryQty');
const displayTaxableValue = document.getElementById('displayTaxableValue');
const taxBreakdownRows = document.getElementById('taxBreakdownRows');
const displayTotalGst = document.getElementById('displayTotalGst');
const displayTableGrandTotal = document.getElementById('displayTableGrandTotal');

// General Visual Distribution
const barBasePercent = document.getElementById('barBasePercent');
const barGstPercent = document.getElementById('barGstPercent');
const barDiscountPercent = document.getElementById('barDiscountPercent');
const barBaseSegment = document.getElementById('barBaseSegment');
const barGstSegment = document.getElementById('barGstSegment');

// General Actions
const copySummaryBtn = document.getElementById('copySummaryBtn');
const saveHistoryBtn = document.getElementById('saveHistoryBtn');
const printReceiptBtn = document.getElementById('printReceiptBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const toastMessage = document.getElementById('toastMessage');
const toastText = document.getElementById('toastText');
const historyList = document.getElementById('historyList');
const historyCount = document.getElementById('historyCount');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const printDate = document.getElementById('printDate');
const printTableContent = document.getElementById('printTableContent');

// Restaurant DOM
const restNameInput = document.getElementById('restName');
const restPhoneInput = document.getElementById('restPhone');
const restGstInput = document.getElementById('restGst');
const restFssaiInput = document.getElementById('restFssai');
const restAddressInput = document.getElementById('restAddress');
const restOrderTypeInput = document.getElementById('restOrderType');
const restTableNoInput = document.getElementById('restTableNo');
const restServerNameInput = document.getElementById('restServerName');
const restCustomerInput = document.getElementById('restCustomer');
const restBillNoInput = document.getElementById('restBillNo');
const restPaymentModeInput = document.getElementById('restPaymentMode');
const restDateInput = document.getElementById('restDate');
const restTimeInput = document.getElementById('restTime');
const foodTableBody = document.getElementById('foodTableBody');
const addFoodRowBtn = document.getElementById('addFoodRowBtn');
const clearFoodItemsBtn = document.getElementById('clearFoodItemsBtn');

const restDiscountTypeBtns = document.querySelectorAll('[data-rest-discount-type]');
const restDiscountValInput = document.getElementById('restDiscountVal');
const restDiscountSymbol = document.getElementById('restDiscountSymbol');

const restGstBtns = document.querySelectorAll('.rest-gst-btn');
const restGstBadge = document.getElementById('restGstBadge');

const restStTypeBtns = document.querySelectorAll('[data-rest-st-type]');
const restServiceChargeValInput = document.getElementById('restServiceChargeVal');
const restStSymbol = document.getElementById('restStSymbol');
const stZeroBtn = document.getElementById('stZeroBtn');
const stFiveBtn = document.getElementById('stFiveBtn');
const stTenBtn = document.getElementById('stTenBtn');

const restPackagingValInput = document.getElementById('restPackagingVal');
const restTipValInput = document.getElementById('restTipVal');
const restFooterNoteInput = document.getElementById('restFooterNote');

// Restaurant Receipt DOM
const receiptRestName = document.getElementById('receiptRestName');
const receiptRestAddress = document.getElementById('receiptRestAddress');
const receiptRestPhone = document.getElementById('receiptRestPhone');
const receiptRestGst = document.getElementById('receiptRestGst');
const receiptRestFssai = document.getElementById('receiptRestFssai');
const receiptDate = document.getElementById('receiptDate');
const receiptTime = document.getElementById('receiptTime');
const receiptBillNo = document.getElementById('receiptBillNo');
const receiptOrderType = document.getElementById('receiptOrderType');
const receiptTable = document.getElementById('receiptTable');
const receiptServer = document.getElementById('receiptServer');
const receiptCustomer = document.getElementById('receiptCustomer');
const receiptPayMode = document.getElementById('receiptPayMode');

const receiptItemsContainer = document.getElementById('receiptItemsContainer');
const receiptItemCount = document.getElementById('receiptItemCount');
const receiptSubtotal = document.getElementById('receiptSubtotal');
const receiptDiscountLabel = document.getElementById('receiptDiscountLabel');
const receiptDiscountAmt = document.getElementById('receiptDiscountAmt');
const receiptServiceChargeLabel = document.getElementById('receiptServiceChargeLabel');
const receiptServiceChargeAmt = document.getElementById('receiptServiceChargeAmt');
const receiptPackagingRow = document.getElementById('receiptPackagingRow');
const receiptPackagingAmt = document.getElementById('receiptPackagingAmt');
const receiptTaxableAmt = document.getElementById('receiptTaxableAmt');
const receiptCgstRate = document.getElementById('receiptCgstRate');
const receiptCgstAmt = document.getElementById('receiptCgstAmt');
const receiptSgstRate = document.getElementById('receiptSgstRate');
const receiptSgstAmt = document.getElementById('receiptSgstAmt');
const receiptTipRow = document.getElementById('receiptTipRow');
const receiptTipAmt = document.getElementById('receiptTipAmt');
const receiptGrandTotal = document.getElementById('receiptGrandTotal');
const receiptAmountWords = document.getElementById('receiptAmountWords');
const receiptFooterCustomText = document.getElementById('receiptFooterCustomText');

const printFoodBillBtn = document.getElementById('printFoodBillBtn');
const copyFoodBillBtn = document.getElementById('copyFoodBillBtn');
const restPrintContent = document.getElementById('restPrintContent');
const formatBtns = document.querySelectorAll('[data-receipt-format]');
const currentPrintFormatLabel = document.getElementById('currentPrintFormatLabel');

// =========================================================================
// INITIALIZATION
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(appState.theme);
  setupTabs();
  setupGeneralCalculator();
  setupRestaurantCalculator();
  renderHistory();

  calculateGeneral();
  renderFoodItemsTable();
  calculateRestaurant();
});

// =========================================================================
// TAB SWITCHING
// =========================================================================
function setupTabs() {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      appState.activeTab = targetTab;
    });
  });
}

// =========================================================================
// TAB 1: GENERAL GST & DISCOUNT LOGIC
// =========================================================================
function setupGeneralCalculator() {
  baseAmountInput.addEventListener('input', (e) => {
    appState.general.baseAmount = Math.max(0, parseFloat(e.target.value) || 0);
    calculateGeneral();
  });

  document.querySelectorAll('.chip-btn[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const addVal = parseFloat(btn.getAttribute('data-add'));
      appState.general.baseAmount = (appState.general.baseAmount || 0) + addVal;
      baseAmountInput.value = appState.general.baseAmount;
      calculateGeneral();
    });
  });

  quantityInput.addEventListener('input', (e) => {
    appState.general.quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
    calculateGeneral();
  });

  qtyMinusBtn.addEventListener('click', () => {
    if (appState.general.quantity > 1) {
      appState.general.quantity--;
      quantityInput.value = appState.general.quantity;
      calculateGeneral();
    }
  });

  qtyPlusBtn.addEventListener('click', () => {
    appState.general.quantity++;
    quantityInput.value = appState.general.quantity;
    calculateGeneral();
  });

  taxModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      taxModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.general.taxMode = btn.getAttribute('data-tax-mode');
      calculateGeneral();
    });
  });

  discountSegmentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      discountSegmentBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.general.discountType = btn.getAttribute('data-discount-type');

      if (appState.general.discountType === 'percent') {
        discountSymbol.textContent = '%';
        discountPercentChips.classList.remove('hidden');
        discountAmountChips.classList.add('hidden');
        if (appState.general.discountValue > 100) appState.general.discountValue = 10;
        discountValueInput.placeholder = 'e.g. 10%';
      } else {
        discountSymbol.textContent = '₹';
        discountPercentChips.classList.add('hidden');
        discountAmountChips.classList.remove('hidden');
        discountValueInput.placeholder = 'e.g. 500';
      }
      discountValueInput.value = appState.general.discountValue;
      updateGeneralDiscountChipsActive();
      calculateGeneral();
    });
  });

  discountValueInput.addEventListener('input', (e) => {
    appState.general.discountValue = Math.max(0, parseFloat(e.target.value) || 0);
    updateGeneralDiscountChipsActive();
    calculateGeneral();
  });

  document.querySelectorAll('.discount-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = parseFloat(chip.getAttribute('data-val'));
      appState.general.discountValue = val;
      discountValueInput.value = val;
      updateGeneralDiscountChipsActive();
      calculateGeneral();
    });
  });

  document.querySelectorAll('.discount-flat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = parseFloat(chip.getAttribute('data-val'));
      appState.general.discountValue = val;
      discountValueInput.value = val;
      updateGeneralDiscountChipsActive();
      calculateGeneral();
    });
  });

  gstSlabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gstSlabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.general.gstRate = parseFloat(btn.getAttribute('data-gst'));
      appState.general.isCustomGst = false;
      customGstInput.value = '';
      calculateGeneral();
    });
  });

  customGstInput.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0) {
      gstSlabBtns.forEach(b => b.classList.remove('active'));
      appState.general.gstRate = val;
      appState.general.isCustomGst = true;
      calculateGeneral();
    }
  });

  supplyTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      appState.general.supplyType = e.target.value;
      calculateGeneral();
    });
  });

  copySummaryBtn.addEventListener('click', copyGeneralSummaryToClipboard);
  saveHistoryBtn.addEventListener('click', saveCurrentToHistory);
  printReceiptBtn.addEventListener('click', prepareAndPrintGeneral);
  resetAllBtn.addEventListener('click', resetAllCalculators);
  clearHistoryBtn.addEventListener('click', clearAllHistory);
  themeToggleBtn.addEventListener('click', toggleTheme);
}

function updateGeneralDiscountChipsActive() {
  if (appState.general.discountType === 'percent') {
    document.querySelectorAll('.discount-chip').forEach(chip => {
      chip.classList.toggle('active', parseFloat(chip.getAttribute('data-val')) === appState.general.discountValue);
    });
  } else {
    document.querySelectorAll('.discount-flat-chip').forEach(chip => {
      chip.classList.toggle('active', parseFloat(chip.getAttribute('data-val')) === appState.general.discountValue);
    });
  }
}

function calculateGeneral() {
  const base = appState.general.baseAmount || 0;
  const qty = appState.general.quantity || 1;
  const grossSubtotal = base * qty;

  let discountAmount = 0;
  let discountLabel = '';

  if (appState.general.discountType === 'percent') {
    const pct = Math.min(100, Math.max(0, appState.general.discountValue || 0));
    discountAmount = (grossSubtotal * pct) / 100;
    discountLabel = `${pct}%`;
  } else {
    discountAmount = Math.min(grossSubtotal, Math.max(0, appState.general.discountValue || 0));
    discountLabel = formatINR(discountAmount);
  }

  const netAfterDiscount = Math.max(0, grossSubtotal - discountAmount);

  let taxableValue = 0;
  let totalGstAmount = 0;
  let grandTotal = 0;
  const gstRate = appState.general.gstRate || 0;

  if (appState.general.taxMode === 'exclusive') {
    taxableValue = netAfterDiscount;
    totalGstAmount = (taxableValue * gstRate) / 100;
    grandTotal = taxableValue + totalGstAmount;
  } else {
    if (gstRate > 0) {
      taxableValue = netAfterDiscount / (1 + gstRate / 100);
      totalGstAmount = netAfterDiscount - taxableValue;
    } else {
      taxableValue = netAfterDiscount;
      totalGstAmount = 0;
    }
    grandTotal = netAfterDiscount;
  }

  if (appState.general.isCustomGst) {
    currentGstBadge.textContent = `${gstRate}% Custom GST`;
  } else {
    currentGstBadge.textContent = `${gstRate}% ${getGstDescription(gstRate)}`;
  }

  renderGeneralSummary({
    grossSubtotal,
    discountAmount,
    discountLabel,
    taxableValue,
    totalGstAmount,
    grandTotal,
    gstRate,
    qty
  });

  return { grossSubtotal, discountAmount, discountLabel, taxableValue, totalGstAmount, grandTotal, gstRate, qty };
}

function getGstDescription(rate) {
  switch (rate) {
    case 0: return 'Nil / Exempt';
    case 5: return 'Essential';
    case 12: return 'Standard Low';
    case 18: return 'Standard';
    case 28: return 'Luxury';
    default: return 'GST';
  }
}

function renderGeneralSummary(data) {
  displayGrandTotal.textContent = formatINR(data.grandTotal);
  displayAmountWords.textContent = inrToWords(Math.round(data.grandTotal));

  summaryQty.textContent = data.qty;
  displayGrossSubtotal.textContent = formatINR(data.grossSubtotal);
  summaryDiscountLabel.textContent = data.discountLabel;
  displayDiscountAmount.textContent = `- ${formatINR(data.discountAmount)}`;
  displayTaxableValue.textContent = formatINR(data.taxableValue);
  displayTotalGst.textContent = `+ ${formatINR(data.totalGstAmount)}`;
  displayTableGrandTotal.textContent = formatINR(data.grandTotal);

  renderGeneralTaxSplit(data.taxableValue, data.totalGstAmount, data.gstRate);
  renderGeneralDistribution(data.taxableValue, data.totalGstAmount, data.discountAmount, data.grossSubtotal);
}

function renderGeneralTaxSplit(taxableValue, totalGst, rate) {
  if (rate === 0 || totalGst === 0) {
    taxBreakdownRows.innerHTML = `
      <div class="breakdown-row tax-row">
        <span class="row-label">GST (0% Exempt)</span>
        <span class="row-value">₹0.00</span>
      </div>
    `;
    return;
  }

  if (appState.general.supplyType === 'intra') {
    const halfRate = rate / 2;
    const halfTax = totalGst / 2;
    taxBreakdownRows.innerHTML = `
      <div class="breakdown-row tax-row">
        <span class="row-label">↳ CGST (${halfRate}%)</span>
        <span class="row-value">${formatINR(halfTax)}</span>
      </div>
      <div class="breakdown-row tax-row">
        <span class="row-label">↳ SGST / UTGST (${halfRate}%)</span>
        <span class="row-value">${formatINR(halfTax)}</span>
      </div>
    `;
  } else {
    taxBreakdownRows.innerHTML = `
      <div class="breakdown-row tax-row">
        <span class="row-label">↳ IGST Integrated (${rate}%)</span>
        <span class="row-value">${formatINR(totalGst)}</span>
      </div>
    `;
  }
}

function renderGeneralDistribution(taxable, gst, discount, gross) {
  const effectiveTotal = taxable + gst;
  if (effectiveTotal <= 0) {
    barBaseSegment.style.width = '0%';
    barGstSegment.style.width = '0%';
    barBasePercent.textContent = '0%';
    barGstPercent.textContent = '0%';
    barDiscountPercent.textContent = '0%';
    return;
  }

  const basePct = Math.round((taxable / effectiveTotal) * 100) || 0;
  const gstPct = 100 - basePct;
  const savingPct = gross > 0 ? Math.round((discount / gross) * 100) : 0;

  barBaseSegment.style.width = `${basePct}%`;
  barGstSegment.style.width = `${gstPct}%`;

  barBasePercent.textContent = `${basePct}%`;
  barGstPercent.textContent = `${gstPct}%`;
  barDiscountPercent.textContent = `${savingPct}%`;
}

function copyGeneralSummaryToClipboard() {
  const data = calculateGeneral();
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const taxDetails = appState.general.supplyType === 'intra' 
    ? `• CGST (${data.gstRate/2}%): ${formatINR(data.totalGstAmount/2)}\n• SGST (${data.gstRate/2}%): ${formatINR(data.totalGstAmount/2)}`
    : `• IGST (${data.gstRate}%): ${formatINR(data.totalGstAmount)}`;

  const text = `🧾 *ESTIMATED TAX INVOICE SUMMARY*
Date: ${dateStr}
----------------------------------------
Base Amount: ${formatINR(appState.general.baseAmount)} × ${data.qty} qty
Gross Subtotal: ${formatINR(data.grossSubtotal)}
Discount (${data.discountLabel}): - ${formatINR(data.discountAmount)}
----------------------------------------
Net Taxable Value: ${formatINR(data.taxableValue)}
GST Rate: ${data.gstRate}% (${appState.general.taxMode.toUpperCase()})
${taxDetails}
Total GST Tax: + ${formatINR(data.totalGstAmount)}
----------------------------------------
*FINAL GRAND TOTAL: ${formatINR(data.grandTotal)}*
(${inrToWords(Math.round(data.grandTotal))})
----------------------------------------
Generated via Smart Indian GST Calculator`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('Bill summary copied for WhatsApp / Email!');
  }).catch(() => {
    showToast('Failed to copy to clipboard', true);
  });
}

function prepareAndPrintGeneral() {
  const data = calculateGeneral();
  printDate.textContent = `Date: ${new Date().toLocaleDateString('en-IN')}`;

  const taxDetails = appState.general.supplyType === 'intra'
    ? `
      <tr><td>CGST (${data.gstRate/2}%)</td><td>${formatINR(data.totalGstAmount/2)}</td></tr>
      <tr><td>SGST (${data.gstRate/2}%)</td><td>${formatINR(data.totalGstAmount/2)}</td></tr>
    `
    : `
      <tr><td>IGST (${data.gstRate}%)</td><td>${formatINR(data.totalGstAmount)}</td></tr>
    `;

  printTableContent.innerHTML = `
    <table class="print-table">
      <thead>
        <tr><th>Description</th><th>Amount</th></tr>
      </thead>
      <tbody>
        <tr><td>Base Unit Price (${data.qty} Unit/s)</td><td>${formatINR(appState.general.baseAmount * data.qty)}</td></tr>
        <tr><td>Discount Applied (${data.discountLabel})</td><td>- ${formatINR(data.discountAmount)}</td></tr>
        <tr><td><strong>Net Taxable Value</strong></td><td><strong>${formatINR(data.taxableValue)}</strong></td></tr>
        ${taxDetails}
        <tr><td>Total GST Tax</td><td>+ ${formatINR(data.totalGstAmount)}</td></tr>
        <tr class="print-grand-row"><td>FINAL GRAND TOTAL</td><td>${formatINR(data.grandTotal)}</td></tr>
        <tr><td colspan="2" style="font-size: 11px; color: #000000; text-align: center;">In Words: <em>${inrToWords(Math.round(data.grandTotal))}</em></td></tr>
      </tbody>
    </table>
  `;

  document.body.classList.remove('printing-restaurant');
  document.body.classList.add('printing-general');
  window.print();
  setTimeout(() => document.body.classList.remove('printing-general'), 1500);
}

// =========================================================================
// TAB 2: RESTAURANT FOOD BILLING & INVOICING LOGIC
// =========================================================================
function setupRestaurantCalculator() {
  // Initialize input field values
  if (restBillNoInput) restBillNoInput.value = appState.restaurant.billNo;
  if (restDateInput) restDateInput.value = appState.restaurant.date;
  if (restTimeInput) restTimeInput.value = appState.restaurant.time;
  if (restFssaiInput) restFssaiInput.value = appState.restaurant.fssai;
  if (restOrderTypeInput) restOrderTypeInput.value = appState.restaurant.orderType;
  if (restServerNameInput) restServerNameInput.value = appState.restaurant.serverName;
  if (restPaymentModeInput) restPaymentModeInput.value = appState.restaurant.paymentMode;
  if (restPackagingValInput) restPackagingValInput.value = appState.restaurant.packagingCharge;
  if (restTipValInput) restTipValInput.value = appState.restaurant.tip;
  if (restFooterNoteInput) restFooterNoteInput.value = appState.restaurant.footerNote;

  // Restaurant Info Inputs
  restNameInput.addEventListener('input', (e) => {
    appState.restaurant.name = e.target.value;
    calculateRestaurant();
  });
  restPhoneInput.addEventListener('input', (e) => {
    appState.restaurant.phone = e.target.value;
    calculateRestaurant();
  });
  restGstInput.addEventListener('input', (e) => {
    appState.restaurant.gstin = e.target.value.toUpperCase();
    calculateRestaurant();
  });
  restFssaiInput.addEventListener('input', (e) => {
    appState.restaurant.fssai = e.target.value;
    calculateRestaurant();
  });
  restAddressInput.addEventListener('input', (e) => {
    appState.restaurant.address = e.target.value;
    calculateRestaurant();
  });
  restOrderTypeInput.addEventListener('change', (e) => {
    appState.restaurant.orderType = e.target.value;
    calculateRestaurant();
  });
  restTableNoInput.addEventListener('input', (e) => {
    appState.restaurant.tableNo = e.target.value;
    calculateRestaurant();
  });
  restServerNameInput.addEventListener('input', (e) => {
    appState.restaurant.serverName = e.target.value;
    calculateRestaurant();
  });
  restCustomerInput.addEventListener('input', (e) => {
    appState.restaurant.customer = e.target.value;
    calculateRestaurant();
  });
  restBillNoInput.addEventListener('input', (e) => {
    appState.restaurant.billNo = e.target.value;
    calculateRestaurant();
  });
  restPaymentModeInput.addEventListener('change', (e) => {
    appState.restaurant.paymentMode = e.target.value;
    calculateRestaurant();
  });
  restDateInput.addEventListener('input', (e) => {
    appState.restaurant.date = e.target.value;
    calculateRestaurant();
  });
  restTimeInput.addEventListener('input', (e) => {
    appState.restaurant.time = e.target.value;
    calculateRestaurant();
  });
  restPackagingValInput.addEventListener('input', (e) => {
    appState.restaurant.packagingCharge = Math.max(0, parseFloat(e.target.value) || 0);
    calculateRestaurant();
  });
  restTipValInput.addEventListener('input', (e) => {
    appState.restaurant.tip = Math.max(0, parseFloat(e.target.value) || 0);
    calculateRestaurant();
  });
  restFooterNoteInput.addEventListener('input', (e) => {
    appState.restaurant.footerNote = e.target.value;
    calculateRestaurant();
  });

  // Clear food items button
  if (clearFoodItemsBtn) {
    clearFoodItemsBtn.addEventListener('click', () => {
      appState.restaurant.items = [{ id: Date.now(), name: '', qty: 1, price: 0 }];
      renderFoodItemsTable();
      calculateRestaurant();
      showToast('Food items cleared!');
    });
  }

  // Add Item Button
  addFoodRowBtn.addEventListener('click', () => {
    const newId = Date.now();
    appState.restaurant.items.push({
      id: newId,
      name: 'New Food Item',
      qty: 1,
      price: 150
    });
    renderFoodItemsTable();
    calculateRestaurant();
  });

  // Quick Preset Chips
  document.querySelectorAll('.food-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const name = chip.getAttribute('data-name');
      const price = parseFloat(chip.getAttribute('data-price'));
      appState.restaurant.items.push({
        id: Date.now() + Math.random(),
        name: name,
        qty: 1,
        price: price
      });
      renderFoodItemsTable();
      calculateRestaurant();
    });
  });

  // Discount Type Toggle
  restDiscountTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      restDiscountTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.restaurant.discountType = btn.getAttribute('data-rest-discount-type');
      restDiscountSymbol.textContent = appState.restaurant.discountType === 'percent' ? '%' : '₹';
      calculateRestaurant();
    });
  });

  restDiscountValInput.addEventListener('input', (e) => {
    appState.restaurant.discountVal = Math.max(0, parseFloat(e.target.value) || 0);
    calculateRestaurant();
  });

  // Restaurant GST Rates
  restGstBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      restGstBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.restaurant.gstRate = parseFloat(btn.getAttribute('data-rate'));
      restGstBadge.textContent = `${appState.restaurant.gstRate}% (Restaurant)`;
      calculateRestaurant();
    });
  });

  // Service Tax / Service Charge
  restStTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      restStTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.restaurant.serviceChargeType = btn.getAttribute('data-rest-st-type');
      restStSymbol.textContent = appState.restaurant.serviceChargeType === 'percent' ? '%' : '₹';
      calculateRestaurant();
    });
  });

  restServiceChargeValInput.addEventListener('input', (e) => {
    appState.restaurant.serviceChargeVal = Math.max(0, parseFloat(e.target.value) || 0);
    calculateRestaurant();
  });

  stZeroBtn.addEventListener('click', () => {
    appState.restaurant.serviceChargeVal = 0;
    restServiceChargeValInput.value = 0;
    calculateRestaurant();
  });
  stFiveBtn.addEventListener('click', () => {
    appState.restaurant.serviceChargeVal = 5;
    restServiceChargeValInput.value = 5;
    calculateRestaurant();
  });
  stTenBtn.addEventListener('click', () => {
    appState.restaurant.serviceChargeVal = 10;
    restServiceChargeValInput.value = 10;
    calculateRestaurant();
  });

  // Receipt Format Selector
  if (formatBtns.length > 0) {
    formatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const format = btn.getAttribute('data-receipt-format');
        appState.restaurant.receiptFormat = format;

        const formatLabels = {
          'thermal80': 'Thermal 80mm',
          'formalA4': 'A4 Tax Invoice',
          'kot': 'Kitchen KOT',
          'mini58': 'Mini Slip 58mm'
        };

        if (currentPrintFormatLabel) {
          currentPrintFormatLabel.textContent = formatLabels[format] || 'Thermal 80mm';
        }

        showToast(`Print format switched to: ${formatLabels[format] || format}`);
      });
    });
  }

  printFoodBillBtn.addEventListener('click', printRestaurantReceipt);
  copyFoodBillBtn.addEventListener('click', copyRestaurantBillToClipboard);
}

// Render dynamic Food Items Table Rows
function renderFoodItemsTable() {
  foodTableBody.innerHTML = appState.restaurant.items.map((item, index) => `
    <tr data-item-id="${item.id}">
      <td>
        <input type="text" class="food-input-name" value="${escapeHtml(item.name)}" placeholder="Item name" onchange="updateFoodItem(${item.id}, 'name', this.value)">
      </td>
      <td>
        <input type="number" class="food-input-qty" value="${item.qty}" min="1" step="1" oninput="updateFoodItem(${item.id}, 'qty', this.value)">
      </td>
      <td>
        <input type="number" class="food-input-price" value="${item.price}" min="0" step="any" oninput="updateFoodItem(${item.id}, 'price', this.value)">
      </td>
      <td>
        <span class="food-row-total">${formatINR(item.qty * item.price)}</span>
      </td>
      <td>
        <button type="button" class="btn-remove-food" title="Remove Item" onclick="removeFoodItem(${item.id})">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

window.updateFoodItem = function(id, field, value) {
  const item = appState.restaurant.items.find(i => i.id === id);
  if (!item) return;

  if (field === 'name') item.name = value;
  if (field === 'qty') item.qty = Math.max(1, parseInt(value, 10) || 1);
  if (field === 'price') item.price = Math.max(0, parseFloat(value) || 0);

  const row = foodTableBody.querySelector(`tr[data-item-id="${id}"]`);
  if (row) {
    row.querySelector('.food-row-total').textContent = formatINR(item.qty * item.price);
  }

  calculateRestaurant();
};

window.removeFoodItem = function(id) {
  if (appState.restaurant.items.length <= 1) {
    showToast('At least one item is required in the food bill', true);
    return;
  }
  appState.restaurant.items = appState.restaurant.items.filter(i => i.id !== id);
  renderFoodItemsTable();
  calculateRestaurant();
};

// Calculate and render Restaurant POS Bill
function calculateRestaurant() {
  const rest = appState.restaurant;

  // 1. Calculate Food Subtotal
  let foodSubtotal = 0;
  let totalItemUnits = 0;

  rest.items.forEach(item => {
    foodSubtotal += (item.qty * item.price);
    totalItemUnits += item.qty;
  });

  // 2. Calculate Restaurant Discount
  let discountAmount = 0;
  let discountLabel = '';

  if (rest.discountType === 'percent') {
    const pct = Math.min(100, Math.max(0, rest.discountVal || 0));
    discountAmount = (foodSubtotal * pct) / 100;
    discountLabel = `${pct}%`;
  } else {
    discountAmount = Math.min(foodSubtotal, Math.max(0, rest.discountVal || 0));
    discountLabel = formatINR(discountAmount);
  }

  const afterDiscount = Math.max(0, foodSubtotal - discountAmount);

  // 3. Service Charge (applied after discount)
  let serviceChargeAmount = 0;
  let serviceChargeLabel = '';

  if (rest.serviceChargeType === 'percent') {
    const scPct = Math.max(0, rest.serviceChargeVal || 0);
    serviceChargeAmount = (afterDiscount * scPct) / 100;
    serviceChargeLabel = `${scPct}%`;
  } else {
    serviceChargeAmount = Math.max(0, rest.serviceChargeVal || 0);
    serviceChargeLabel = formatINR(serviceChargeAmount);
  }

  // 4. Packaging / Delivery & Tip
  const packagingAmount = Math.max(0, rest.packagingCharge || 0);
  const tipAmount = Math.max(0, rest.tip || 0);

  // 5. Taxable Amount = (Food After Discount) + Service Charge + Packaging Charge
  const taxableValue = afterDiscount + serviceChargeAmount + packagingAmount;

  // 6. GST (CGST + SGST)
  const gstRate = rest.gstRate || 0;
  const halfGstRate = gstRate / 2;
  const totalGst = (taxableValue * gstRate) / 100;
  const cgstAmount = totalGst / 2;
  const sgstAmount = totalGst / 2;

  // 7. Grand Total (Payable) including Tip
  const grandTotal = Math.round(taxableValue + totalGst + tipAmount);

  // Render Receipt Preview
  renderRestaurantReceipt({
    foodSubtotal,
    totalItemUnits,
    discountAmount,
    discountLabel,
    serviceChargeAmount,
    serviceChargeLabel,
    packagingAmount,
    taxableValue,
    gstRate,
    halfGstRate,
    cgstAmount,
    sgstAmount,
    totalGst,
    tipAmount,
    grandTotal
  });

  return {
    foodSubtotal,
    totalItemUnits,
    discountAmount,
    discountLabel,
    serviceChargeAmount,
    serviceChargeLabel,
    packagingAmount,
    taxableValue,
    gstRate,
    halfGstRate,
    cgstAmount,
    sgstAmount,
    totalGst,
    tipAmount,
    grandTotal
  };
}

function renderRestaurantReceipt(data) {
  const rest = appState.restaurant;

  // Format Display Date
  let displayDate = rest.date;
  if (rest.date && rest.date.includes('-')) {
    const [y, m, d] = rest.date.split('-');
    if (y && m && d) displayDate = `${d}/${m}/${y}`;
  }

  // Format Display Time
  let displayTime = rest.time || '';
  if (displayTime && displayTime.includes(':')) {
    const [hrs, mins] = displayTime.split(':');
    const h = parseInt(hrs, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    displayTime = `${String(formattedH).padStart(2, '0')}:${mins} ${ampm}`;
  }

  // Header Details
  receiptRestName.textContent = rest.name || 'Restaurant';
  receiptRestAddress.textContent = rest.address || '';
  receiptRestPhone.textContent = rest.phone ? `Ph: ${rest.phone}` : '';
  receiptRestGst.textContent = rest.gstin || 'N/A';
  
  if (receiptRestFssai) {
    if (rest.fssai) {
      receiptRestFssai.style.display = 'block';
      receiptRestFssai.textContent = `FSSAI Lic No: ${rest.fssai}`;
    } else {
      receiptRestFssai.style.display = 'none';
    }
  }

  receiptDate.textContent = displayDate;
  receiptTime.textContent = displayTime;
  receiptBillNo.textContent = rest.billNo.startsWith('#') ? rest.billNo : `#${rest.billNo}`;
  if (receiptOrderType) receiptOrderType.textContent = rest.orderType;
  if (receiptTable) receiptTable.textContent = rest.tableNo;
  if (receiptServer) receiptServer.textContent = rest.serverName;
  if (receiptCustomer) receiptCustomer.textContent = rest.customer;
  if (receiptPayMode) receiptPayMode.textContent = rest.paymentMode;

  // Items List
  receiptItemsContainer.innerHTML = rest.items.map(item => `
    <div class="receipt-item-line">
      <span class="item-col-name">${escapeHtml(item.name || 'Item')}</span>
      <span class="item-col-qty">${item.qty}</span>
      <span class="item-col-rate">${item.price.toFixed(2)}</span>
      <span class="item-col-amt">${(item.qty * item.price).toFixed(2)}</span>
    </div>
  `).join('');

  // Calculations Summary
  receiptItemCount.textContent = data.totalItemUnits;
  receiptSubtotal.textContent = formatINR(data.foodSubtotal);

  receiptDiscountLabel.textContent = data.discountLabel;
  receiptDiscountAmt.textContent = `- ${formatINR(data.discountAmount)}`;

  receiptServiceChargeLabel.textContent = data.serviceChargeLabel;
  receiptServiceChargeAmt.textContent = `+ ${formatINR(data.serviceChargeAmount)}`;

  // Packaging Row
  if (receiptPackagingRow) {
    if (data.packagingAmount > 0) {
      receiptPackagingRow.style.display = 'flex';
      receiptPackagingAmt.textContent = `+ ${formatINR(data.packagingAmount)}`;
    } else {
      receiptPackagingRow.style.display = 'none';
    }
  }

  receiptTaxableAmt.textContent = formatINR(data.taxableValue);

  receiptCgstRate.textContent = `${data.halfGstRate}%`;
  receiptCgstAmt.textContent = `+ ${formatINR(data.cgstAmount)}`;

  receiptSgstRate.textContent = `${data.halfGstRate}%`;
  receiptSgstAmt.textContent = `+ ${formatINR(data.sgstAmount)}`;

  // Tip Row
  if (receiptTipRow) {
    if (data.tipAmount > 0) {
      receiptTipRow.style.display = 'flex';
      receiptTipAmt.textContent = `+ ${formatINR(data.tipAmount)}`;
    } else {
      receiptTipRow.style.display = 'none';
    }
  }

  receiptGrandTotal.textContent = formatINR(data.grandTotal);
  receiptAmountWords.textContent = inrToWords(data.grandTotal);

  if (receiptFooterCustomText) {
    receiptFooterCustomText.textContent = rest.footerNote || 'Thank You! Visit Again!';
  }
}

// Copy Restaurant Bill to Clipboard (WhatsApp formatted)
function copyRestaurantBillToClipboard() {
  const rest = appState.restaurant;
  const data = calculateRestaurant();

  let displayDate = rest.date;
  if (rest.date && rest.date.includes('-')) {
    const [y, m, d] = rest.date.split('-');
    if (y && m && d) displayDate = `${d}/${m}/${y}`;
  }

  let itemLines = rest.items.map(i => `• ${i.name || 'Item'} (x${i.qty}) = ₹${(i.qty * i.price).toFixed(2)}`).join('\n');
  const phoneLine = rest.phone ? `Ph: ${rest.phone}\n` : '';
  const fssaiLine = rest.fssai ? `FSSAI Lic: ${rest.fssai}\n` : '';
  const billNum = rest.billNo.startsWith('#') ? rest.billNo : `#${rest.billNo}`;

  let extraLines = '';
  if (data.packagingAmount > 0) {
    extraLines += `Packaging / Parcel: + ${formatINR(data.packagingAmount)}\n`;
  }
  if (data.tipAmount > 0) {
    extraLines += `Tip / Gratuity: + ${formatINR(data.tipAmount)}\n`;
  }

  const text = `🍽️ *${rest.name.toUpperCase()}*
${rest.address}
${phoneLine}GSTIN: ${rest.gstin}
${fssaiLine}----------------------------------------
🧾 *TAX INVOICE / BILL*
Bill No: ${billNum} | ${rest.orderType} | ${rest.tableNo}
Date: ${displayDate} ${rest.time || ''}
Server: ${rest.serverName} | Customer: ${rest.customer}
Pay Mode: ${rest.paymentMode}
----------------------------------------
*ORDER ITEMS:*
${itemLines}
----------------------------------------
Food Subtotal: ${formatINR(data.foodSubtotal)}
Discount (${data.discountLabel}): - ${formatINR(data.discountAmount)}
Service Charge (${data.serviceChargeLabel}): + ${formatINR(data.serviceChargeAmount)}
${extraLines}----------------------------------------
Net Taxable: ${formatINR(data.taxableValue)}
CGST (${data.halfGstRate}%): + ${formatINR(data.cgstAmount)}
SGST (${data.halfGstRate}%): + ${formatINR(data.sgstAmount)}
----------------------------------------
*GRAND TOTAL: ${formatINR(data.grandTotal)}*
(${inrToWords(data.grandTotal)})
----------------------------------------
${rest.footerNote || 'Thank You! Visit Again!'}`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('Restaurant bill copied for WhatsApp!');
  }).catch(() => {
    showToast('Failed to copy to clipboard', true);
  });
}

// Print Restaurant Receipt across multiple selectable formats
function printRestaurantReceipt() {
  const rest = appState.restaurant;
  const data = calculateRestaurant();
  const format = rest.receiptFormat || 'thermal80';

  let displayDate = rest.date;
  if (rest.date && rest.date.includes('-')) {
    const [y, m, d] = rest.date.split('-');
    if (y && m && d) displayDate = `${d}/${m}/${y}`;
  }

  let displayTime = rest.time || '';
  if (displayTime && displayTime.includes(':')) {
    const [hrs, mins] = displayTime.split(':');
    const h = parseInt(hrs, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    displayTime = `${String(formattedH).padStart(2, '0')}:${mins} ${ampm}`;
  }

  const phonePrintLine = rest.phone ? `<p style="margin: 2px 0; font-size: 11px;">Ph: ${escapeHtml(rest.phone)}</p>` : '';
  const fssaiPrintLine = rest.fssai ? `<p style="margin: 1px 0; font-size: 11px;">FSSAI Lic: ${escapeHtml(rest.fssai)}</p>` : '';
  const billNum = rest.billNo.startsWith('#') ? rest.billNo : `#${rest.billNo}`;

  let packagingPrintRow = '';
  if (data.packagingAmount > 0) {
    packagingPrintRow = `<div style="display: flex; justify-content: space-between;"><span>Packaging / Parcel:</span><span>+ ${formatINR(data.packagingAmount)}</span></div>`;
  }

  let tipPrintRow = '';
  if (data.tipAmount > 0) {
    tipPrintRow = `<div style="display: flex; justify-content: space-between;"><span>Tip / Gratuity:</span><span>+ ${formatINR(data.tipAmount)}</span></div>`;
  }

  let htmlContent = '';

  // -------------------------------------------------------------
  // FORMAT 1: THERMAL 80MM RECEIPT
  // -------------------------------------------------------------
  if (format === 'thermal80') {
    let itemRows = rest.items.map(i => `
      <tr>
        <td style="text-align: left; padding: 2px 0;">${escapeHtml(i.name || 'Item')}</td>
        <td style="text-align: center; padding: 2px 0;">${i.qty}</td>
        <td style="text-align: right; padding: 2px 0;">${i.price.toFixed(2)}</td>
        <td style="text-align: right; padding: 2px 0;">${(i.qty * i.price).toFixed(2)}</td>
      </tr>
    `).join('');

    htmlContent = `
      <div class="rest-print-thermal">
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: bold; text-transform: uppercase;">${escapeHtml(rest.name)}</h3>
          <p style="margin: 2px 0; font-size: 11px;">${escapeHtml(rest.address)}</p>
          ${phonePrintLine}
          <p style="margin: 2px 0; font-size: 11px; font-weight: bold;">GSTIN: ${escapeHtml(rest.gstin)}</p>
          ${fssaiPrintLine}
        </div>

        <div style="font-size: 11px; margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 6px;">
          <div style="display: flex; justify-content: space-between;"><span>Date: ${displayDate}</span><span>Time: ${escapeHtml(displayTime)}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>Bill No: ${escapeHtml(billNum)}</span><span>Type: ${escapeHtml(rest.orderType)}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>Table: ${escapeHtml(rest.tableNo)}</span><span>Server: ${escapeHtml(rest.serverName)}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>Customer: ${escapeHtml(rest.customer)}</span><span>Pay: ${escapeHtml(rest.paymentMode)}</span></div>
        </div>

        <table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-bottom: 8px;">
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left; padding: 3px 0;">ITEM</th>
              <th style="text-align: center; padding: 3px 0;">QTY</th>
              <th style="text-align: right; padding: 3px 0;">RATE</th>
              <th style="text-align: right; padding: 3px 0;">AMT</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="border-top: 1px dashed #000; padding-top: 6px; font-size: 11px;">
          <div style="display: flex; justify-content: space-between;"><span>Subtotal (${data.totalItemUnits} items):</span><span>${formatINR(data.foodSubtotal)}</span></div>
          ${data.discountAmount > 0 ? `<div style="display: flex; justify-content: space-between;"><span>Discount (${data.discountLabel}):</span><span>- ${formatINR(data.discountAmount)}</span></div>` : ''}
          ${data.serviceChargeAmount > 0 ? `<div style="display: flex; justify-content: space-between;"><span>Service Charge (${data.serviceChargeLabel}):</span><span>+ ${formatINR(data.serviceChargeAmount)}</span></div>` : ''}
          ${packagingPrintRow}
          <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px dotted #000; border-bottom: 1px dotted #000; padding: 2px 0; margin: 2px 0;"><span>Net Taxable Value:</span><span>${formatINR(data.taxableValue)}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>CGST (${data.halfGstRate}%):</span><span>+ ${formatINR(data.cgstAmount)}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>SGST (${data.halfGstRate}%):</span><span>+ ${formatINR(data.sgstAmount)}</span></div>
          ${tipPrintRow}
          
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; border-top: 2px solid #000; border-bottom: 2px solid #000; margin: 6px 0; padding: 4px 0;">
            <span>GRAND TOTAL:</span>
            <span>${formatINR(data.grandTotal)}</span>
          </div>
          <div style="font-size: 10px; font-style: italic; text-align: center; margin-top: 4px;">
            ${inrToWords(data.grandTotal)}
          </div>
        </div>

        <div style="text-align: center; margin-top: 10px; font-size: 10px; border-top: 1px dashed #000; padding-top: 6px;">
          <p style="margin: 2px 0;">${escapeHtml(rest.footerNote || 'Thank You! Visit Again!')}</p>
          <p style="margin: 2px 0; font-size: 9px;">GST INVOICE • POWERED BY SMART BILLING</p>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // FORMAT 2: FORMAL A4 GST TAX INVOICE
  // -------------------------------------------------------------
  else if (format === 'formalA4') {
    const itemRowsA4 = rest.items.map((it, idx) => `
      <tr>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: left; font-weight: bold;">${escapeHtml(it.name || 'Food Item')}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">9963</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">${it.qty}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${it.price.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${(it.qty * it.price).toFixed(2)}</td>
      </tr>
    `).join('');

    htmlContent = `
      <div class="rest-print-a4">
        <!-- Top Header Banner -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 14px;">
          <div>
            <h2 style="margin: 0; font-size: 20px; font-weight: 900; text-transform: uppercase;">${escapeHtml(rest.name)}</h2>
            <p style="margin: 3px 0; font-size: 12px;">${escapeHtml(rest.address)}</p>
            ${phonePrintLine}
            <p style="margin: 3px 0; font-size: 12px;"><strong>GSTIN:</strong> ${escapeHtml(rest.gstin)} &nbsp;|&nbsp; <strong>State:</strong> ${escapeHtml(rest.gstin.substring(0, 2) || '27')}</p>
            ${fssaiPrintLine}
          </div>
          <div style="text-align: right;">
            <div style="display: inline-block; border: 1.5px solid #000; padding: 4px 10px; font-size: 12px; font-weight: bold; text-transform: uppercase;">TAX INVOICE</div>
            <p style="margin: 4px 0 0 0; font-size: 11px; font-style: italic;">Original for Recipient</p>
          </div>
        </div>

        <!-- Buyer & Invoice Meta Box -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #000; margin-bottom: 14px; font-size: 12px;">
          <div style="padding: 8px 12px; border-right: 1px solid #000;">
            <div style="font-weight: bold; border-bottom: 1px dashed #000; padding-bottom: 3px; margin-bottom: 5px;">BILLED TO / CUSTOMER DETAILS:</div>
            <div><strong>Customer Name:</strong> ${escapeHtml(rest.customer)}</div>
            <div><strong>Order Type:</strong> ${escapeHtml(rest.orderType)}</div>
            <div><strong>Table / Token:</strong> ${escapeHtml(rest.tableNo)}</div>
            <div><strong>Payment Method:</strong> ${escapeHtml(rest.paymentMode)}</div>
          </div>
          <div style="padding: 8px 12px;">
            <div style="font-weight: bold; border-bottom: 1px dashed #000; padding-bottom: 3px; margin-bottom: 5px;">INVOICE DETAILS:</div>
            <div><strong>Invoice No:</strong> ${escapeHtml(billNum)}</div>
            <div><strong>Date:</strong> ${displayDate} &nbsp;&nbsp; <strong>Time:</strong> ${escapeHtml(displayTime)}</div>
            <div><strong>Steward / Server:</strong> ${escapeHtml(rest.serverName)}</div>
            <div><strong>Service Category:</strong> Restaurant Service (SAC 9963)</div>
          </div>
        </div>

        <!-- Itemized Table -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 14px; font-size: 12px;">
          <thead>
            <tr style="background: #e5e7eb; border-bottom: 1.5px solid #000;">
              <th style="border: 1px solid #000; padding: 6px; width: 35px; text-align: center;">#</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: left;">Item Description & Specifications</th>
              <th style="border: 1px solid #000; padding: 6px; width: 70px; text-align: center;">HSN/SAC</th>
              <th style="border: 1px solid #000; padding: 6px; width: 45px; text-align: center;">Qty</th>
              <th style="border: 1px solid #000; padding: 6px; width: 80px; text-align: right;">Rate (₹)</th>
              <th style="border: 1px solid #000; padding: 6px; width: 90px; text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${itemRowsA4}
          </tbody>
        </table>

        <!-- Tax Breakup & Grand Summary Grid -->
        <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <!-- GST Tax Split Table -->
          <div style="border: 1px solid #000; padding: 8px;">
            <div style="font-weight: bold; font-size: 11px; margin-bottom: 6px; border-bottom: 1px solid #000; padding-bottom: 3px;">GST TAX COMPUTATION (SAC 9963)</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="border-bottom: 1px solid #000;">
                  <th style="text-align: left; padding: 3px;">Tax Slab</th>
                  <th style="text-align: right; padding: 3px;">Taxable</th>
                  <th style="text-align: right; padding: 3px;">CGST</th>
                  <th style="text-align: right; padding: 3px;">SGST</th>
                  <th style="text-align: right; padding: 3px;">Total Tax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 4px 3px;">GST ${data.gstRate}%</td>
                  <td style="text-align: right; padding: 4px 3px;">${formatINR(data.taxableValue)}</td>
                  <td style="text-align: right; padding: 4px 3px;">${formatINR(data.cgstAmount)}</td>
                  <td style="text-align: right; padding: 4px 3px;">${formatINR(data.sgstAmount)}</td>
                  <td style="text-align: right; padding: 4px 3px; font-weight: bold;">${formatINR(data.totalGst)}</td>
                </tr>
              </tbody>
            </table>
            <div style="font-size: 10px; margin-top: 10px; color: #000;">
              <strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
            </div>
          </div>

          <!-- Summary Box -->
          <div style="border: 1px solid #000; padding: 8px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; padding: 2px 0;"><span>Gross Subtotal:</span><span>${formatINR(data.foodSubtotal)}</span></div>
            <div style="display: flex; justify-content: space-between; padding: 2px 0;"><span>Discount (${data.discountLabel}):</span><span>- ${formatINR(data.discountAmount)}</span></div>
            <div style="display: flex; justify-content: space-between; padding: 2px 0;"><span>Service Charge (${data.serviceChargeLabel}):</span><span>+ ${formatINR(data.serviceChargeAmount)}</span></div>
            ${data.packagingAmount > 0 ? `<div style="display: flex; justify-content: space-between; padding: 2px 0;"><span>Packaging / Parcel Fee:</span><span>+ ${formatINR(data.packagingAmount)}</span></div>` : ''}
            <div style="display: flex; justify-content: space-between; padding: 3px 0; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; margin: 3px 0;"><span>Taxable Value:</span><span>${formatINR(data.taxableValue)}</span></div>
            <div style="display: flex; justify-content: space-between; padding: 2px 0;"><span>CGST (${data.halfGstRate}%):</span><span>+ ${formatINR(data.cgstAmount)}</span></div>
            <div style="display: flex; justify-content: space-between; padding: 2px 0;"><span>SGST (${data.halfGstRate}%):</span><span>+ ${formatINR(data.sgstAmount)}</span></div>
            ${data.tipAmount > 0 ? `<div style="display: flex; justify-content: space-between; padding: 2px 0;"><span>Tip / Gratuity:</span><span>+ ${formatINR(data.tipAmount)}</span></div>` : ''}
            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; font-weight: 900; border-top: 2px solid #000; margin-top: 4px;"><span>FINAL TOTAL (₹):</span><span>${formatINR(data.grandTotal)}</span></div>
          </div>
        </div>

        <!-- In Words & Footer Signatures -->
        <div style="border: 1px solid #000; padding: 8px 12px; margin-bottom: 14px; font-size: 12px;">
          <strong>Amount Chargeable (in words):</strong> <em>${inrToWords(data.grandTotal)}</em>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 10px;">
          <div style="font-size: 11px;">
            <p style="margin: 0;">${escapeHtml(rest.footerNote || 'Thank You! Visit Again!')}</p>
            <p style="margin: 3px 0 0 0; font-size: 10px;">Subject to local jurisdiction. Computer Generated GST Invoice.</p>
          </div>
          <div style="text-align: center; width: 220px; border-top: 1px solid #000; padding-top: 5px; font-size: 11px;">
            <strong>For ${escapeHtml(rest.name)}</strong><br>
            <span style="font-size: 10px;">Authorised Signatory</span>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // FORMAT 3: KITCHEN ORDER TICKET (KOT)
  // -------------------------------------------------------------
  else if (format === 'kot') {
    htmlContent = `
      <div class="rest-print-kot">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 900; letter-spacing: 1px;">KITCHEN ORDER TICKET (KOT)</h2>
          <p style="margin: 2px 0; font-size: 12px; font-weight: bold;">${escapeHtml(rest.name)}</p>
        </div>

        <div style="border: 2px solid #000; padding: 6px 10px; text-align: center; font-size: 15px; font-weight: 900; margin-bottom: 10px;">
          ${escapeHtml(rest.tableNo.toUpperCase())} &nbsp;•&nbsp; ${escapeHtml(rest.orderType.toUpperCase())}
        </div>

        <div style="font-size: 12px; border-bottom: 1.5px dashed #000; padding-bottom: 6px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;"><span>KOT / Bill: <strong>${escapeHtml(billNum)}</strong></span><span>Date: <strong>${displayDate}</strong></span></div>
          <div style="display: flex; justify-content: space-between;"><span>Time: <strong>${escapeHtml(displayTime)}</strong></span><span>Steward: <strong>${escapeHtml(rest.serverName)}</strong></span></div>
          <div>Customer: <strong>${escapeHtml(rest.customer)}</strong></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px;">
          <thead>
            <tr style="border-bottom: 2px solid #000;">
              <th style="text-align: left; padding: 4px 0; width: 30px;">[✓]</th>
              <th style="text-align: left; padding: 4px 0;">Item Ordered</th>
              <th style="text-align: right; padding: 4px 0; width: 60px;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${rest.items.map(it => `
              <tr style="border-bottom: 1px dashed #000;">
                <td style="padding: 6px 0; font-size: 13px;">[ &nbsp; ]</td>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px;">${escapeHtml(it.name || 'Food Item')}</td>
                <td style="text-align: right; padding: 6px 0; font-size: 15px; font-weight: 900;">${it.qty}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top: 1.5px solid #000; padding-top: 8px; font-size: 12px; display: flex; justify-content: space-between;">
          <span>Total Dishes: <strong>${rest.items.length}</strong></span>
          <span>Total Qty: <strong>${data.totalItemUnits}</strong></span>
        </div>

        <div style="border-top: 1px dashed #000; margin-top: 14px; padding-top: 8px; font-size: 11px; display: flex; justify-content: space-between;">
          <span>Chef: ______________</span>
          <span>Time Out: ___________</span>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // FORMAT 4: MINI 58MM POCKET SLIP
  // -------------------------------------------------------------
  else if (format === 'mini58') {
    htmlContent = `
      <div class="rest-print-mini">
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px;">
          <div style="font-weight: 900; font-size: 13px; text-transform: uppercase;">${escapeHtml(rest.name)}</div>
          ${rest.phone ? `<div style="font-size: 10px;">Ph: ${escapeHtml(rest.phone)}</div>` : ''}
          <div style="font-size: 10px;">GSTIN: ${escapeHtml(rest.gstin)}</div>
        </div>

        <div style="font-size: 10px; border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px;">
          <div>${displayDate} ${escapeHtml(displayTime)}</div>
          <div>${escapeHtml(billNum)} | ${escapeHtml(rest.tableNo)} | ${escapeHtml(rest.orderType)}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 4px;">
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left; padding: 2px 0;">Item</th>
              <th style="text-align: center; padding: 2px 0;">Qty</th>
              <th style="text-align: right; padding: 2px 0;">Amt</th>
            </tr>
          </thead>
          <tbody>
            ${rest.items.map(it => `
              <tr>
                <td style="text-align: left; padding: 2px 0;">${escapeHtml(it.name || 'Item')}</td>
                <td style="text-align: center; padding: 2px 0;">${it.qty}</td>
                <td style="text-align: right; padding: 2px 0;">${(it.qty * it.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top: 1px dashed #000; padding-top: 4px; font-size: 10px;">
          <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span><span>${formatINR(data.foodSubtotal)}</span></div>
          ${data.discountAmount > 0 ? `<div style="display: flex; justify-content: space-between;"><span>Disc:</span><span>- ${formatINR(data.discountAmount)}</span></div>` : ''}
          <div style="display: flex; justify-content: space-between;"><span>Tax (${data.gstRate}%):</span><span>+ ${formatINR(data.totalGst)}</span></div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 0; margin-top: 2px;">
            <span>TOTAL:</span>
            <span>${formatINR(data.grandTotal)}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 6px; font-size: 9px; border-top: 1px dashed #000; padding-top: 4px;">
          <div>${escapeHtml(rest.footerNote || 'Thank You! Visit Again!')}</div>
        </div>
      </div>
    `;
  }

  restPrintContent.innerHTML = htmlContent;

  document.body.classList.remove('printing-general');
  document.body.classList.add('printing-restaurant');
  window.print();
  setTimeout(() => document.body.classList.remove('printing-restaurant'), 1500);
}

// =========================================================================
// GENERAL UTILITIES & FORMATTING
// =========================================================================
function formatINR(val) {
  if (isNaN(val) || val === null || val === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

function inrToWords(amount) {
  if (amount === 0) return 'Zero Rupees Only';
  if (amount < 0) return 'Negative Amount';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigit(num) {
    if (num === 0) return '';
    if (num < 10) return singleDigits[num];
    if (num < 20) return twoDigits[num - 10];
    const rem = num % 10;
    return tens[Math.floor(num / 10)] + (rem ? ' ' + singleDigits[rem] : '');
  }

  function convertThreeDigit(num) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    let str = '';
    if (hundred) str += singleDigits[hundred] + ' Hundred';
    if (hundred && rest) str += ' and ';
    if (rest) str += convertTwoDigit(rest);
    return str;
  }

  let crore = Math.floor(amount / 10000000);
  let remainder = amount % 10000000;

  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  let words = '';

  if (crore > 0) words += convertTwoDigit(crore) + ' Crore ';
  if (lakh > 0) words += convertTwoDigit(lakh) + ' Lakh ';
  if (thousand > 0) words += convertTwoDigit(thousand) + ' Thousand ';
  if (remainder > 0) words += convertThreeDigit(remainder) + ' ';

  return words.trim() + ' Rupees Only';
}

function escapeHtml(string) {
  return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg, isError = false) {
  toastText.textContent = msg;
  toastMessage.style.background = isError ? '#f43f5e' : '#10b981';
  toastMessage.classList.add('show');
  setTimeout(() => {
    toastMessage.classList.remove('show');
  }, 3000);
}

// History Handling
function saveCurrentToHistory() {
  const data = calculateGeneral();
  const record = {
    id: Date.now(),
    date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    baseAmount: appState.general.baseAmount,
    qty: data.qty,
    discount: data.discountLabel,
    discountVal: data.discountAmount,
    gstRate: data.gstRate,
    taxMode: appState.general.taxMode,
    grandTotal: data.grandTotal
  };

  appState.history.unshift(record);
  if (appState.history.length > 20) appState.history.pop();
  localStorage.setItem('gst_calc_history', JSON.stringify(appState.history));
  renderHistory();
  showToast('Calculation saved to history!');
}

function renderHistory() {
  historyCount.textContent = appState.history.length;
  if (appState.history.length === 0) {
    historyList.innerHTML = '<p class="empty-history-text">No saved calculations yet. Click <b>"Save Calculation"</b> above to save records.</p>';
    return;
  }

  historyList.innerHTML = appState.history.map(item => `
    <div class="history-item" onclick="loadHistoryItem(${item.id})">
      <div class="history-item-top">
        <span class="history-time"><i class="fa-regular fa-clock"></i> ${item.date}</span>
        <span class="history-total">${formatINR(item.grandTotal)}</span>
      </div>
      <div class="history-tags">
        <span class="history-tag">Base: ₹${item.baseAmount.toLocaleString('en-IN')}</span>
        <span class="history-tag">Disc: ${item.discount}</span>
        <span class="history-tag">GST: ${item.gstRate}%</span>
      </div>
    </div>
  `).join('');
}

window.loadHistoryItem = function(id) {
  const item = appState.history.find(h => h.id === id);
  if (!item) return;

  appState.general.baseAmount = item.baseAmount;
  baseAmountInput.value = item.baseAmount;

  appState.general.quantity = item.qty || 1;
  quantityInput.value = appState.general.quantity;

  appState.general.gstRate = item.gstRate;
  gstSlabBtns.forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-gst')) === item.gstRate);
  });

  calculateGeneral();
  showToast('Loaded calculation from history!');
};

function clearAllHistory() {
  if (appState.history.length === 0) return;
  appState.history = [];
  localStorage.removeItem('gst_calc_history');
  renderHistory();
  showToast('History cleared.');
}

function resetAllCalculators() {
  // Reset General
  appState.general.baseAmount = 10000;
  appState.general.quantity = 1;
  appState.general.discountType = 'percent';
  appState.general.discountValue = 10;
  appState.general.gstRate = 18;
  appState.general.isCustomGst = false;
  appState.general.taxMode = 'exclusive';
  appState.general.supplyType = 'intra';

  baseAmountInput.value = 10000;
  quantityInput.value = 1;
  discountValueInput.value = 10;
  customGstInput.value = '';

  discountSegmentBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-discount-type') === 'percent'));
  discountSymbol.textContent = '%';
  discountPercentChips.classList.remove('hidden');
  discountAmountChips.classList.add('hidden');
  taxModeBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-tax-mode') === 'exclusive'));
  gstSlabBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-gst') === '18'));
  document.querySelector('input[name="gstSupplyType"][value="intra"]').checked = true;

  updateGeneralDiscountChipsActive();
  calculateGeneral();

  // Reset Restaurant
  appState.restaurant.billNo = 'INV-' + Math.floor(1000 + Math.random() * 9000);
  appState.restaurant.discountVal = 5;
  appState.restaurant.serviceChargeVal = 5;
  appState.restaurant.gstRate = 5;
  restDiscountValInput.value = 5;
  restServiceChargeValInput.value = 5;
  calculateRestaurant();

  showToast('Calculator reset to default!');
}

function toggleTheme() {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('app_theme', theme);
  const icon = themeToggleBtn.querySelector('i');
  if (theme === 'light') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
}
