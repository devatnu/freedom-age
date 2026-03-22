import React, { useState, useMemo, useRef, useEffect } from 'react';
import { A, C, G } from '../tokens.js';
import CTAButton from './CTAButton.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const bvp = () => `'Be Vietnam Pro', sans-serif`;
const dm  = () => `'DM Serif Display', serif`;

const RATE = 0.01;
const sipFV = (p, n) => (n <= 0 || p <= 0) ? 0 : p * ((Math.pow(1.01, n) - 1) / RATE) * 1.01;
export const findFreedomMonths = (monthly, target) => {
  if (monthly <= 0 || target <= 0) return Infinity;
  for (let n = 1; n <= 1200; n++) if (sipFV(monthly, n) >= target) return n;
  return Infinity;
};

const toIC = (n) => {
  const s = Math.round(n).toString();
  if (s.length <= 3) return s;
  const l = s.slice(-3), r = s.slice(0, -3);
  return r.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + l;
};
export const fFull = (n) => {
  if (!n || isNaN(n)) return '₹0';
  const a = Math.abs(n);
  if (a >= 1e7) return `₹${(n/1e7).toFixed(2).replace(/\.?0+$/,'')} Cr`;
  if (a >= 1e5) return `₹${(n/1e5).toFixed(2).replace(/\.?0+$/,'')} L`;
  return `₹${toIC(n)}`;
};
const fInput = (raw) => {
  const d = raw.replace(/[^0-9]/g, '');
  return d ? toIC(parseInt(d, 10)) : '';
};
const parseAmt = (s) => parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;

// ─── Quick Picks ──────────────────────────────────────────────────────────────
const CORPUS_CHIPS = [
  { label:'₹50L',   value:5e6  },
  { label:'₹1 Cr',  value:1e7  },
  { label:'₹2 Cr',  value:2e7  },
  { label:'₹5 Cr',  value:5e7  },
  { label:'₹10 Cr', value:1e8  },
  { label:'₹20 Cr', value:2e8  },
];
const SIP_CHIPS = [
  { label:'₹5,000',    value:5000   },
  { label:'₹10,000',   value:10000  },
  { label:'₹25,000',   value:25000  },
  { label:'₹50,000',   value:50000  },
  { label:'₹1,00,000', value:100000 },
];

// ─── Shared Primitives ────────────────────────────────────────────────────────
const Chip = ({ label, selected, onClick, large }) => (
  <button onClick={onClick} style={{
    height: large ? 44 : 32,
    minWidth: large ? 56 : 'auto',
    borderRadius: 32,
    padding: large ? '0 24px' : '0 16px',
    border: `1.5px solid ${selected ? 'transparent' : C.border}`,
    background: selected ? C.primary : '#fff',
    color: selected ? '#fff' : C.text,
    fontFamily: bvp(), fontSize: large ? 16 : 14, fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    transition: 'all 0.18s',
  }}>{label}</button>
);

const AmtInput = ({ value, onChange, placeholder }) => (
  <div style={{ position:'relative' }}>
    <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
      color:C.textSec, fontFamily:bvp(), fontSize:15, pointerEvents:'none' }}>₹</span>
    <input type="text" value={value} onChange={onChange} placeholder={placeholder} style={{
      width:'100%', height:48, borderRadius:12,
      border:`1px solid ${value ? C.primary : '#d9d9d9'}`,
      paddingLeft:30, paddingRight:14,
      fontFamily:bvp(), fontSize:15, color:C.text,
      background:'#fff', outline:'none',
      transition:'border-color 0.18s', fontVariantNumeric:'tabular-nums',
    }}/>
  </div>
);

const NudgeCard = ({ corpus }) => {
  const m = Math.round((corpus * 0.04) / 12);
  return (
    <div style={{ background:C.bgSection, borderLeft:`3px solid ${C.accent}`,
      borderRadius:'0 12px 12px 0', padding:'12px 16px' }}>
      <p style={{ fontFamily:bvp(), fontSize:13, color:C.textSec, lineHeight:'20px' }}>
        That's roughly{' '}
        <strong style={{ color:C.accent, fontVariantNumeric:'tabular-nums' }}>{fFull(m)}/month</strong>{' '}
        in passive income — forever.
      </p>
    </div>
  );
};

