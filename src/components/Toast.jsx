import React from 'react';

export default function Toast({ message, isError, visible }) {
  return (
    <div
      id="toastMessage"
      className={`toast ${visible ? 'show' : ''}`}
      style={{ background: isError ? '#f43f5e' : '#10b981' }}
    >
      <i className={`fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-check-circle'}`}></i>{' '}
      <span>{message}</span>
    </div>
  );
}
