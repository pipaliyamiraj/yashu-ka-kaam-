import React from 'react';
import { formatINR, inrToWords } from '../utils/helpers';

export default function RestaurantBilling({
  restState,
  setRestState,
  calculation,
  onPrint,
  onCopyWhatsApp,
  showToast
}) {
  const {
    receiptFormat,
    name,
    phone,
    address,
    gstin,
    fssai,
    orderType,
    tableNo,
    serverName,
    customer,
    paymentMode,
    billNo,
    date,
    time,
    items,
    discountType,
    discountVal,
    gstRate,
    serviceChargeType,
    serviceChargeVal,
    packagingCharge,
    tip,
    footerNote
  } = restState;

  const {
    foodSubtotal,
    totalItemUnits,
    discountAmount,
    discountLabel,
    serviceChargeAmount,
    serviceChargeLabel,
    packagingAmount,
    taxableValue,
    halfGstRate,
    cgstAmount,
    sgstAmount,
    tipAmount,
    grandTotal
  } = calculation;

  // Food Item handlers
  const handleUpdateItem = (id, field, value) => {
    setRestState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== id) return item;
        if (field === 'name') return { ...item, name: value };
        if (field === 'qty') return { ...item, qty: Math.max(1, parseInt(value, 10) || 1) };
        if (field === 'price') return { ...item, price: Math.max(0, parseFloat(value) || 0) };
        return item;
      })
    }));
  };

  const handleAddItem = () => {
    setRestState(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), name: 'New Food Item', qty: 1, price: 150 }
      ]
    }));
  };

  const handleAddPreset = (dishName, price) => {
    setRestState(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now() + Math.random(), name: dishName, qty: 1, price: price }
      ]
    }));
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      showToast('At least one item is required in the food bill', true);
      return;
    }
    setRestState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleClearItems = () => {
    setRestState(prev => ({
      ...prev,
      items: [{ id: Date.now(), name: '', qty: 1, price: 0 }]
    }));
    showToast('Food items cleared!');
  };

  // Formatted date & time for receipt
  let displayDate = date;
  if (date && date.includes('-')) {
    const [y, m, d] = date.split('-');
    if (y && m && d) displayDate = `${d}/${m}/${y}`;
  }

  let displayTime = time || '';
  if (time && time.includes(':')) {
    const [hrs, mins] = time.split(':');
    const h = parseInt(hrs, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    displayTime = `${String(formattedH).padStart(2, '0')}:${mins} ${ampm}`;
  }

  const formatLabels = {
    thermal80: 'Thermal 80mm',
    formalA4: 'A4 Tax Invoice',
    kot: 'Kitchen (KOT)',
    mini58: 'Mini Slip (58mm)'
  };

  return (
    <div className="tab-pane active">
      <div className="restaurant-grid">
        {/* Left Column: Details, Food Items & Taxes */}
        <div className="rest-left-column">
          {/* Restaurant Details Card */}
          <section className="card">
            <h2 className="card-title">
              <i className="fa-solid fa-store"></i> Restaurant Details
            </h2>

            <div className="form-row-grid form-row-grid-3">
              <div className="form-group">
                <label htmlFor="restName">Restaurant Name</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-utensils input-lead-icon"></i>
                  <input
                    type="text"
                    id="restName"
                    value={name}
                    placeholder="e.g. Spice Symphony"
                    onChange={(e) => setRestState(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="restPhone">Phone / Mobile No.</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-phone input-lead-icon"></i>
                  <input
                    type="text"
                    id="restPhone"
                    value={phone}
                    placeholder="e.g. +91 9876543210"
                    onChange={(e) => setRestState(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="restGst">GSTIN (GST Number)</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-id-card input-lead-icon"></i>
                  <input
                    type="text"
                    id="restGst"
                    value={gstin}
                    style={{ textTransform: 'uppercase' }}
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    onChange={(e) => setRestState(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label htmlFor="restFssai">FSSAI Lic. No. (Optional)</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-certificate input-lead-icon"></i>
                  <input
                    type="text"
                    id="restFssai"
                    value={fssai}
                    placeholder="e.g. 10019011000123"
                    onChange={(e) => setRestState(prev => ({ ...prev, fssai: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="restAddress">Restaurant Address</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-location-dot input-lead-icon"></i>
                  <input
                    type="text"
                    id="restAddress"
                    value={address}
                    placeholder="e.g. 102, MG Road, Connaught Place, New Delhi"
                    onChange={(e) => setRestState(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="form-row-grid form-row-grid-4">
              <div className="form-group">
                <label htmlFor="restOrderType">Order Type</label>
                <select
                  id="restOrderType"
                  className="std-select"
                  value={orderType}
                  onChange={(e) => setRestState(prev => ({ ...prev, orderType: e.target.value }))}
                >
                  <option value="Dine-In">Dine-In</option>
                  <option value="Takeaway / Parcel">Takeaway / Parcel</option>
                  <option value="Home Delivery">Home Delivery</option>
                  <option value="Online (Swiggy/Zomato)">Online (Swiggy/Zomato)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="restTableNo">Table / Order No.</label>
                <input
                  type="text"
                  id="restTableNo"
                  className="std-input"
                  value={tableNo}
                  placeholder="e.g. Table T-4"
                  onChange={(e) => setRestState(prev => ({ ...prev, tableNo: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="restServerName">Steward / Server</label>
                <input
                  type="text"
                  id="restServerName"
                  className="std-input"
                  value={serverName}
                  placeholder="e.g. Ramesh K."
                  onChange={(e) => setRestState(prev => ({ ...prev, serverName: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="restCustomer">Customer Name</label>
                <input
                  type="text"
                  id="restCustomer"
                  className="std-input"
                  value={customer}
                  placeholder="e.g. Guest"
                  onChange={(e) => setRestState(prev => ({ ...prev, customer: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row-grid form-row-grid-4">
              <div className="form-group">
                <label htmlFor="restBillNo">Bill / Invoice No.</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-receipt input-lead-icon"></i>
                  <input
                    type="text"
                    id="restBillNo"
                    value={billNo}
                    placeholder="e.g. INV-8492"
                    onChange={(e) => setRestState(prev => ({ ...prev, billNo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="restPaymentMode">Payment Method</label>
                <select
                  id="restPaymentMode"
                  className="std-select"
                  value={paymentMode}
                  onChange={(e) => setRestState(prev => ({ ...prev, paymentMode: e.target.value }))}
                >
                  <option value="UPI / QR (GPay/PhonePe)">UPI / QR (GPay/PhonePe)</option>
                  <option value="Cash">Cash</option>
                  <option value="Card (Debit/Credit)">Card (Debit/Credit)</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Due / Pending">Due / Pending</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="restDate">Invoice Date</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-calendar-day input-lead-icon"></i>
                  <input
                    type="date"
                    id="restDate"
                    value={date}
                    onChange={(e) => setRestState(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="restTime">Invoice Time</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-clock input-lead-icon"></i>
                  <input
                    type="time"
                    id="restTime"
                    value={time}
                    onChange={(e) => setRestState(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Food Items Table Card */}
          <section className="card food-items-card">
            <div className="food-items-header">
              <div>
                <h2 className="card-title" style={{ marginBottom: 2 }}>
                  <i className="fa-solid fa-bowl-food"></i> Food Menu Items
                </h2>
                <p className="subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Add dishes, beverages, quantities and prices
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn-outline-sm"
                  title="Clear all menu items"
                  onClick={handleClearItems}
                >
                  <i className="fa-solid fa-trash"></i> Clear Items
                </button>
                <button
                  type="button"
                  className="btn-outline-sm btn-highlight"
                  onClick={handleAddItem}
                >
                  <i className="fa-solid fa-plus"></i> Add Item
                </button>
              </div>
            </div>

            <div className="food-items-table-wrapper">
              <table className="food-table">
                <thead>
                  <tr>
                    <th style={{ width: '42%' }}>Food Item Name</th>
                    <th style={{ width: '18%' }}>Qty</th>
                    <th style={{ width: '25%' }}>Price (₹)</th>
                    <th style={{ width: '15%' }}>Total</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="text"
                          className="food-input-name"
                          value={item.name}
                          placeholder="Item name"
                          onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="food-input-qty"
                          value={item.qty}
                          min="1"
                          step="1"
                          onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="food-input-price"
                          value={item.price}
                          min="0"
                          step="any"
                          onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                        />
                      </td>
                      <td>
                        <span className="food-row-total">{formatINR(item.qty * item.price)}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-remove-food"
                          title="Remove Item"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Food Presets */}
            <div className="quick-food-presets">
              <span className="quick-label">Popular Dishes:</span>
              {[
                { name: 'Paneer Butter Masala', price: 280 },
                { name: 'Butter Naan', price: 45 },
                { name: 'Veg Biryani', price: 240 },
                { name: 'Chicken Tikka', price: 320 },
                { name: 'Cold Beverage', price: 60 }
              ].map(dish => (
                <button
                  key={dish.name}
                  type="button"
                  className="food-preset-chip"
                  onClick={() => handleAddPreset(dish.name, dish.price)}
                >
                  + {dish.name} (₹{dish.price})
                </button>
              ))}
            </div>
          </section>

          {/* Taxes, Discount & Extra Charges */}
          <section className="card">
            <h2 className="card-title">
              <i className="fa-solid fa-percent"></i> Taxes, Discount & Extra Charges
            </h2>

            <div className="rest-config-grid">
              {/* Food Discount */}
              <div className="rest-config-box">
                <div className="config-title-row">
                  <label><i className="fa-solid fa-tag"></i> Food Discount</label>
                  <div className="segmented-control mini-toggle">
                    <button
                      type="button"
                      className={`segment-btn ${discountType === 'percent' ? 'active' : ''}`}
                      onClick={() => setRestState(prev => ({ ...prev, discountType: 'percent' }))}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${discountType === 'amount' ? 'active' : ''}`}
                      onClick={() => setRestState(prev => ({ ...prev, discountType: 'amount' }))}
                    >
                      ₹
                    </button>
                  </div>
                </div>
                <div className="input-with-symbol">
                  <span className="currency-symbol">{discountType === 'percent' ? '%' : '₹'}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={discountVal === 0 ? '' : discountVal}
                    placeholder="0"
                    onChange={(e) => setRestState(prev => ({
                      ...prev,
                      discountVal: Math.max(0, parseFloat(e.target.value) || 0)
                    }))}
                  />
                </div>
              </div>

              {/* Restaurant GST */}
              <div className="rest-config-box">
                <div className="config-title-row">
                  <label><i className="fa-solid fa-landmark"></i> Restaurant GST</label>
                  <span className="sub-pill">{gstRate}% (Restaurant)</span>
                </div>
                <div className="rest-gst-options">
                  {[
                    { rate: 5, label: '5% (Standard)' },
                    { rate: 12, label: '12% (AC Hotel)' },
                    { rate: 18, label: '18% (Luxury)' },
                    { rate: 0, label: '0% (Nil)' }
                  ].map(slab => (
                    <button
                      key={slab.rate}
                      type="button"
                      className={`rest-gst-btn ${gstRate === slab.rate ? 'active' : ''}`}
                      onClick={() => setRestState(prev => ({ ...prev, gstRate: slab.rate }))}
                    >
                      {slab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Charge */}
              <div className="rest-config-box">
                <div className="config-title-row">
                  <label><i className="fa-solid fa-bell-concierge"></i> Service Charge</label>
                  <div className="segmented-control mini-toggle">
                    <button
                      type="button"
                      className={`segment-btn ${serviceChargeType === 'percent' ? 'active' : ''}`}
                      onClick={() => setRestState(prev => ({ ...prev, serviceChargeType: 'percent' }))}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${serviceChargeType === 'amount' ? 'active' : ''}`}
                      onClick={() => setRestState(prev => ({ ...prev, serviceChargeType: 'amount' }))}
                    >
                      ₹
                    </button>
                  </div>
                </div>
                <div className="input-with-symbol">
                  <span className="currency-symbol">{serviceChargeType === 'percent' ? '%' : '₹'}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={serviceChargeVal === 0 ? '' : serviceChargeVal}
                    placeholder="0"
                    onChange={(e) => setRestState(prev => ({
                      ...prev,
                      serviceChargeVal: Math.max(0, parseFloat(e.target.value) || 0)
                    }))}
                  />
                </div>
                <div className="quick-chips" style={{ marginTop: 6 }}>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => setRestState(prev => ({ ...prev, serviceChargeVal: 0 }))}
                  >
                    0% (None)
                  </button>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => setRestState(prev => ({ ...prev, serviceChargeVal: 5 }))}
                  >
                    5%
                  </button>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => setRestState(prev => ({ ...prev, serviceChargeVal: 10 }))}
                  >
                    10%
                  </button>
                </div>
              </div>
            </div>

            {/* Extra Charges Row */}
            <div className="rest-config-grid" style={{ marginTop: 14 }}>
              <div className="rest-config-box">
                <div className="config-title-row">
                  <label><i className="fa-solid fa-box-open"></i> Packaging / Delivery (₹)</label>
                </div>
                <div className="input-with-symbol">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={packagingCharge === 0 ? '' : packagingCharge}
                    placeholder="0.00"
                    onChange={(e) => setRestState(prev => ({
                      ...prev,
                      packagingCharge: Math.max(0, parseFloat(e.target.value) || 0)
                    }))}
                  />
                </div>
              </div>

              <div className="rest-config-box">
                <div className="config-title-row">
                  <label><i className="fa-solid fa-hand-holding-dollar"></i> Tip / Gratuity (₹)</label>
                </div>
                <div className="input-with-symbol">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={tip === 0 ? '' : tip}
                    placeholder="0.00"
                    onChange={(e) => setRestState(prev => ({
                      ...prev,
                      tip: Math.max(0, parseFloat(e.target.value) || 0)
                    }))}
                  />
                </div>
              </div>

              <div className="rest-config-box">
                <div className="config-title-row">
                  <label><i className="fa-solid fa-message"></i> Custom Footer Message</label>
                </div>
                <input
                  type="text"
                  className="std-input"
                  value={footerNote}
                  placeholder="e.g. Free Wi-Fi: DineGuest"
                  onChange={(e) => setRestState(prev => ({ ...prev, footerNote: e.target.value }))}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: POS Receipt Live Preview & Print Format */}
        <div className="rest-right-column">
          <div className="format-selector-card">
            <label className="format-header-label">
              <i className="fa-solid fa-file-invoice"></i> Choose Receipt / Print Format:
            </label>
            <div className="format-pill-group">
              {[
                { id: 'thermal80', icon: 'fa-receipt', label: 'Thermal (80mm)' },
                { id: 'formalA4', icon: 'fa-file-lines', label: 'A4 Tax Invoice' },
                { id: 'kot', icon: 'fa-fire-burner', label: 'Kitchen (KOT)' },
                { id: 'mini58', icon: 'fa-ticket', label: 'Mini Slip (58mm)' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`format-btn ${receiptFormat === f.id ? 'active' : ''}`}
                  onClick={() => {
                    setRestState(prev => ({ ...prev, receiptFormat: f.id }));
                    showToast(`Print format switched to: ${f.label}`);
                  }}
                >
                  <i className={`fa-solid ${f.icon}`}></i>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* POS Receipt Preview */}
          <div className="card pos-receipt-card">
            <div className="receipt-cutout-top"></div>

            <div className="receipt-header-center">
              <h3>{name || 'Restaurant Name'}</h3>
              <p className="receipt-address">{address}</p>
              {phone && <p className="receipt-phone">Ph: {phone}</p>}
              <p className="receipt-gst">GSTIN: <strong>{gstin || 'N/A'}</strong></p>
              {fssai && <p className="receipt-fssai">FSSAI Lic No: {fssai}</p>}
              <div className="receipt-dashed-line"></div>

              <div className="receipt-meta-grid">
                <div>Date: <strong>{displayDate}</strong></div>
                <div>Time: <strong>{displayTime}</strong></div>
                <div>Bill No: <strong>{billNo.startsWith('#') ? billNo : `#${billNo}`}</strong></div>
                <div>Type: <strong>{orderType}</strong></div>
                <div>Table: <strong>{tableNo}</strong></div>
                <div>Server: <strong>{serverName}</strong></div>
                <div>Customer: <strong>{customer}</strong></div>
                <div>Pay Mode: <strong>{paymentMode}</strong></div>
              </div>
              <div className="receipt-dashed-line"></div>
            </div>

            {/* Food Items List */}
            <div className="receipt-items-table">
              <div className="receipt-item-header">
                <span className="item-col-name">ITEM</span>
                <span className="item-col-qty">QTY</span>
                <span className="item-col-rate">RATE</span>
                <span className="item-col-amt">AMT (₹)</span>
              </div>
              <div>
                {items.map(item => (
                  <div key={item.id} className="receipt-item-line">
                    <span className="item-col-name">{item.name || 'Item'}</span>
                    <span className="item-col-qty">{item.qty}</span>
                    <span className="item-col-rate">{item.price.toFixed(2)}</span>
                    <span className="item-col-amt">{(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="receipt-dashed-line"></div>

            {/* Calculations Summary */}
            <div className="receipt-summary-table">
              <div className="receipt-row">
                <span>Food Subtotal ({totalItemUnits} items):</span>
                <strong>{formatINR(foodSubtotal)}</strong>
              </div>

              {discountAmount > 0 && (
                <div className="receipt-row text-discount">
                  <span>Discount ({discountLabel}):</span>
                  <strong>- {formatINR(discountAmount)}</strong>
                </div>
              )}

              {serviceChargeAmount > 0 && (
                <div className="receipt-row">
                  <span>Service Charge ({serviceChargeLabel}):</span>
                  <strong>+ {formatINR(serviceChargeAmount)}</strong>
                </div>
              )}

              {packagingAmount > 0 && (
                <div className="receipt-row">
                  <span>Packaging / Parcel Fee:</span>
                  <strong>+ {formatINR(packagingAmount)}</strong>
                </div>
              )}

              <div className="receipt-row text-taxable">
                <span>Taxable Amount:</span>
                <strong>{formatINR(taxableValue)}</strong>
              </div>

              <div className="receipt-row text-tax">
                <span>CGST ({halfGstRate}%):</span>
                <strong>+ {formatINR(cgstAmount)}</strong>
              </div>

              <div className="receipt-row text-tax">
                <span>SGST ({halfGstRate}%):</span>
                <strong>+ {formatINR(sgstAmount)}</strong>
              </div>

              {tipAmount > 0 && (
                <div className="receipt-row">
                  <span>Tip / Gratuity:</span>
                  <strong>+ {formatINR(tipAmount)}</strong>
                </div>
              )}

              <div className="receipt-double-line"></div>

              <div className="receipt-grand-total-row">
                <div className="grand-label">GRAND TOTAL</div>
                <div className="grand-amt">{formatINR(grandTotal)}</div>
              </div>
              <div className="receipt-in-words">{inrToWords(grandTotal)}</div>
            </div>

            <div className="receipt-footer-center">
              <p>{footerNote || 'Thank You! Visit Again!'}</p>
            </div>
            <div className="receipt-cutout-bottom"></div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-group" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn-action btn-primary"
              onClick={onPrint}
            >
              <i className="fa-solid fa-print"></i> Print Receipt ({formatLabels[receiptFormat] || 'Thermal 80mm'})
            </button>
            <button
              type="button"
              className="btn-action btn-secondary"
              onClick={onCopyWhatsApp}
            >
              <i className="fa-solid fa-share-nodes"></i> Share WhatsApp Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