const CHIP_GAP = 12;
const AGES = Array.from({ length: 48 }, (_, i) => 18 + i);

const AgeCarousel = ({ age, onChange }) => {
  const scrollRef = useRef(null);
  const itemRefs  = useRef([]);
  const isScrolling = useRef(false);
  const timerRef  = useRef(null);

  // Scroll so that the chip for age `a` is centered in the container
  const scrollTo = (a, behavior = 'smooth') => {
    const container = scrollRef.current;
    const chip = itemRefs.current[a - 18];
    if (!container || !chip) return;
    const target = chip.offsetLeft + chip.offsetWidth / 2 - container.offsetWidth / 2;
    container.scrollTo({ left: target, behavior });
  };

  // On mount, jump to initial age instantly
  useEffect(() => { scrollTo(age, 'instant'); }, []);

  // When age changes from outside, scroll to it
  useEffect(() => {
    if (!isScrolling.current) scrollTo(age);
  }, [age]);

  const onScroll = () => {
    isScrolling.current = true;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const container = scrollRef.current;
      if (!container) return;
      const center = container.scrollLeft + container.offsetWidth / 2;
      let closest = 18, minDist = Infinity;
      itemRefs.current.forEach((chip, i) => {
        if (!chip) return;
        const chipCenter = chip.offsetLeft + chip.offsetWidth / 2;
        const d = Math.abs(chipCenter - center);
        if (d < minDist) { minDist = d; closest = 18 + i; }
      });
      onChange(closest);
      isScrolling.current = false;
    }, 80);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* fade edges */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:48, zIndex:1, pointerEvents:'none',
        background:'linear-gradient(to right, #FAFAF8, transparent)' }}/>
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:48, zIndex:1, pointerEvents:'none',
        background:'linear-gradient(to left, #FAFAF8, transparent)' }}/>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: CHIP_GAP,
          overflowX: 'scroll',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          paddingLeft: 'calc(50% - 54px)',
          paddingRight: 'calc(50% - 54px)',
          paddingTop: 4,
          paddingBottom: 4,
        }}
      >
        {AGES.map((a, i) => {
          const selected = a === age;
          const dist = Math.abs(a - age);
          return (
            <button
              key={a}
              ref={el => { itemRefs.current[i] = el; }}
              onClick={() => onChange(a)}
              style={{
                scrollSnapAlign: 'center',
                flexShrink: 0,
                height: 44,
                padding: selected ? '0 34px' : '0 10px',
                minWidth: selected ? 'auto' : 44,
                borderRadius: 32,
                border: `1.5px solid ${selected ? 'transparent' : C.border}`,
                background: selected ? C.primary : '#fff',
                color: selected ? '#fff' : C.text,
                fontFamily: bvp(), fontSize: 16, fontWeight: 600,
                cursor: 'pointer',
                opacity: dist === 0 ? 1 : 0.5,
                transition: 'opacity 0.15s, background 0.15s, padding 0.15s',
              }}
            >{a}</button>
          );
        })}
      </div>
    </div>
  );
};

const AndDivider = () => (
  <div style={{ display:'flex', alignItems:'center', gap:12, padding:'32px 0' }}>
    <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${C.primary})` }}/>
    <span style={{ fontFamily:bvp(), fontStyle:'italic', fontWeight:500,
      fontSize:12, color:C.textSec }}>AND</span>
    <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${C.primary})` }}/>
  </div>
);


// ─── Step label + divider ─────────────────────────────────────────────────────
const StepLabel = ({ step }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, paddingBottom:8 }}>
    <p style={{
      fontFamily:dm(), fontSize:20, lineHeight:'24px', textAlign:'center',
      background:G.cta, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
    }}>Step {step} of 3</p>
    <img src={A.divider} alt="" style={{ width:'100%', display:'block' }}/>
  </div>
);

