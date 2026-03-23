// FreedomAge.jsx — Redesigned to match Figma
import React, { useState, useRef } from 'react';
import TopHeader from './components/TopHeader.jsx';
import CTAButton from './components/CTAButton.jsx';
import { WizardHeader, Step1, Step2, Step3 } from './components/WizardSteps.jsx';
import { A, C, G } from './tokens.js';
import learnArticles from './data/learnArticles.json';
import faqs from './data/faqs.json';



// ─── Shared Primitives ────────────────────────────────────────────────────────
const bvp = () => `'Be Vietnam Pro', sans-serif`;

// ─── Gradient Text ────────────────────────────────────────────────────────────
const GradText = ({ gradient, children, style = {} }) => (
  <span style={{
    background: gradient, WebkitBackgroundClip:'text',
    WebkitTextFillColor:'transparent', backgroundClip:'text',
    display:'inline', ...style,
  }}>{children}</span>
);

// ─── Section Header (DM Serif split) ─────────────────────────────────────────
const SectionHead = ({ plain, gradient: grad }) => (
  <div style={{ display:'flex', gap:6, alignItems:'baseline', justifyContent:'center',
    fontFamily:"'DM Serif Display', serif", fontSize:20, color:C.text }}>
    <span>{plain}</span>
    <GradText gradient={G.amber}>{grad}</GradText>
  </div>
);

// ─── Play Button ─────────────────────────────────────────────────────────────
const PlayBtn = () => (
  <img src={A.playIcon} alt="Play" style={{ width:28, height:28, flexShrink:0 }}/>
);

// ─── Full-Page Video Player ────────────────────────────────────────────────────
const VideoPlayer = ({ youtubeId, onClose }) => (
  <div style={{
    position:'fixed', inset:0, zIndex:400,
    background:'#000',
    display:'flex', flexDirection:'column',
  }}>
    {/* Close button */}
    <div style={{ display:'flex', justifyContent:'flex-end', padding:'48px 16px 12px' }}>
      <button onClick={onClose} style={{
        width:36, height:36, borderRadius:'50%',
        background:'rgba(255,255,255,0.15)', border:'none',
        color:'#fff', fontSize:20, lineHeight:'36px', textAlign:'center',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
      }}>✕</button>
    </div>
    {/* Video */}
    <div style={{ flex:1, display:'flex', alignItems:'center' }}>
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{ width:'100%', height:'100%', border:'none', display:'block' }}
      />
    </div>
  </div>
);

// ─── Video Card ───────────────────────────────────────────────────────────────
const VideoCard = ({ creator, title, thumbnail, youtubeId, onPlay }) => (
  <div style={{ flex:1, borderRadius:16, border:`1px solid ${C.border}`,
    overflow:'hidden', background:'linear-gradient(180deg,rgba(26,107,79,0)0%,rgba(26,107,79,0.2)100%)' }}>
    <div style={{ padding:'12px 12px 10px', display:'flex', flexDirection:'column', gap:8 }}>
      <div>
        <GradText gradient={G.amber} style={{ fontFamily:bvp(), fontSize:10, fontWeight:500, fontStyle:'italic' }}>
          {creator}
        </GradText>
        <p style={{ fontFamily:bvp(), fontSize:12, fontWeight:500, color:C.text,
          lineHeight:'16px', height:32, overflow:'hidden', marginTop:2 }}>{title}</p>
      </div>
      <PlayBtn />
    </div>
    <div onClick={onPlay} style={{ aspectRatio:'4/3', overflow:'hidden', cursor:'pointer' }}>
      <img src={thumbnail} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
    </div>
  </div>
);

