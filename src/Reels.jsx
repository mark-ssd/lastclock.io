import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MONTHS, pad2 } from './util.js';

// One reel. Builds a long looping track, then animates translateY from
// some random offset down to the resting offset for the target index.
function Reel({ items, targetIndex, kind, width, spinning, onLanded, delay }){
  const trackRef = useRef(null);
  const onLandedRef = useRef(onLanded);
  useEffect(() => { onLandedRef.current = onLanded; }, [onLanded]);

  const cellH = 60;
  const visibleH = 180;
  const center = (visibleH / 2) - (cellH / 2); // 60px

  const loops = 24;
  const seq = useMemo(() => {
    const out = [];
    for (let i = 0; i < loops; i++) out.push(...items);
    out.push(...items); // landing copy
    return out;
  }, [items]);

  // Only re-run when spinning toggles or items/targetIndex change.
  // We deliberately do NOT include onLanded so a parent re-render mid-spin
  // doesn't yank the reel back to start.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (!spinning){
      const finalIdx = items.length * loops + targetIndex;
      const y = center - finalIdx * cellH;
      track.style.transition = 'none';
      track.style.transform = `translateY(${y}px)`;
      return;
    }

    const startIdx = items.length * 2;
    const startY = center - startIdx * cellH;
    track.style.transition = 'none';
    track.style.transform = `translateY(${startY}px)`;
    // force reflow
    void track.offsetHeight;

    const finalIdx = items.length * loops + targetIndex;
    const endY = center - finalIdx * cellH;
    const duration = 2600 + delay;

    const timer = setTimeout(() => {
      track.style.transition = `transform ${duration}ms cubic-bezier(0.16, 0.84, 0.24, 1)`;
      track.style.transform = `translateY(${endY}px)`;
    }, 30);

    const landTimer = setTimeout(() => {
      if (onLandedRef.current) onLandedRef.current();
    }, 30 + duration + 80);

    return () => { clearTimeout(timer); clearTimeout(landTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, targetIndex, items, delay]);

  return (
    <div className="reel-frame" style={{ '--w': width + 'px' }}>
      <span className="reel-pointer left"></span>
      <span className="reel-pointer right"></span>
      <div className="reel-track" ref={trackRef}>
        {seq.map((v, i) => (
          <div key={i} className={`reel-cell ${kind}`} style={{ width: width + 'px' }}>
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DateReels({ deathDate, spinning, onAllLanded }){
  const days = useMemo(() => Array.from({length: 31}, (_, i) => pad2(i + 1)), []);
  const months = MONTHS;
  const nowYear = new Date().getFullYear();
  const years = useMemo(() => {
    const out = [];
    for (let y = nowYear; y <= nowYear + 105; y++) out.push(String(y));
    return out;
  }, [nowYear]);

  const landedRef = useRef({ d: false, m: false, y: false });
  const [, setTick] = useState(0);

  useEffect(() => {
    if (spinning) {
      landedRef.current = { d: false, m: false, y: false };
      setTick(t => t + 1);
    }
  }, [spinning]);

  const markLanded = useCallback((key) => {
    landedRef.current = { ...landedRef.current, [key]: true };
    const { d, m, y } = landedRef.current;
    if (d && m && y) {
      setTimeout(() => onAllLanded && onAllLanded(), 600);
    }
    setTick(t => t + 1);
  }, [onAllLanded]);

  // stable per-reel callbacks
  const onD = useCallback(() => markLanded('d'), [markLanded]);
  const onM = useCallback(() => markLanded('m'), [markLanded]);
  const onY = useCallback(() => markLanded('y'), [markLanded]);

  const targetD = deathDate ? deathDate.getDate() - 1 : 0;
  const targetM = deathDate ? deathDate.getMonth() : 0;
  const targetY = deathDate ? Math.max(0, deathDate.getFullYear() - nowYear) : 0;

  const allDone = landedRef.current.d && landedRef.current.m && landedRef.current.y;

  return (
    <div className="reels-stage fade-in">
      <div className="reels-caption">
        {spinning && !allDone ? 'consulting the registry' : 'recorded'}
      </div>
      <div className="reels">
        <Reel items={days}   targetIndex={targetD} kind="day"   width={120}
              spinning={spinning} delay={0}    onLanded={onD} />
        <span className="reel-sep">·</span>
        <Reel items={months} targetIndex={targetM} kind="month" width={260}
              spinning={spinning} delay={500}  onLanded={onM} />
        <span className="reel-sep">·</span>
        <Reel items={years}  targetIndex={targetY} kind="year"  width={150}
              spinning={spinning} delay={1100} onLanded={onY} />
      </div>
      <div className="reels-caption" style={{ opacity: spinning ? 0.4 : 0.7 }}>
        the registry returns one date.
      </div>
    </div>
  );
}