// ─── Sticky CTA wrapper ───────────────────────────────────────────────────────
const StickyCTA = ({ children }) => (
  <div style={{
    position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
    width:'100%', maxWidth:480, zIndex:200,
    background:'linear-gradient(to bottom, transparent, #fff 40%)',
    padding:'32px 16px 20px',
    boxSizing:'border-box',
  }}>
    {children}
  </div>
);

// ─── Wizard Header ────────────────────────────────────────────────────────────
export const WizardHeader = ({ onBack }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'48px 16px 16px' }}>
    {/* Back */}
    <button onClick={onBack} style={{
      width:32, height:32, borderRadius:40,
      border:`1px solid ${C.border}`, background:C.bgSurface,
      cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink:0,
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 12L6 8L10 4" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
    {/* Call */}
    <a href="https://wa.me/917508631919" target="_blank" rel="noreferrer" style={{
      width:32, height:32, border:`1px solid ${C.border}`, borderRadius:8,
      background:C.bgSurface, display:'flex', alignItems:'center', justifyContent:'center',
      textDecoration:'none', flexShrink:0,
    }}>
      <img src={A.callIcon} alt="Call" style={{ width:20, height:20 }}/>
    </a>
  </div>
);

// ─── Step 1 ───────────────────────────────────────────────────────────────────
export const Step1 = ({ onNext }) => {
  const [selCorpus, setSelCorpus] = useState(null);
  const [custCorpus, setCustCorpus] = useState('');
  const [age, setAge] = useState(28);

  const corpus = selCorpus ?? parseAmt(custCorpus);
  const valid  = corpus > 0 && age >= 18 && age <= 65;

  // Show a window of 5 ages centred on selected


  return (
    <div style={{ paddingBottom:100 }}>
      <StepLabel step={1}/>

      {/* Corpus question */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'24px 0 0' }}>
        <p style={{ fontFamily:dm(), fontSize:20, color:'#1a1a1a', textAlign:'center', lineHeight:'28px' }}>
          How much money means freedom to you?
        </p>
        <div style={{ height:28, border:`1px solid ${C.border}`, borderRadius:16,
          background:'#fff', padding:'0 16px', display:'inline-flex', alignItems:'center' }}>
          <span style={{ fontFamily:bvp(), fontSize:12, fontWeight:500, color:C.textSec }}>Need help?</span>
        </div>
      </div>

      {/* Corpus chips */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', padding:'24px 0 0' }}>
        {CORPUS_CHIPS.map(c => (
          <Chip key={c.value} label={c.label} selected={selCorpus===c.value}
            onClick={() => { setSelCorpus(c.value); setCustCorpus(''); }}/>
        ))}
      </div>

      {/* Custom input */}
      <div style={{ paddingTop:24 }}>
        <AmtInput value={custCorpus} placeholder="Enter yourself"
          onChange={e => { setCustCorpus(fInput(e.target.value)); setSelCorpus(null); }}/>
        {corpus > 0 && <div style={{ marginTop:10 }}><NudgeCard corpus={corpus}/></div>}
      </div>

      <AndDivider/>

      {/* Age question */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:24 }}>
        <p style={{ fontFamily:dm(), fontSize:20, color:'#1a1a1a', textAlign:'center' }}>
          How old are you today?
        </p>
        {/* Age carousel — drag to select */}
        <AgeCarousel age={age} onChange={setAge}/>
      </div>

      <StickyCTA>
        <CTAButton onClick={() => valid && onNext({ corpus, age })} disabled={!valid}>
          Next
        </CTAButton>
      </StickyCTA>
    </div>
  );
};