// ─── Article Card ─────────────────────────────────────────────────────────────
const ArticleCard = ({ image, logoInitial, logoBgColor, source, date, title, excerpt, link }) => (
  <div style={{ background:C.bgSurface, border:`1px solid ${C.borderSub}`,
    borderRadius:16, padding:4, boxShadow:'0 4px 12px rgba(0,0,0,0.04)', flexShrink:0, width:220 }}>
    {/* Image */}
    {image
      ? <img src={image} alt={title} style={{ width:'100%', height:104, objectFit:'cover', borderRadius:12, display:'block' }}/>
      : <div style={{ width:'100%', height:104, borderRadius:12, background:logoBgColor,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:bvp(), fontSize:28, fontWeight:700, color:'#fff' }}>{logoInitial}</span>
        </div>
    }
    <div style={{ padding:'8px', display:'flex', flexDirection:'column', gap:8 }}>
      {/* Header — source + date */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:16, height:16, borderRadius:4, background:logoBgColor,
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontFamily:bvp(), fontSize:7, fontWeight:700, color:'#fff' }}>{logoInitial}</span>
        </div>
        <span style={{ fontFamily:bvp(), fontSize:11, color:C.textMuted }}>{source}</span>
        <span style={{ width:5, height:5, borderRadius:'50%', background:C.textMuted, opacity:0.4 }} />
        <span style={{ fontFamily:bvp(), fontSize:10, color:C.textMuted }}>{date}</span>
      </div>
      {/* Title — max 2 lines */}
      <p style={{ fontFamily:bvp(), fontSize:13, fontWeight:500, color:'#111', lineHeight:'16px',
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{title}</p>
      {/* Description — max 3 lines */}
      <p style={{ fontFamily:bvp(), fontSize:11, color:C.textSec, lineHeight:'16px',
        display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{excerpt}</p>
      {/* CTA */}
      <a href={link} target="_blank" rel="noreferrer" style={{
        display:'inline-block', alignSelf:'flex-start', padding:'6px 14px',
        background:G.cta, borderRadius:8,
        fontFamily:bvp(), fontSize:12, fontWeight:500, color:'#fff',
        textDecoration:'none', whiteSpace:'nowrap',
      }}>
        View more
      </a>
    </div>
  </div>
);

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ background:C.bgSection, border:`1px solid ${C.borderSub}`,
      borderRadius:12, overflow:'hidden', cursor:'pointer' }}
      onClick={() => setOpen(o => !o)}>
      <div style={{ padding:'12px 14px', display:'flex', alignItems:'center',
        justifyContent:'space-between', gap:16 }}>
        <p style={{ fontFamily:bvp(), fontSize:12, color:C.textSec, lineHeight:'16px', flex:1 }}>{q}</p>
        <span style={{ fontSize:16, color:C.textMuted, flexShrink:0, lineHeight:1,
          transform: open ? 'rotate(90deg)' : 'none', transition:'transform 0.2s' }}>›</span>
      </div>
      {open && (
        <div style={{ padding:'0 14px 12px' }}>
          <p style={{ fontFamily:bvp(), fontSize:12, color:C.text, lineHeight:'18px' }}>{a}</p>
        </div>
      )}
    </div>
  );
};


// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
const BottomSheet = ({ open, onClose, onCTA }) => (
  <>
    {/* Backdrop */}
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:300,
      background:'rgba(0,0,0,0.4)',
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'auto' : 'none',
      transition:'opacity 0.28s ease',
    }}/>

    {/* Sheet */}
    <div style={{
      position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
      width:'100%', maxWidth:480, zIndex:301,
      background:'#fff', borderRadius:'20px 20px 0 0',
      padding:'12px 20px 36px',
      boxSizing:'border-box',
      transition:'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
      transform: open
        ? 'translateX(-50%) translateY(0)'
        : 'translateX(-50%) translateY(100%)',
    }}>
      {/* Drag handle */}
      <div style={{ width:36, height:4, borderRadius:2, background:'#E0E0E0', margin:'0 auto 20px' }}/>

      {/* Header */}
      <p style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:C.text, lineHeight:'28px', marginBottom:12 }}>
        What is freedom age?
      </p>

      {/* Description */}
      <p style={{ fontFamily:bvp(), fontSize:14, color:C.textSec, lineHeight:'22px', marginBottom:20 }}>
        This is the age when you can live free with a balance in your account.
      </p>

      {/* Highlight */}
      <div style={{
        background:`linear-gradient(135deg, rgba(26,107,79,0.08), rgba(26,107,79,0.03))`,
        border:`1px solid rgba(26,107,79,0.18)`,
        borderRadius:12, padding:'14px 16px', marginBottom:28,
      }}>
        <p style={{ fontFamily:bvp(), fontSize:13, fontWeight:600, color:C.primary, lineHeight:'20px' }}>
          We will tell you how much you need to start investing monthly?
        </p>
      </div>

      {/* CTA */}
      <CTAButton onClick={() => { onClose(); onCTA(); }}>Let's plan</CTAButton>
    </div>
  </>
);

