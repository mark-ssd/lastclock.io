import { useEffect, useRef, useState } from 'react';
import { DateReels } from './Reels.jsx';
import { TilesAndCountdown } from './Tiles.jsx';
import { Things } from './Things.jsx';
import { MONTHS, pad2 } from './util.js';

const STORAGE_COOKIE = 'lastclock_v1';

function setCookie(name, value, days = 365){
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}
function getCookie(name){
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function deleteCookie(name){
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function loadStoredResult(){
  const raw = getCookie(STORAGE_COOKIE);
  if (!raw) return null;
  try {
    const { dob, deathDate } = JSON.parse(raw);
    const d = new Date(dob), dd = new Date(deathDate);
    if (isNaN(d) || isNaN(dd)) return null;
    return { dob: d, deathDate: dd };
  } catch { return null; }
}

const STORED = typeof document !== 'undefined' ? loadStoredResult() : null;

function isLeap(y){ return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
function daysInMonth(y, m){
  return [31, isLeap(y)?29:28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

function validateDOB(d, m, y){
  if (!d || !m || !y) return { ok: false, msg: 'enter your date of birth.' };
  const dn = parseInt(d, 10), mn = parseInt(m, 10), yn = parseInt(y, 10);
  if (isNaN(dn) || isNaN(mn) || isNaN(yn)) return { ok: false, msg: 'numbers only.' };
  if (mn < 1 || mn > 12) return { ok: false, msg: 'month must be 1–12.' };
  if (yn < 1900 || yn > new Date().getFullYear())
    return { ok: false, msg: 'enter a real year of birth.' };
  if (dn < 1 || dn > daysInMonth(yn, mn))
    return { ok: false, msg: 'that day does not exist.' };
  const dob = new Date(yn, mn - 1, dn);
  const now = new Date();
  const ageYears = (now - dob) / (365.25 * 86400000);
  if (ageYears < 0) return { ok: false, msg: 'you cannot be born in the future.' };
  if (ageYears > 119) return { ok: false, msg: 'you have outlived the registry.' };
  return { ok: true, dob };
}

function pickDeathDate(dob){
  const now = new Date();
  const max120 = new Date(dob.getFullYear() + 120, dob.getMonth(), dob.getDate());
  const max100fromNow = new Date(now.getFullYear() + 100, now.getMonth(), now.getDate());
  const minDate = new Date(now.getTime() + 86400000);
  const upper = (max120 < max100fromNow) ? max120 : max100fromNow;

  if (upper <= minDate){
    const extra = (180 + Math.random() * 900) * 86400000;
    return new Date(now.getTime() + extra);
  }

  const minMs = minDate.getTime();
  const maxMs = upper.getTime();
  const r = (Math.random() + Math.random()) / 2;
  const t = minMs + (maxMs - minMs) * r;
  return new Date(t);
}

export default function App(){
  const [phase, setPhase] = useState(STORED ? 'result' : 'entry');
  const [d, setD] = useState('');
  const [m, setM] = useState('');
  const [y, setY] = useState('');
  const [error, setError] = useState('');
  const [dob, setDob] = useState(STORED?.dob ?? null);
  const [deathDate, setDeathDate] = useState(STORED?.deathDate ?? null);

  const refD = useRef(null);
  const refM = useRef(null);
  const refY = useRef(null);

  const dobValid = validateDOB(d, m, y).ok;

  useEffect(() => {
    if (phase === 'entry' && refD.current) refD.current.focus();
  }, [phase]);

  function handleDOBChange(setter, _ref, max, nextRef){
    return (e) => {
      let v = e.target.value.replace(/[^0-9]/g, '');
      if (v.length > max) v = v.slice(0, max);
      setter(v);
      setError('');
      if (v.length === max && nextRef && nextRef.current) nextRef.current.focus();
    };
  }

  function onFind(){
    const v = validateDOB(d, m, y);
    if (!v.ok){ setError(v.msg); return; }
    const death = pickDeathDate(v.dob);
    setDob(v.dob);
    setDeathDate(death);
    setCookie(STORAGE_COOKIE, JSON.stringify({
      dob: v.dob.toISOString(),
      deathDate: death.toISOString(),
    }));
    setPhase('rolling');
  }

  function onReset(){
    deleteCookie(STORAGE_COOKIE);
    setPhase('entry');
    setD(''); setM(''); setY('');
    setError('');
    setDob(null); setDeathDate(null);
  }

  const today = new Date();
  const todayStr = `${pad2(today.getDate())} ${MONTHS[today.getMonth()].slice(0,3).toLowerCase()} ${today.getFullYear()}`;

  return (
    <div className="page">
      <header className="masthead">
        <div className="title">lastclock<span style={{color:'var(--faded)'}}>.io</span></div>
        <div className="meta">
          <span>vol. i</span><span className="dot"></span>
          <span>the registry of last days</span><span className="dot"></span>
          <span className="mono">{todayStr}</span>
        </div>
      </header>

      {phase === 'entry' && (
        <section className="hero fade-in">
          <div>
            <h1>everyone you know <em>will die.</em></h1>
            <p className="lede">
              you do not know the day. the registry does. enter your date of birth and it will be drawn from the ledger.
            </p>
            <p className="lede faded">
              there is no algorithm. there is no science. there is only an honest reminder that the time you have is finite, and you are spending it now, reading this.
            </p>
          </div>
          <aside className="hero-side">
            <form className="dob-form" onSubmit={(e) => { e.preventDefault(); onFind(); }}>
              <div className="label">date of birth</div>
              <div className="dob-fields">
                <input ref={refD} className="mono" type="text" inputMode="numeric"
                       placeholder="dd" value={d}
                       onChange={handleDOBChange(setD, refD, 2, refM)} />
                <span className="sep">/</span>
                <input ref={refM} className="mono" type="text" inputMode="numeric"
                       placeholder="mm" value={m}
                       onChange={handleDOBChange(setM, refM, 2, refY)} />
                <span className="sep">/</span>
                <input ref={refY} className="mono year" type="text" inputMode="numeric"
                       placeholder="yyyy" value={y}
                       onChange={handleDOBChange(setY, refY, 4, null)} />
              </div>
              <div className={"dob-hint" + (error ? ' error' : '')}>
                {error || 'day · month · year'}
              </div>
              <button type="submit" className="cta" disabled={!dobValid}>
                find my death date
              </button>
            </form>
          </aside>
        </section>
      )}

      {phase === 'rolling' && (
        <DateReels deathDate={deathDate}
                   spinning={true}
                   onAllLanded={() => setPhase('result')} />
      )}

      {phase === 'result' && (
        <ResultView dob={dob} deathDate={deathDate} onReset={onReset} />
      )}

      <footer className="footer">
        <div>lastclock.io</div>
        <div>memento mori</div>
      </footer>
    </div>
  );
}

function ResultView({ dob, deathDate, onReset }){
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, deathDate - now);

  const dStr = `${pad2(deathDate.getDate())} ${MONTHS[deathDate.getMonth()].toLowerCase()} ${deathDate.getFullYear()}`;
  const ageAtDeath = Math.floor((deathDate - dob) / (365.25 * 86400000));
  const dayOfWeek = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][deathDate.getDay()];

  return (
    <section className="fade-in">
      <div className="result-head">
        <span className="eyebrow">the registry returns</span>
        <button className="reset" onClick={onReset}>reset</button>
      </div>
      <h2 className="death-headline">
        a <em>{dayOfWeek}</em>, {dStr}.
      </h2>
      <div className="death-sub">
        you will be {ageAtDeath} years old. this is the last day you are entitled to.
      </div>

      <TilesAndCountdown dob={dob} deathDate={deathDate} />

      <Things remainingMs={remainingMs} />
    </section>
  );
}