// ─── Step 2 ───────────────────────────────────────────────────────────────────
export const Step2 = ({ onNext, onBack }) => {
  const [selSIP, setSelSIP] = useState(null);
  const [custSIP, setCustSIP] = useState('');

  const sip   = selSIP ?? parseAmt(custSIP);
  const valid  = sip > 0;

  return (
    <div style={{ paddingBottom:100 }}>
      <StepLabel step={2}/>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'24px 0 0' }}>
        <p style={{ fontFamily:dm(), fontSize:20, color:'#1a1a1a', textAlign:'center', lineHeight:'28px' }}>
          How much can you invest every month?
        </p>
        <p style={{ fontFamily:bvp(), fontSize:13, color:C.textSec, lineHeight:'20px', textAlign:'center' }}>
          Pick an amount you can commit to consistently.
        </p>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', padding:'24px 0' }}>
        {SIP_CHIPS.map(c => (
          <Chip key={c.value} label={c.label} selected={selSIP===c.value}
            onClick={() => { setSelSIP(c.value); setCustSIP(''); }}/>
        ))}
      </div>

      <AmtInput value={custSIP} placeholder="Or enter custom amount"
        onChange={e => { setCustSIP(fInput(e.target.value)); setSelSIP(null); }}/>

      <p style={{ fontFamily:bvp(), fontSize:11, color:C.textMuted, marginTop:10, lineHeight:'18px' }}>
        We assume 12% annualized return — typical of Indian flexi-cap funds over long periods.
      </p>

      <StickyCTA>
        <CTAButton onClick={() => valid && onNext(sip)} disabled={!valid}>
          Show My Freedom Age →
        </CTAButton>
      </StickyCTA>
    </div>
  );
};

// ─── Step 3 assets (decorative, from Figma) ───────────────────────────────────
const IMG_STAR_SM    = 'https://www.figma.com/api/mcp/asset/f9a3ec5c-5c6b-4122-8d07-ce07e7b97e62';
const IMG_DIAMOND    = 'https://www.figma.com/api/mcp/asset/e127d1e1-c5d9-4a16-b2c5-57b31d500e41';

// ─── Step 3 sub-components ────────────────────────────────────────────────────
const WhatIfRow3 = ({ label, sip, corpus, currentAge, selected, onClick }) => {
  const n      = findFreedomMonths(sip, corpus);
  const beyond = !isFinite(n);
  const age    = beyond ? null : currentAge + n / 12;
  return (
    <div onClick={onClick} style={{
      padding: '0 20px',
      height: 76,
      borderRadius: 12,
      border: `1.5px solid ${selected ? C.primary : C.border}`,
      background: selected ? 'rgba(26,107,79,0.04)' : C.bgSurface,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      cursor: 'pointer',
    }}>
      {/* Left */}
      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
        <span style={{ fontFamily:bvp(), fontSize:11,
          color: selected ? C.primary : C.textMuted,
          fontWeight: selected ? 600 : 400 }}>{label}</span>
        <span style={{ fontFamily:bvp(), fontSize:17, fontWeight:700, color:C.text, fontVariantNumeric:'tabular-nums' }}>
          {fFull(sip)}<span style={{ fontSize:12, fontWeight:400, color:C.textSec }}>/mo</span>
        </span>
      </div>
      {/* Right */}
      <div style={{ textAlign:'right' }}>
        {beyond
          ? <span style={{ fontFamily:bvp(), fontSize:12, color:C.textMuted }}>Beyond 100</span>
          : <>
              <div style={{ fontFamily:dm(), fontSize:26, lineHeight:'26px',
                color: selected ? C.primary : C.text }}>Age {Math.ceil(age)}</div>
              <div style={{ fontFamily:bvp(), fontSize:11, color:C.textMuted, marginTop:2 }}>
                {(n/12).toFixed(1)} yrs away
              </div>
            </>
        }
      </div>
    </div>
  );
};