// ─── AMC Strip (single combined image, 832×160 = 4 logos) ────────────────────
const AmcStrip = () => (
  <img src={A.amcIcons} alt="AMC logos" style={{ height:40, width:'auto', objectFit:'contain' }}/>
);


// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Header ───────────────────────────────────────────────────────────────────

// ─── Hero Section ─────────────────────────────────────────────────────────────
const HeroSection = ({ onCalculate, onLearnMore }) => {
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);   // hero label
    const t2 = setTimeout(() => setPhase(2), 500);  // title + graphic
    const t3 = setTimeout(() => setPhase(3), 950);  // plan card
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  const tr = (delay = '0s') => `opacity 0.5s ease ${delay}, transform 0.5s ease ${delay}`;

  return (
  <div style={{ padding:'24px 16px 0' }}>
    {/* Phase 1 — Hero label */}
    <div style={{
      opacity: phase >= 1 ? 1 : 0,
      transform: phase >= 1 ? 'translateY(0)' : 'translateY(-16px)',
      transition: tr(),
    }}>
      <img src={A.heroLabel} alt="Your Money. Your Timeline." style={{ width:'100%', display:'block' }}/>
    </div>

    {/* Phase 2 — Title + graphic */}
    <div style={{
      opacity: phase >= 2 ? 1 : 0,
      transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
      transition: tr(),
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, paddingTop:32, paddingBottom:0 }}>
        <img src={A.starMain} alt="" style={{ width:16, height:16, flexShrink:0 }}/>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          <p style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1E2029', lineHeight:'24px', textAlign:'center', whiteSpace:'nowrap' }}>
            {`What's Your`}
          </p>
          <p style={{ fontFamily:"'DM Serif Display',serif", fontSize:32, lineHeight:'36px',
            background:G.green, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', textAlign:'center', whiteSpace:'nowrap' }}>
            Freedom Age?
          </p>
        </div>
        <img src={A.starMain} alt="" style={{ width:16, height:16, flexShrink:0 }}/>
      </div>
      <img src={A.heroGraphic} alt="Freedom Age illustration"
        style={{ width:'100%', display:'block', maxHeight:220, objectFit:'contain', objectPosition:'center bottom' }}/>
    </div>

    {/* Phase 3 — Plan card */}
    <div style={{
      opacity: phase >= 3 ? 1 : 0,
      transform: phase >= 3 ? 'translateY(0)' : 'translateY(24px)',
      transition: tr('0.1s'),
    }}>
      <div style={{ background:C.bgSurface, border:`1px solid ${C.border}`, borderRadius:16,
        boxShadow:'0 4px 24px rgba(0,0,0,0.04)', padding:'16px 16px 28px',
        display:'flex', flexDirection:'column', gap:20, alignItems:'center' }}>

        <div style={{ background:`linear-gradient(180deg,${C.bgSection} 0%,#fff 100%)`,
          borderRadius:12, padding:12, width:'100%' }}>
          <p style={{ fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:12, color:C.textSec,
            lineHeight:'20px', textAlign:'center' }}>
            Everyone wants to retire with some security, but where do you start?
          </p>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, width:'100%' }}>
          <img src={A.dividerLineLeft} alt="" style={{ flex:1, minWidth:0 }}/>
          <span onClick={onLearnMore} style={{
            fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:500,
            fontSize:12, lineHeight:'16px', whiteSpace:'nowrap',
            background:G.amber, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            textDecoration:'underline', textDecorationColor:'#C2712E',
            cursor:'pointer',
          }}>
            What's freedom age?
          </span>
          <img src={A.dividerLineRight} alt="" style={{ flex:1, minWidth:0 }}/>
        </div>

        {/* CTA with ripple rings */}
        <div style={{ position:'relative', width:'100%' }}>
          {[0, 0.7, 1.4].map(delay => (
            <div key={delay} style={{
              position:'absolute', inset:0,
              borderRadius:12,
              animation:`rippleOut 4.0s ease-out ${delay}s infinite`,
              pointerEvents:'none',
            }}/>
          ))}
          <CTAButton onClick={onCalculate}>Calculate Now</CTAButton>
        </div>

        <img src={A.trustVec} alt="" style={{ width:'100%', display:'block' }}/>
      </div>
    </div>
  </div>
  );
};

