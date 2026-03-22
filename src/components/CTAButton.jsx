import React from 'react';
import { G } from '../tokens.js';

// ─── CTAButton ────────────────────────────────────────────────────────────────
// Figma: Archive-v0 › node 214:1612
export default function CTAButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '16px 24px',
        borderRadius: 12,
        border: 'none',
        outline: disabled ? 'none' : `4px solid ${G.ctaBorder}`,
        outlineOffset: 0,
        background: disabled ? '#D1D5DB' : G.cta,
        color: disabled ? '#9CA3AF' : '#fff',
        fontFamily: "'Be Vietnam Pro', sans-serif",
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '16px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.18s',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </button>
  );
}