// ─── Step 3 ───────────────────────────────────────────────────────────────────
export const Step3 = ({ corpus, currentAge, monthly, onReset }) => {
  const [selectedF, setSelectedF] = useState(1.0);
  const activeSip = Math.round(monthly * selectedF);

  const freedomN  = useMemo(() => findFreedomMonths(activeSip, corpus), [activeSip, corpus]);
  const isBeyond  = !isFinite(freedomN);
  const fAge      = isBeyond ? null : currentAge + freedomN / 12;
  const yrsAway   = isBeyond ? null : (freedomN / 12).toFixed(1);
  const fDate     = isBeyond ? null : (() => {
    const d = new Date(); d.setMonth(d.getMonth() + freedomN);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  })();
  const totalInv  = isBeyond ? 0 : activeSip * freedomN;
  const totalCorp = isBeyond ? 0 : sipFV(activeSip, freedomN);
  const totalRet  = totalCorp - totalInv;

  const chartData = useMemo(() => {
    if (isBeyond) return [];
    const now = new Date();
    return [1, 2, 3, 4].map(i => {
      const n = Math.round((freedomN / 4) * i);
      const d = new Date(now); d.setMonth(d.getMonth() + n);
      const invested = Math.round(activeSip * n);
      const returns  = Math.round(sipFV(activeSip, n) - invested);
      return { year: d.getFullYear(), invested, returns };
    });
  }, [activeSip, freedomN, isBeyond]);

  if (isBeyond) return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:14, padding:22, marginBottom:24 }}>
        <p style={{ fontFamily:dm(), fontSize:20, color:C.text, marginBottom:8 }}>
          Freedom needs a bigger commitment.
        </p>
        <p style={{ fontFamily:bvp(), fontSize:14, color:C.textSec, lineHeight:'1.65' }}>
          With {fFull(monthly)}/month, freedom age would exceed 100. Consider increasing your SIP.
        </p>
      </div>
      <CTAButton onClick={onReset}>Change My Inputs</CTAButton>
    </div>
  );

  // Ratio bar widths
  const invRatio = totalInv / (totalInv + totalRet);

  const whatIf = [
    { label:'−25% (conservative)', f:0.75 },
    { label:'Your plan',           f:1.00 },
    { label:'+25% (ambitious)',    f:1.25 },
    { label:'+50% (aggressive)',   f:1.50 },
  ];

  return (
    <div style={{ paddingBottom: 100 }}>

      {/* ── "Your freedom age is" label ── */}
      <p style={{ fontFamily:dm(), fontSize:20, color:C.textSec, textAlign:'center', lineHeight:'24px', paddingTop:16 }}>
        Your freedom age is
      </p>

      {/* ── Age + laurels ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, paddingTop:32 }}>
        <img src="/assets/grains-left.svg" alt="" style={{ width:56, height:56, objectFit:'contain' }}/>
        <span style={{
          fontFamily:dm(), fontSize:56, lineHeight:'56px',
          background: G.green,
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>{Math.ceil(fAge)}</span>
        <img src="/assets/grains-right.svg" alt="" style={{ width:56, height:56, objectFit:'contain' }}/>
      </div>

      {/* ── Years away + date ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, paddingTop:24 }}>
        <span style={{ fontFamily:bvp(), fontSize:12, fontStyle:'italic', color:C.text }}>{yrsAway} years</span>
        <img src={IMG_STAR_SM} alt="" style={{ width:12, height:12 }}/>
        <span style={{ fontFamily:bvp(), fontSize:12, fontStyle:'italic', color:C.textSec }}>{fDate}</span>
      </div>

      <div style={{ paddingTop:28 }}>
        <img src="/assets/wealth-journey-tag.svg" alt="Your Wealth Journey" style={{ display:'block', width:'100%', height:'auto' }}/>
      </div>

      {/* ── "YOUR WEALTH JOURNEY" banner + "YOU WILL HAVE" corpus + date ── */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, paddingTop:24 }}>
        <span style={{ fontFamily:bvp(), fontSize:10, color:C.textMuted, letterSpacing:'0.08em' }}>
          YOU WILL HAVE
        </span>
        <span style={{
          fontFamily:dm(), fontSize:40, lineHeight:'40px',
          background: G.green,
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>{fFull(totalCorp)}</span>
        <span style={{ fontFamily:bvp(), fontSize:12, fontStyle:'italic', color:C.textSec }}>
          by {fDate}
        </span>
      </div>

      {/* ── Combined card: distribution + bar chart ── */}
      <div style={{ background:C.bgSurface, border:`1px solid ${C.border}`, borderRadius:16,
        marginTop:16, overflow:'hidden' }}>

        {/* Distribution strip */}
        <div style={{ background:C.bgSection, margin:12, borderRadius:8, padding:'12px 12px 10px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              <span style={{ fontFamily:bvp(), fontSize:12, fontStyle:'italic', color:C.textSec }}>Total Invested</span>
              <span style={{ fontFamily:bvp(), fontSize:14, fontWeight:700, color:C.accent, fontVariantNumeric:'tabular-nums' }}>
                {fFull(totalInv)}
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:2, alignItems:'flex-end' }}>
              <span style={{ fontFamily:bvp(), fontSize:12, fontStyle:'italic', color:C.textSec }}>Returns Earned</span>
              <span style={{ fontFamily:bvp(), fontSize:14, fontWeight:700, color:C.primary, fontVariantNumeric:'tabular-nums' }}>
                {fFull(totalRet)}
              </span>
            </div>
          </div>
          <div style={{ display:'flex', gap:4, borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:24, background:'#D4863A', width:`${invRatio * 100}%`, flexShrink:0 }}/>
            <div style={{ height:24, background:'#22896A', flex:1 }}/>
          </div>
        </div>

        {/* Custom bar chart */}
        {(() => {
          const MAX_H = 160;
          const maxCorpus = Math.max(...chartData.map(d => d.invested + d.returns), 1);
          return (
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-around',
              height: MAX_H + 32, padding:'0 16px 0' }}>
              {chartData.map((d, i) => {
                const corpus = d.invested + d.returns;
                const totalH = Math.max(Math.round((corpus / maxCorpus) * MAX_H), 12);
                const retH   = Math.round((d.returns / corpus) * totalH);
                const invH   = totalH - retH;
                return (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                    <div style={{ width:33, height:totalH, borderRadius:'4px 4px 0 0',
                      overflow:'hidden', position:'relative', flexShrink:0 }}>
                      {/* Returns — green, top */}
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:retH,
                        background:'linear-gradient(to bottom, rgba(26,107,79,0.4), rgba(26,107,79,0.1))' }}>
                      </div>
                      {/* Invested — amber, bottom */}
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:invH,
                        background:'linear-gradient(to bottom, rgba(194,113,46,0.4), rgba(194,113,46,0.1))' }}/>
                    </div>
                    <span style={{ fontFamily:bvp(), fontSize:10, color:C.textSec, paddingBottom:12 }}>
                      {d.year}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ── Diamond divider ── */}
      <div style={{ display:'flex', alignItems:'center', gap:4, paddingTop:24 }}>
        <div style={{ flex:1, height:1, background:`linear-gradient(to left, ${C.accent}, transparent)` }}/>
        <img src={IMG_DIAMOND} alt="" style={{ width:20, height:20, flexShrink:0 }}/>
        <div style={{ flex:1, height:1, background:`linear-gradient(to right, ${C.accent}, transparent)` }}/>
      </div>

      {/* ── What if section ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'center', paddingTop:24 }}>
        <p style={{ fontFamily:dm(), fontSize:20, color:C.text, textAlign:'center', width:'100%' }}>
          What if you invested more?
        </p>
        <p style={{ fontFamily:bvp(), fontSize:12, fontStyle:'italic', color:C.textSec, textAlign:'center', lineHeight:'16px' }}>
          See how your Freedom Age shifts with different monthly amounts.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%' }}>
          {whatIf.map(({ label, f }) => (
            <WhatIfRow3 key={f} label={label} sip={Math.round(monthly * f)}
              corpus={corpus} currentAge={currentAge}
              selected={selectedF === f} onClick={() => setSelectedF(f)}/>
          ))}
        </div>
      </div>

      {/* ── Change inputs button ── */}
      <button onClick={onReset} style={{
        width:'100%', height:48, borderRadius:12, marginTop:24,
        border:`1px solid ${C.primary}`, background:'transparent',
        fontFamily:bvp(), fontSize:16, fontWeight:500, color:C.text,
        cursor:'pointer',
      }}>Change My Inputs</button>

      <p style={{ fontFamily:bvp(), fontSize:10, color:C.textMuted, lineHeight:'1.7', textAlign:'center', marginTop:16 }}>
        Projections assume 12% annualized returns compounded monthly. Actual returns may vary.
        Past performance does not guarantee future results. This is not financial advice.
      </p>
    </div>
  );
};