// ─── AMC Section ──────────────────────────────────────────────────────────────
const AmcSection = () => (
  <div style={{ padding:'32px 16px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
    {/* Heading */}
    <div style={{ textAlign:'center' }}>
      <p style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, fontStyle:'italic',
        background:G.green, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        lineHeight:'32px' }}>India's best Funds</p>
      <p style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:C.text, lineHeight:'24px' }}>trust us</p>
    </div>

    {/* Combined AMC strip */}
    <AmcStrip/>

    {/* "with their customers" */}
    <div style={{ display:'flex', alignItems:'center', gap:8, width:'100%' }}>
      <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${C.primary})` }}/>
      <img src={A.starSmall} alt="" style={{ width:12, height:12 }}/>
      <span style={{ fontFamily:"'Be Vietnam Pro',sans-serif", fontStyle:'italic', fontWeight:300,
        fontSize:12, color:C.textSec, whiteSpace:'nowrap' }}>with their customers</span>
      <img src={A.starSmall} alt="" style={{ width:12, height:12 }}/>
      <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${C.primary})` }}/>
    </div>

    {/* FREE badge */}
    <div style={{ transform:'rotate(-7deg)' }}>
      <img src={A.freeForYou} alt="FREE for You" style={{ height:40, width:'auto' }}/>
    </div>
  </div>
);

// ─── Learn Section ────────────────────────────────────────────────────────────
const LearnSection = () => (
  <div style={{ padding:'32px 16px 0' }}>
    {/* Section divider */}
    <img src={A.divider} alt="" style={{ width:'100%', display:'block', marginBottom:20 }}/>
    <SectionHead plain="Learn" gradient="Financial freedom"/>
    {/* Scrollable cards */}
    <div style={{ display:'flex', gap:16, overflowX:'auto', paddingTop:24,
      paddingBottom:4, scrollbarWidth:'none', msOverflowStyle:'none' }}>
      {learnArticles.map((a, i) => (
        <ArticleCard key={i} image={a.image} logoInitial={a.logoInitial} logoBgColor={a.logoBgColor}
          source={a.source} date={a.date} title={a.title} excerpt={a.excerpt} link={a.link}/>
      ))}
    </div>
    {/* Section divider */}
    <img src={A.divider} alt="" style={{ width:'100%', display:'block', padding:'56px 0' }}/>
  </div>
);

// ─── Watch Section ────────────────────────────────────────────────────────────
const WatchSection = () => {
  const [activeId, setActiveId] = React.useState(null);
  return (
    <div style={{ padding:'0 16px 32px' }}>
      {activeId && <VideoPlayer youtubeId={activeId} onClose={() => setActiveId(null)}/>}
      <SectionHead plain="Watch" gradient="Experts Tips"/>
      <div style={{ display:'flex', flexDirection:'column', gap:14, paddingTop:22 }}>
        <div style={{ display:'flex', gap:14 }}>
          <VideoCard creator="Sharan Hegde"  title="4 Ways to Attract Money in Your Life"       thumbnail={A.vid1} youtubeId="sTEv9CtQuqg" onPlay={() => setActiveId('sTEv9CtQuqg')}/>
          <VideoCard creator="Ankur Warikoo" title="How Much Money Did I Make This Year?"        thumbnail={A.vid2} youtubeId="xQBds2HDXPY" onPlay={() => setActiveId('xQBds2HDXPY')}/>
        </div>
        <div style={{ display:'flex', gap:14 }}>
          <VideoCard creator="Pranjal Kamra" title="Simple Financial Plan for 20 Years"          thumbnail={A.vid3} youtubeId="eeS8wdiDUko" onPlay={() => setActiveId('eeS8wdiDUko')}/>
          <VideoCard creator="Rahul Malodia" title="Increase Sales for Your Small Business"      thumbnail={A.vid4} youtubeId="QmvNGLZaUJI" onPlay={() => setActiveId('QmvNGLZaUJI')}/>
        </div>
      </div>
    </div>
  );
};

