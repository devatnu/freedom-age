import React, { useEffect, useRef, useState } from 'react';
import { A, C } from '../tokens.js';

// ─── TopHeader ────────────────────────────────────────────────────────────────
// Figma: Archive-v0 › node 214:1580
const HEADER_HEIGHT = 100; // pt-48 + pb-16 + 36px bar

export default function TopHeader() {
  const [visible, setVisible] = useState(true);
  const [blur, setBlur]       = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y   = window.scrollY;
      const dir = y > lastY.current ? 'down' : 'up';
      lastY.current = y;

      if (y <= 10) {
        // At top — show, no blur
        setVisible(true);
        setBlur(false);
      } else if (dir === 'down') {
        // Scrolling down — hide
        setVisible(false);
        setBlur(false);
      } else {
        // Scrolling up — show with blur
        setVisible(true);
        setBlur(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
    {/* Spacer to push content below the fixed header */}
    <div style={{ height: HEADER_HEIGHT }} />

    <div style={{
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '-100%'})`,
      transition: 'transform 0.25s ease, background-color 0.25s ease, backdrop-filter 0.25s ease',
      width: '100%',
      maxWidth: 480,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px 16px',
      boxSizing: 'border-box',
      backdropFilter:         blur ? 'blur(12px)' : 'none',
      WebkitBackdropFilter:   blur ? 'blur(12px)' : 'none',
      backgroundColor:        blur ? 'rgba(250,250,248,0.72)' : 'transparent',
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        width: '100%',
      }}>

        {/* Left — Product Logo */}
        {/* Product image */}
        <img
          src={A.headerGraphic}
          alt="Myra AI"
          style={{ height: 36, width: 'auto', display: 'block', flexShrink: 0 }}
        />

        {/* Right — CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        <a href="https://wa.me/917508631919" target="_blank" rel="noreferrer" style={{
          width: 32, height: 32,
          background: '#fff',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          textDecoration: 'none',
        }}>
          <img src={A.callIcon} alt="Call" style={{ width: 20, height: 20 }} />
        </a>

        {/* Right — More Tools CTA */}
        <a href="https://numyra.vercel.app/vision" target="_blank" rel="noreferrer" style={{
          height: 32,
          background: C.bgBase,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 8px 0 12px',
          flexShrink: 0,
          cursor: 'pointer',
          overflow: 'hidden',
          textDecoration: 'none',
        }}>
          <span style={{
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontWeight: 500,
            fontSize: 12,
            lineHeight: '12px',
            color: '#1a1a1a',
            whiteSpace: 'nowrap',
          }}>
            More tools
          </span>
          <img src={A.arrowIcon} alt="" style={{ width: 16, height: 16, display: 'block' }} />
        </a>
        </div>

      </div>
    </div>
    </>
  );
}
