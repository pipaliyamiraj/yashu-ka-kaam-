import React from 'react';
import { formatINR, inrToWords, escapeHtml } from '../utils/helpers';

export default function PrintTemplates({
  activePrintType, // 'general' | 'restaurant'
  generalState,
  generalCalc,
  restState,
  restCalc
}) {
  const currentDate = new Date().toLocaleDateString('en-IN');

  // -------------------------------------------------------------
  // General GST Printable Invoice
  // -------------------------------------------------------------
  if (activePrintType === 'general' && generalCalc) {
    return (
      <div id="printArea" className="print-only">
        <div className="print-header">
          <h2>TAX INVOICE</h2>
          <p className="print-date">Date: {currentDate}</p>
        </div>
        <div className="print-table-wrapper">
          <table className="print-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Base Unit Price ({generalCalc.qty} Unit/s)</td>
                <td>{formatINR(generalState.baseAmount * generalCalc.qty)}</td>
              </tr>
              <tr>
                <td>Discount Applied ({generalCalc.discountLabel})</td>
                <td>- {formatINR(generalCalc.discountAmount)}</td>
              </tr>
              <tr>
                <td><strong>Net Taxable Value</strong></td>
                <td><strong>{formatINR(generalCalc.taxableValue)}</strong></td>
              </tr>
              {generalState.supplyType === 'intra' ? (
                <>
                  <tr>
                    <td>CGST ({generalCalc.halfRate}%)</td>
                    <td>{formatINR(generalCalc.halfTax)}</td>
                  </tr>
                  <tr>
                    <td>SGST ({generalCalc.halfRate}%)</td>
                    <td>{formatINR(generalCalc.halfTax)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td>IGST ({generalCalc.gstRate}%)</td>
                  <td>{formatINR(generalCalc.totalGstAmount)}</td>
                </tr>
              )}
              <tr>
                <td>Total GST Tax</td>
                <td>+ {formatINR(generalCalc.totalGstAmount)}</td>
              </tr>
              <tr className="print-grand-row">
                <td>FINAL GRAND TOTAL</td>
                <td>{formatINR(generalCalc.grandTotal)}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ fontSize: 11, color: '#000000', textAlign: 'center' }}>
                  In Words: <em>{inrToWords(Math.round(generalCalc.grandTotal))}</em>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Restaurant Printable Invoices
  // -------------------------------------------------------------
  if (activePrintType === 'restaurant' && restCalc && restState) {
    const format = restState.receiptFormat || 'thermal80';

    let displayDate = restState.date;
    if (restState.date && restState.date.includes('-')) {
      const [y, m, d] = restState.date.split('-');
      if (y && m && d) displayDate = `${d}/${m}/${y}`;
    }

    let displayTime = restState.time || '';
    if (displayTime && displayTime.includes(':')) {
      const [hrs, mins] = displayTime.split(':');
      const h = parseInt(hrs, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedH = h % 12 || 12;
      displayTime = `${String(formattedH).padStart(2, '0')}:${mins} ${ampm}`;
    }

    const billNum = restState.billNo.startsWith('#') ? restState.billNo : `#${restState.billNo}`;

    return (
      <div id="printRestArea" className="print-only">
        {/* FORMAT 1: THERMAL 80MM */}
        {format === 'thermal80' && (
          <div className="rest-print-thermal">
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: 8, marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' }}>{restState.name}</h3>
              <p style={{ margin: '2px 0', fontSize: 11 }}>{restState.address}</p>
              {restState.phone && <p style={{ margin: '2px 0', fontSize: 11 }}>Ph: {restState.phone}</p>}
              <p style={{ margin: '2px 0', fontSize: 11, fontWeight: 'bold' }}>GSTIN: {restState.gstin}</p>
              {restState.fssai && <p style={{ margin: '1px 0', fontSize: 11 }}>FSSAI Lic: {restState.fssai}</p>}
            </div>

            <div style={{ fontSize: 11, marginBottom: 8, borderBottom: '1px dashed #000', paddingBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date: {displayDate}</span>
                <span>Time: {displayTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bill No: {billNum}</span>
                <span>Type: {restState.orderType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Table: {restState.tableNo}</span>
                <span>Server: {restState.serverName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Customer: {restState.customer}</span>
                <span>Pay: {restState.paymentMode}</span>
              </div>
            </div>

            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', marginBottom: 8 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '3px 0' }}>ITEM</th>
                  <th style={{ textAlign: 'center', padding: '3px 0' }}>QTY</th>
                  <th style={{ textAlign: 'right', padding: '3px 0' }}>RATE</th>
                  <th style={{ textAlign: 'right', padding: '3px 0' }}>AMT</th>
                </tr>
              </thead>
              <tbody>
                {restState.items.map(item => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'left', padding: '2px 0' }}>{item.name || 'Item'}</td>
                    <td style={{ textAlign: 'center', padding: '2px 0' }}>{item.qty}</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>{item.price.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>{(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: '1px dashed #000', paddingTop: 6, fontSize: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal ({restCalc.totalItemUnits} items):</span>
                <span>{formatINR(restCalc.foodSubtotal)}</span>
              </div>
              {restCalc.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Discount ({restCalc.discountLabel}):</span>
                  <span>- {formatINR(restCalc.discountAmount)}</span>
                </div>
              )}
              {restCalc.serviceChargeAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Service Charge ({restCalc.serviceChargeLabel}):</span>
                  <span>+ {formatINR(restCalc.serviceChargeAmount)}</span>
                </div>
              )}
              {restCalc.packagingAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Packaging / Parcel:</span>
                  <span>+ {formatINR(restCalc.packagingAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px dotted #000', borderBottom: '1px dotted #000', padding: '2px 0', margin: '2px 0' }}>
                <span>Net Taxable Value:</span>
                <span>{formatINR(restCalc.taxableValue)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>CGST ({restCalc.halfGstRate}%):</span>
                <span>+ {formatINR(restCalc.cgstAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SGST ({restCalc.halfGstRate}%):</span>
                <span>+ {formatINR(restCalc.sgstAmount)}</span>
              </div>
              {restCalc.tipAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tip / Gratuity:</span>
                  <span>+ {formatINR(restCalc.tipAmount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 'bold', borderTop: '2px solid #000', borderBottom: '2px solid #000', margin: '6px 0', padding: '4px 0' }}>
                <span>GRAND TOTAL:</span>
                <span>{formatINR(restCalc.grandTotal)}</span>
              </div>
              <div style={{ fontSize: 10, fontStyle: 'italic', textAlign: 'center', marginTop: 4 }}>
                {inrToWords(restCalc.grandTotal)}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, borderTop: '1px dashed #000', paddingTop: 6 }}>
              <p style={{ margin: '2px 0' }}>{restState.footerNote || 'Thank You! Visit Again!'}</p>
              <p style={{ margin: '2px 0', fontSize: 9 }}>GST INVOICE • POWERED BY SMART BILLING</p>
            </div>
          </div>
        )}

        {/* FORMAT 2: FORMAL A4 GST TAX INVOICE */}
        {format === 'formalA4' && (
          <div className="rest-print-a4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, textTransform: 'uppercase' }}>{restState.name}</h2>
                <p style={{ margin: '3px 0', fontSize: 12 }}>{restState.address}</p>
                {restState.phone && <p style={{ margin: '2px 0', fontSize: 11 }}>Ph: {restState.phone}</p>}
                <p style={{ margin: '3px 0', fontSize: 12 }}>
                  <strong>GSTIN:</strong> {restState.gstin} &nbsp;|&nbsp; <strong>State:</strong> {restState.gstin ? restState.gstin.substring(0, 2) : '27'}
                </p>
                {restState.fssai && <p style={{ margin: '1px 0', fontSize: 11 }}>FSSAI Lic: {restState.fssai}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-block', border: '1.5px solid #000', padding: '4px 10px', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>
                  TAX INVOICE
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: 11, fontStyle: 'italic' }}>Original for Recipient</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #000', marginBottom: 14, fontSize: 12 }}>
              <div style={{ padding: '8px 12px', borderRight: '1px solid #000' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px dashed #000', paddingBottom: 3, marginBottom: 5 }}>
                  BILLED TO / CUSTOMER DETAILS:
                </div>
                <div><strong>Customer Name:</strong> {restState.customer}</div>
                <div><strong>Order Type:</strong> {restState.orderType}</div>
                <div><strong>Table / Token:</strong> {restState.tableNo}</div>
                <div><strong>Payment Method:</strong> {restState.paymentMode}</div>
              </div>
              <div style={{ padding: '8px 12px' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px dashed #000', paddingBottom: 3, marginBottom: 5 }}>
                  INVOICE DETAILS:
                </div>
                <div><strong>Invoice No:</strong> {billNum}</div>
                <div><strong>Date:</strong> {displayDate} &nbsp;&nbsp; <strong>Time:</strong> {displayTime}</div>
                <div><strong>Steward / Server:</strong> {restState.serverName}</div>
                <div><strong>Service Category:</strong> Restaurant Service (SAC 9963)</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: 14, fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#e5e7eb', borderBottom: '1.5px solid #000' }}>
                  <th style={{ border: '1px solid #000', padding: 6, width: 35, textAlign: 'center' }}>#</th>
                  <th style={{ border: '1px solid #000', padding: 6, textAlign: 'left' }}>Item Description & Specifications</th>
                  <th style={{ border: '1px solid #000', padding: 6, width: 70, textAlign: 'center' }}>HSN/SAC</th>
                  <th style={{ border: '1px solid #000', padding: 6, width: 45, textAlign: 'center' }}>Qty</th>
                  <th style={{ border: '1px solid #000', padding: 6, width: 80, textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ border: '1px solid #000', padding: 6, width: 90, textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {restState.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ border: '1px solid #000', padding: 6, textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #000', padding: 6, textAlign: 'left', fontWeight: 'bold' }}>{item.name || 'Food Item'}</td>
                    <td style={{ border: '1px solid #000', padding: 6, textAlign: 'center' }}>9963</td>
                    <td style={{ border: '1px solid #000', padding: 6, textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ border: '1px solid #000', padding: 6, textAlign: 'right' }}>{item.price.toFixed(2)}</td>
                    <td style={{ border: '1px solid #000', padding: 6, textAlign: 'right' }}>{(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div style={{ border: '1px solid #000', padding: 8 }}>
                <div style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 6, borderBottom: '1px solid #000', paddingBottom: 3 }}>
                  GST TAX COMPUTATION (SAC 9963)
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                      <th style={{ textAlign: 'left', padding: 3 }}>Tax Slab</th>
                      <th style={{ textAlign: 'right', padding: 3 }}>Taxable</th>
                      <th style={{ textAlign: 'right', padding: 3 }}>CGST</th>
                      <th style={{ textAlign: 'right', padding: 3 }}>SGST</th>
                      <th style={{ textAlign: 'right', padding: 3 }}>Total Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 3px' }}>GST {restCalc.gstRate}%</td>
                      <td style={{ textAlign: 'right', padding: '4px 3px' }}>{formatINR(restCalc.taxableValue)}</td>
                      <td style={{ textAlign: 'right', padding: '4px 3px' }}>{formatINR(restCalc.cgstAmount)}</td>
                      <td style={{ textAlign: 'right', padding: '4px 3px' }}>{formatINR(restCalc.sgstAmount)}</td>
                      <td style={{ textAlign: 'right', padding: '4px 3px', fontWeight: 'bold' }}>{formatINR(restCalc.totalGst)}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ fontSize: 10, marginTop: 10, color: '#000' }}>
                  <strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
                </div>
              </div>

              <div style={{ border: '1px solid #000', padding: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>Gross Subtotal:</span><span>{formatINR(restCalc.foodSubtotal)}</span>
                </div>
                {restCalc.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Discount ({restCalc.discountLabel}):</span><span>- {formatINR(restCalc.discountAmount)}</span>
                  </div>
                )}
                {restCalc.serviceChargeAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Service Charge ({restCalc.serviceChargeLabel}):</span><span>+ {formatINR(restCalc.serviceChargeAmount)}</span>
                  </div>
                )}
                {restCalc.packagingAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Packaging / Parcel Fee:</span><span>+ {formatINR(restCalc.packagingAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontWeight: 'bold', borderTop: '1px solid #000', borderBottom: '1px solid #000', margin: '3px 0' }}>
                  <span>Taxable Value:</span><span>{formatINR(restCalc.taxableValue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>CGST ({restCalc.halfGstRate}%):</span><span>+ {formatINR(restCalc.cgstAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>SGST ({restCalc.halfGstRate}%):</span><span>+ {formatINR(restCalc.sgstAmount)}</span>
                </div>
                {restCalc.tipAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Tip / Gratuity:</span><span>+ {formatINR(restCalc.tipAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, fontWeight: 900, borderTop: '2px solid #000', marginTop: 4 }}>
                  <span>FINAL TOTAL (₹):</span><span>{formatINR(restCalc.grandTotal)}</span>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #000', padding: '8px 12px', marginBottom: 14, fontSize: 12 }}>
              <strong>Amount Chargeable (in words):</strong> <em>{inrToWords(restCalc.grandTotal)}</em>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 10 }}>
              <div style={{ fontSize: 11 }}>
                <p style={{ margin: 0 }}>{restState.footerNote || 'Thank You! Visit Again!'}</p>
                <p style={{ margin: '3px 0 0 0', fontSize: 10 }}>Subject to local jurisdiction. Computer Generated GST Invoice.</p>
              </div>
              <div style={{ textAlign: 'center', width: 220, borderTop: '1px solid #000', paddingTop: 5, fontSize: 11 }}>
                <strong>For {restState.name}</strong><br />
                <span style={{ fontSize: 10 }}>Authorised Signatory</span>
              </div>
            </div>
          </div>
        )}

        {/* FORMAT 3: KITCHEN ORDER TICKET (KOT) */}
        {format === 'kot' && (
          <div className="rest-print-kot">
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>KITCHEN ORDER TICKET (KOT)</h2>
              <p style={{ margin: '2px 0', fontSize: 12, fontWeight: 'bold' }}>{restState.name}</p>
            </div>

            <div style={{ border: '2px solid #000', padding: '6px 10px', textAlign: 'center', fontSize: 15, fontWeight: 900, marginBottom: 10 }}>
              {restState.tableNo ? restState.tableNo.toUpperCase() : 'TABLE'} &nbsp;•&nbsp; {restState.orderType.toUpperCase()}
            </div>

            <div style={{ fontSize: 12, borderBottom: '1.5px dashed #000', paddingBottom: 6, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>KOT / Bill: <strong>{billNum}</strong></span>
                <span>Date: <strong>{displayDate}</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Time: <strong>{displayTime}</strong></span>
                <span>Steward: <strong>{restState.serverName}</strong></span>
              </div>
              <div>Customer: <strong>{restState.customer}</strong></div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '4px 0', width: 30 }}>[✓]</th>
                  <th style={{ textAlign: 'left', padding: '4px 0' }}>Item Ordered</th>
                  <th style={{ textAlign: 'right', padding: '4px 0', width: 60 }}>Qty</th>
                </tr>
              </thead>
              <tbody>
                {restState.items.map(it => (
                  <tr key={it.id} style={{ borderBottom: '1px dashed #000' }}>
                    <td style={{ padding: '6px 0', fontSize: 13 }}>[ &nbsp; ]</td>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', fontSize: 13 }}>{it.name || 'Food Item'}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0', fontSize: 15, fontWeight: 900 }}>{it.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: '1.5px solid #000', paddingTop: 8, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Dishes: <strong>{restState.items.length}</strong></span>
              <span>Total Qty: <strong>{restCalc.totalItemUnits}</strong></span>
            </div>

            <div style={{ borderTop: '1px dashed #000', marginTop: 14, paddingTop: 8, fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
              <span>Chef: ______________</span>
              <span>Time Out: ___________</span>
            </div>
          </div>
        )}

        {/* FORMAT 4: MINI 58MM SLIP */}
        {format === 'mini58' && (
          <div className="rest-print-mini">
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: 4, marginBottom: 4 }}>
              <div style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase' }}>{restState.name}</div>
              {restState.phone && <div style={{ fontSize: 10 }}>Ph: {restState.phone}</div>}
              <div style={{ fontSize: 10 }}>GSTIN: {restState.gstin}</div>
            </div>

            <div style={{ fontSize: 10, borderBottom: '1px dashed #000', paddingBottom: 4, marginBottom: 4 }}>
              <div>{displayDate} {displayTime}</div>
              <div>{billNum} | {restState.tableNo} | {restState.orderType}</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, marginBottom: 4 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '2px 0' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '2px 0' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '2px 0' }}>Amt</th>
                </tr>
              </thead>
              <tbody>
                {restState.items.map(it => (
                  <tr key={it.id}>
                    <td style={{ textAlign: 'left', padding: '2px 0' }}>{it.name || 'Item'}</td>
                    <td style={{ textAlign: 'center', padding: '2px 0' }}>{it.qty}</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>{(it.qty * it.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: '1px dashed #000', paddingTop: 4, fontSize: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>{formatINR(restCalc.foodSubtotal)}</span>
              </div>
              {restCalc.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Disc:</span>
                  <span>- {formatINR(restCalc.discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax ({restCalc.gstRate}%):</span>
                <span>+ {formatINR(restCalc.totalGst)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 900, borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '3px 0', marginTop: 2 }}>
                <span>TOTAL:</span>
                <span>{formatINR(restCalc.grandTotal)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 6, fontSize: 9, borderTop: '1px dashed #000', paddingTop: 4 }}>
              <div>{restState.footerNote || 'Thank You! Visit Again!'}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
