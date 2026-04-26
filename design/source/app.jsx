// Main app: phases = 'entry' | 'rolling' | 'result'

function isLeap(y){ return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
function daysInMonth(y, m){ // m: 1-12
  return [31, isLeap(y)?29:28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

function validateDOB(d, m, y){
  if (!d || !m || !y) return { ok: false, msg: 'enter your date of birth.' };
  const dn = parseInt(d, 10), mn = parseInt(m, 10), yn = parseInt(y, 10);
  if (isNaN(dn) || isNaN(mn) || isNaN(yn)) return { ok: false, msg: 'numbers only.' };
  if (mn < 1 || mn > 12) return { ok: false, msg: 'month must be 1\u201312.' };
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

// Pick a death date: between today+1 and dob+120y, capped to within 100 years from today.
function pickDeathDate(dob){
  const now = new Date();
  const max120 = new Date(dob.getFullYear() + 120, dob.getMonth(), dob.getDate());
  const max100fromNow = new Date(now.getFullYear() + 100, now.getMonth(), now.getDate());
  const minDate = new Date(now.getTime() + 86400000); // tomorrow at earliest
  const upper = (max120 < max100fromNow) ? max120 : max100fromNow;

  if (upper <= minDate){
    // already past lifespan — give them 6 to 36 months
    const extra = (180 + Math.random() * 900) * 86400000;
    return new Date(now.getTime() + extra);
  }

  // bias slightly: weighted toward the middle of the remaining range so the
  // result feels like a "natural" death date, not always at age 119
  const minMs = minDate.getTime();
  const maxMs = upper.getTime();
  // sum of two uniforms biases toward middle (triangular distribution)
  const r = (Math.random() + Math.random()) / 2;
  const t = minMs + (maxMs - minMs) * r;
  return new Date(t);
}

function App(){
  const [phase, setPhase] = React.useState('entry');
  const [d, setD] = React.useState('');
  const [m, setM] = React.useState('');
  const [y, setY] = React.useState('');
  const [error, setError] = React.useState('');
  const [dob, setDob] = React.useState(null);
  const [deathDate, setDeathDate] = React.useState(null);

  const refD = React.useRef(null);
  const refM = React.useRef(null);
  const refY = React.useRef(null);

  const dobValid = validateDOB(d, m, y).ok;

  React.useEffect(() => {
    if (phase === 'entry' && refD.current) refD.current.focus();
  }, [phase]);

  function handleDOBChange(setter, ref, max, nextRef){
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
    setDob(v.dob);
    setDeathDate(pickDeathDate(v.dob));
    setPhase('rolling');
  }

  function onReset(){
    setPhase('entry');
    setD(''); setM(''); setY('');
    setError('');
    setDob(null); setDeathDate(null);
  }

  // current date string for masthead
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
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, deathDate - now);

  // formatted death date — "12 march 2071"
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