// ─── FAQ Section ──────────────────────────────────────────────────────────────
const FaqSection = () => (
  <div style={{ padding:'32px 16px 48px' }}>
    <SectionHead plain="Still have" gradient="Question?"/>
    <div style={{ display:'flex', flexDirection:'column', gap:10, paddingTop:22, paddingLeft:16, paddingRight:16 }}>
      {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a}/>)}
    </div>
  </div>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <img src={A.footerImg} alt="" style={{ width:'100%', display:'block' }}/>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function FreedomAge() {
  const params     = new URLSearchParams(window.location.search);
  const previewSt  = parseInt(params.get('step') ?? '-1', 10);
  const isPreview  = previewSt >= 1 && previewSt <= 3;
  const SEED       = { corpus:20000000, age:30, monthly:25000 };

  const [step,    setStep]    = useState(isPreview ? previewSt : 0);
  const [corpus,  setCorpus]  = useState(isPreview ? SEED.corpus  : 0);
  const [age,     setAge]     = useState(isPreview ? SEED.age     : 0);
  const [monthly, setMonthly] = useState(isPreview ? SEED.monthly : 0);
  const [animate, setAnimate] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const topRef = useRef(null);

  const goTo = (n) => {
    setAnimate(false);
    setTimeout(() => { setStep(n); setAnimate(true);
      window.scrollTo({ top:0, behavior:'smooth' }); }, 200);
  };

  return (
    <div style={{ background:C.bgBase, minHeight:'100vh', maxWidth:480, margin:'0 auto', position:'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,500;12..96,75..100,700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:${C.bgBase}; }
        ::-webkit-scrollbar { display:none; }
        input::-webkit-inner-spin-button, input::-webkit-outer-spin-button { -webkit-appearance:none; }
        input[type=number] { -moz-appearance:textfield; }
        @keyframes rippleOut {
          0%   { box-shadow: 0 0 0 0px  rgba(34,137,106,0.2); }
          100% { box-shadow: 0 0 0 32px rgba(34,137,106,0);   }
        }
      `}</style>

      {/* ── Page background pattern (scrolls with page) ── */}
      <img
        src={A.topBg}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          width: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Landing ── */}
      {step === 0 && (
        <div ref={topRef} style={{ position:'relative', zIndex:1 }}>
          <TopHeader/>
          <HeroSection onCalculate={() => goTo(1)} onLearnMore={() => setShowSheet(true)}/>
          <AmcSection/>
          <LearnSection/>
          <WatchSection/>
          <FaqSection/>
          <Footer/>
        </div>
      )}

      <BottomSheet open={showSheet} onClose={() => setShowSheet(false)} onCTA={() => goTo(1)}/>

      {/* ── Wizard ── */}
      {step >= 1 && (
        <div style={{ opacity:animate?1:0, transition:'opacity 0.22s ease', position:'relative', zIndex:1 }}>
          <WizardHeader onBack={() => step===1 ? goTo(0) : goTo(step-1)}/>
          <div style={{ padding:'0 16px 80px' }}>
            {step===1 && <Step1 onNext={({ corpus:c, age:a }) => { setCorpus(c); setAge(a); goTo(2); }}/>}
            {step===2 && <Step2 onNext={m => { setMonthly(m); goTo(3); }} onBack={() => goTo(1)}/>}
            {step===3 && <Step3 corpus={corpus} currentAge={age} monthly={monthly} onReset={() => goTo(1)}/>}
          </div>
        </div>
      )}
    </div>
  );
}
