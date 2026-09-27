/**
 * Helper utilities for Indian GST, Currency Formatting, Number to Words & Print/Share templates.
 */

// Format numbers into Indian Rupee (₹ INR) format
export function formatINR(val) {
  if (isNaN(val) || val === null || val === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

// Convert INR number into Indian Words (Crores, Lakhs, Thousands, Hundreds)
export function inrToWords(amount) {
  const rounded = Math.round(Number(amount) || 0);
  if (rounded === 0) return 'Zero Rupees Only';
  if (rounded < 0) return 'Negative Amount';

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

  let crore = Math.floor(rounded / 10000000);
  let remainder = rounded % 10000000;

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

export function escapeHtml(string) {
  return String(string || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function getGstDescription(rate) {
  switch (Number(rate)) {
    case 0: return 'Nil / Exempt';
    case 5: return 'Essential';
    case 12: return 'Standard Low';
    case 18: return 'Standard';
    case 28: return 'Luxury';
    default: return 'Custom GST';
  }
}

// Calculate General GST values
export function calculateGeneralGST(state) {
  const base = Math.max(0, parseFloat(state.baseAmount) || 0);
  const qty = Math.max(1, parseInt(state.quantity, 10) || 1);
  const grossSubtotal = base * qty;

  let discountAmount = 0;
  let discountLabel = '';

  if (state.discountType === 'percent') {
    const pct = Math.min(100, Math.max(0, parseFloat(state.discountValue) || 0));
    discountAmount = (grossSubtotal * pct) / 100;
    discountLabel = `${pct}%`;
  } else {
    discountAmount = Math.min(grossSubtotal, Math.max(0, parseFloat(state.discountValue) || 0));
    discountLabel = formatINR(discountAmount);
  }

  const netAfterDiscount = Math.max(0, grossSubtotal - discountAmount);

  let taxableValue = 0;
  let totalGstAmount = 0;
  let grandTotal = 0;
  const gstRate = Math.max(0, parseFloat(state.gstRate) || 0);

  if (state.taxMode === 'exclusive') {
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

  const halfRate = gstRate / 2;
  const halfTax = totalGstAmount / 2;

  const effectiveTotal = taxableValue + totalGstAmount;
  const basePct = effectiveTotal > 0 ? Math.round((taxableValue / effectiveTotal) * 100) : 0;
  const gstPct = effectiveTotal > 0 ? 100 - basePct : 0;
  const savingPct = grossSubtotal > 0 ? Math.round((discountAmount / grossSubtotal) * 100) : 0;

  return {
    grossSubtotal,
    discountAmount,
    discountLabel,
    taxableValue,
    totalGstAmount,
    grandTotal,
    gstRate,
    halfRate,
    halfTax,
    qty,
    basePct,
    gstPct,
    savingPct
  };
}

// Calculate Restaurant POS values
export function calculateRestaurantBill(rest) {
  let foodSubtotal = 0;
  let totalItemUnits = 0;

  (rest.items || []).forEach(item => {
    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    const price = Math.max(0, parseFloat(item.price) || 0);
    foodSubtotal += (qty * price);
    totalItemUnits += qty;
  });

  let discountAmount = 0;
  let discountLabel = '';

  if (rest.discountType === 'percent') {
    const pct = Math.min(100, Math.max(0, parseFloat(rest.discountVal) || 0));
    discountAmount = (foodSubtotal * pct) / 100;
    discountLabel = `${pct}%`;
  } else {
    discountAmount = Math.min(foodSubtotal, Math.max(0, parseFloat(rest.discountVal) || 0));
    discountLabel = formatINR(discountAmount);
  }

  const afterDiscount = Math.max(0, foodSubtotal - discountAmount);

  let serviceChargeAmount = 0;
  let serviceChargeLabel = '';

  if (rest.serviceChargeType === 'percent') {
    const scPct = Math.max(0, parseFloat(rest.serviceChargeVal) || 0);
    serviceChargeAmount = (afterDiscount * scPct) / 100;
    serviceChargeLabel = `${scPct}%`;
  } else {
    serviceChargeAmount = Math.max(0, parseFloat(rest.serviceChargeVal) || 0);
    serviceChargeLabel = formatINR(serviceChargeAmount);
  }

  const packagingAmount = Math.max(0, parseFloat(rest.packagingCharge) || 0);
  const tipAmount = Math.max(0, parseFloat(rest.tip) || 0);

  const taxableValue = afterDiscount + serviceChargeAmount + packagingAmount;

  const gstRate = Math.max(0, parseFloat(rest.gstRate) || 0);
  const halfGstRate = gstRate / 2;
  const totalGst = (taxableValue * gstRate) / 100;
  const cgstAmount = totalGst / 2;
  const sgstAmount = totalGst / 2;

  const grandTotal = Math.round(taxableValue + totalGst + tipAmount);

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
