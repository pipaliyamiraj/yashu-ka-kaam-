import React from 'react';
import { formatINR, inrToWords, getGstDescription } from '../utils/helpers';

export default function GstCalculator({
  generalState,
  setGeneralState,
  calculation,
  history,
  onSaveHistory,
  onLoadHistory,
  onClearHistory,
  onCopySummary,
  onPrint
}) {
  const {
    baseAmount,
    quantity,
    discountType,
    discountValue,
    gstRate,
    isCustomGst,
    taxMode,
    supplyType
  } = generalState;

  const {
    grossSubtotal,
    discountAmount,
    discountLabel,
    taxableValue,
    totalGstAmount,
    grandTotal,
    halfRate,
    halfTax,
    basePct,
    gstPct,
    savingPct
  } = calculation;

  const handleBaseAmountChange = (e) => {
    const val = Math.max(0, parseFloat(e.target.value) || 0);
    setGeneralState(prev => ({ ...prev, baseAmount: val }));
  };

  const handleQuickAdd = (add) => {
    setGeneralState(prev => ({ ...prev, baseAmount: (prev.baseAmount || 0) + add }));
  };

  const handleQtyChange = (val) => {
    setGeneralState(prev => ({ ...prev, quantity: Math.max(1, parseInt(val, 10) || 1) }));
  };

  const handleGstSlab = (rate) => {
    setGeneralState(prev => ({
      ...prev,
      gstRate: rate,
      isCustomGst: false
    }));
  };

  const handleCustomGstChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0) {
      setGeneralState(prev => ({
        ...prev,
        gstRate: val,
        isCustomGst: true
      }));
    }
  };

  return (
    <div className="tab-pane active">
      <main className="calculator-grid">
        {/* Left Column: Inputs Section */}
        <section className="card input-card">
          <h2 className="card-title">
            <i className="fa-solid fa-sliders"></i> Enter Values
          </h2>

          {/* 1. Base Amount */}
          <div className="form-group">
            <label htmlFor="baseAmount">
              <span>Base Amount (INR)</span>
              <span className="currency-tag">₹ INR</span>
            </label>
            <div className="input-with-symbol">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                id="baseAmount"
                placeholder="0.00"
                min="0"
                step="any"
                value={baseAmount === 0 ? '' : baseAmount}
                onChange={handleBaseAmountChange}
                autoComplete="off"
              />
            </div>
            {/* Quick Amount Presets */}
            <div className="quick-chips">
              <span className="quick-label">Quick Add:</span>
              {[500, 1000, 5000, 10000, 50000].map(val => (
                <button
                  key={val}
                  type="button"
                  className="chip-btn"
                  onClick={() => handleQuickAdd(val)}
                >
                  +₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Tax Mode */}
          <div className="form-group-inline">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="quantity">Quantity / Units</label>
              <div className="input-stepper">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleQtyChange(quantity - 1)}
                >
                  <i className="fa-solid fa-minus"></i>
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  min="1"
                  step="1"
                  onChange={(e) => handleQtyChange(e.target.value)}
                />
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleQtyChange(quantity + 1)}
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>

            <div className="form-group" style={{ flex: 1.2 }}>
              <label>GST Treatment</label>
              <div className="toggle-switch-group">
                <button
                  type="button"
                  className={`tax-mode-btn ${taxMode === 'exclusive' ? 'active' : ''}`}
                  onClick={() => setGeneralState(prev => ({ ...prev, taxMode: 'exclusive' }))}
                >
                  <i className="fa-solid fa-plus"></i> Add GST
                </button>
                <button
                  type="button"
                  className={`tax-mode-btn ${taxMode === 'inclusive' ? 'active' : ''}`}
                  onClick={() => setGeneralState(prev => ({ ...prev, taxMode: 'inclusive' }))}
                >
                  <i className="fa-solid fa-filter"></i> Incl. GST
                </button>
              </div>
            </div>
          </div>

          {/* 2. Discount Section */}
          <div className="form-section">
            <div className="section-header">
              <label className="section-label">
                <i className="fa-solid fa-tags"></i> Discount Option
              </label>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segment-btn ${discountType === 'percent' ? 'active' : ''}`}
                  onClick={() => setGeneralState(prev => ({
                    ...prev,
                    discountType: 'percent',
                    discountValue: prev.discountValue > 100 ? 10 : prev.discountValue
                  }))}
                >
                  <i className="fa-solid fa-percent"></i> Percentage (%)
                </button>
                <button
                  type="button"
                  className={`segment-btn ${discountType === 'amount' ? 'active' : ''}`}
                  onClick={() => setGeneralState(prev => ({ ...prev, discountType: 'amount' }))}
                >
                  <i className="fa-solid fa-indian-rupee-sign"></i> Flat Amount (₹)
                </button>
              </div>
            </div>

            <div className="input-with-symbol">
              <span className="currency-symbol">{discountType === 'percent' ? '%' : '₹'}</span>
              <input
                type="number"
                placeholder={discountType === 'percent' ? 'e.g. 10%' : 'e.g. 500'}
                min="0"
                step="any"
                value={discountValue === 0 ? '' : discountValue}
                onChange={(e) => setGeneralState(prev => ({
                  ...prev,
                  discountValue: Math.max(0, parseFloat(e.target.value) || 0)
                }))}
                autoComplete="off"
              />
            </div>

            {/* Presets */}
            {discountType === 'percent' ? (
              <div className="quick-chips">
                <span className="quick-label">Presets:</span>
                {[0, 5, 10, 15, 20, 25, 50].map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`discount-chip ${discountValue === val ? 'active' : ''}`}
                    onClick={() => setGeneralState(prev => ({ ...prev, discountValue: val }))}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            ) : (
              <div className="quick-chips">
                <span className="quick-label">Presets:</span>
                {[100, 250, 500, 1000, 2000].map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`discount-flat-chip ${discountValue === val ? 'active' : ''}`}
                    onClick={() => setGeneralState(prev => ({ ...prev, discountValue: val }))}
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. GST Rate Section */}
          <div className="form-section">
            <div className="section-header">
              <label className="section-label">
                <i className="fa-solid fa-landmark"></i> GST Rate Slab
              </label>
              <span className="sub-pill">
                {isCustomGst ? `${gstRate}% Custom GST` : `${gstRate}% ${getGstDescription(gstRate)}`}
              </span>
            </div>

            <div className="gst-slabs-grid">
              {[
                { rate: 0, desc: 'Nil / Exempt' },
                { rate: 5, desc: 'Essential' },
                { rate: 12, desc: 'Standard (Low)' },
                { rate: 18, desc: 'Standard' },
                { rate: 28, desc: 'Luxury / Sin' }
              ].map(slab => (
                <button
                  key={slab.rate}
                  type="button"
                  className={`gst-slab-btn ${!isCustomGst && gstRate === slab.rate ? 'active' : ''}`}
                  onClick={() => handleGstSlab(slab.rate)}
                >
                  <span className="rate">{slab.rate}%</span>
                  <span className="desc">{slab.desc}</span>
                </button>
              ))}
            </div>

            <div className="custom-gst-row">
              <label htmlFor="customGstInput">Or Custom GST %:</label>
              <div className="input-with-symbol small-input">
                <span className="currency-symbol">%</span>
                <input
                  type="number"
                  id="customGstInput"
                  placeholder="Custom %"
                  min="0"
                  max="100"
                  step="0.1"
                  value={isCustomGst ? gstRate : ''}
                  onChange={handleCustomGstChange}
                />
              </div>
            </div>

            <div className="tax-type-selection">
              <span className="tax-type-label">Supply Type:</span>
              <div className="radio-pill-group">
                <label className="radio-pill">
                  <input
                    type="radio"
                    name="gstSupplyType"
                    value="intra"
                    checked={supplyType === 'intra'}
                    onChange={(e) => setGeneralState(prev => ({ ...prev, supplyType: e.target.value }))}
                  />
                  <span>Intra-State (CGST + SGST)</span>
                </label>
                <label className="radio-pill">
                  <input
                    type="radio"
                    name="gstSupplyType"
                    value="inter"
                    checked={supplyType === 'inter'}
                    onChange={(e) => setGeneralState(prev => ({ ...prev, supplyType: e.target.value }))}
                  />
                  <span>Inter-State (IGST)</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Results & Breakdown */}
        <section className="card result-card">
          <div className="result-header">
            <h2 className="card-title">
              <i className="fa-solid fa-receipt"></i> Calculation Summary
            </h2>
            <span className="status-live">
              <span className="pulse-dot"></span> Live
            </span>
          </div>

          <div className="grand-total-hero">
            <div className="total-caption">Final Net Payable Amount</div>
            <div className="total-amount-display">{formatINR(grandTotal)}</div>
            <div className="total-in-words">{inrToWords(grandTotal)}</div>
          </div>

          <div className="distribution-container">
            <div className="bar-labels">
              <span>Base: <b>{basePct}%</b></span>
              <span>Tax: <b>{gstPct}%</b></span>
              <span>Saved: <b>{savingPct}%</b></span>
            </div>
            <div className="distribution-bar">
              <div className="bar-segment bar-base" style={{ width: `${basePct}%` }}></div>
              <div className="bar-segment bar-gst" style={{ width: `${gstPct}%` }}></div>
            </div>
          </div>

          <div className="breakdown-table">
            <div className="breakdown-row">
              <span className="row-label">
                <i className="fa-solid fa-box"></i> Gross Subtotal ({quantity} unit{quantity > 1 ? 's' : ''})
              </span>
              <span className="row-value">{formatINR(grossSubtotal)}</span>
            </div>

            <div className="breakdown-row discount-row">
              <span className="row-label">
                <i className="fa-solid fa-tag"></i> Discount ({discountLabel})
                {discountAmount > 0 && <span className="badge-saving">You Save</span>}
              </span>
              <span className="row-value discount-val">- {formatINR(discountAmount)}</span>
            </div>

            <div className="breakdown-row subtotal-row">
              <span className="row-label"><strong>Net Taxable Value</strong></span>
              <span className="row-value"><strong>{formatINR(taxableValue)}</strong></span>
            </div>

            {gstRate === 0 || totalGstAmount === 0 ? (
              <div className="breakdown-row tax-row">
                <span className="row-label">GST (0% Exempt)</span>
                <span className="row-value">₹0.00</span>
              </div>
            ) : supplyType === 'intra' ? (
              <>
                <div className="breakdown-row tax-row">
                  <span className="row-label">↳ CGST ({halfRate}%)</span>
                  <span className="row-value">{formatINR(halfTax)}</span>
                </div>
                <div className="breakdown-row tax-row">
                  <span className="row-label">↳ SGST / UTGST ({halfRate}%)</span>
                  <span className="row-value">{formatINR(halfTax)}</span>
                </div>
              </>
            ) : (
              <div className="breakdown-row tax-row">
                <span className="row-label">↳ IGST Integrated ({gstRate}%)</span>
                <span className="row-value">{formatINR(totalGstAmount)}</span>
              </div>
            )}

            <div className="breakdown-row total-tax-row">
              <span className="row-label">
                <i className="fa-solid fa-file-invoice-dollar"></i> Total GST Tax Amount
              </span>
              <span className="row-value tax-val">+ {formatINR(totalGstAmount)}</span>
            </div>

            <div className="breakdown-divider"></div>

            <div className="breakdown-row grand-row">
              <span className="row-label">Grand Total</span>
              <span className="row-value">{formatINR(grandTotal)}</span>
            </div>
          </div>

          <div className="action-buttons-group">
            <button
              type="button"
              className="btn-action btn-primary"
              onClick={onCopySummary}
            >
              <i className="fa-solid fa-copy"></i> Copy Bill Summary
            </button>
            <button
              type="button"
              className="btn-action btn-secondary"
              onClick={onSaveHistory}
            >
              <i className="fa-solid fa-bookmark"></i> Save Calculation
            </button>
            <button
              type="button"
              className="btn-action btn-outline"
              onClick={onPrint}
            >
              <i className="fa-solid fa-print"></i> Print Receipt
            </button>
          </div>
        </section>
      </main>

      {/* History / Recent Calculations Card */}
      <section className="card history-card">
        <div className="history-header">
          <div className="history-title">
            <i className="fa-solid fa-clock-rotate-left"></i>
            <h3>Saved & Recent Calculations</h3>
            <span className="badge-count">{history.length}</span>
          </div>
          {history.length > 0 && (
            <button
              type="button"
              className="btn-link-danger"
              onClick={onClearHistory}
            >
              <i className="fa-solid fa-trash-can"></i> Clear History
            </button>
          )}
        </div>

        <div className="history-list">
          {history.length === 0 ? (
            <p className="empty-history-text">
              No saved calculations yet. Click <b>"Save Calculation"</b> above to save records.
            </p>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => onLoadHistory(item)}
              >
                <div className="history-item-top">
                  <span className="history-time">
                    <i className="fa-regular fa-clock"></i> {item.date}
                  </span>
                  <span className="history-total">{formatINR(item.grandTotal)}</span>
                </div>
                <div className="history-tags">
                  <span className="history-tag">Base: ₹{item.baseAmount.toLocaleString('en-IN')}</span>
                  <span className="history-tag">Disc: {item.discount}</span>
                  <span className="history-tag">GST: {item.gstRate}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
