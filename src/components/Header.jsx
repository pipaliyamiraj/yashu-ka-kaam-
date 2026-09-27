import React from 'react';

export default function Header({ theme, onToggleTheme, onResetAll }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="logo-icon">
          <i className="fa-solid fa-indian-rupee-sign"></i>
        </div>
        <div>
          <h1>Smart GST, Discount & Restaurant Billing</h1>
          <p className="subtitle">Indian Rupee (₹ INR) Tax Estimator & Food Invoice POS</p>
        </div>
      </div>
      <div className="header-actions">
        <button 
          type="button" 
          onClick={onToggleTheme} 
          className="btn-icon" 
          title="Toggle Dark/Light Mode" 
          aria-label="Toggle Theme"
        >
          <i className={theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
        </button>
        <button 
          type="button" 
          onClick={onResetAll} 
          className="btn-outline-sm" 
          title="Clear and reset form"
        >
          <i className="fa-solid fa-arrows-rotate"></i> Reset
        </button>
      </div>
    </header>
  );
}
