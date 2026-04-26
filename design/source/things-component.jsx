// "Things you can still do" — picks 10 from LASTCLOCK_THINGS, divides
// remaining hours by hoursEach for each.

function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatCount(n){
  if (n <= 0) return '0';
  if (n < 1) return n < 0.5 ? '< 1' : '1';
  if (n < 1000) return Math.floor(n).toLocaleString();
  if (n < 1e6) return Math.floor(n).toLocaleString();
  if (n < 1e9) return (n / 1e6).toFixed(n < 1e7 ? 2 : 1) + 'M';
  return (n / 1e9).toFixed(2) + 'B';
}

function Things({ remainingMs }){
  const all = window.LASTCLOCK_THINGS;
  const [seed, setSeed] = React.useState(0);
  const [showAll, setShowAll] = React.useState(false);

  // pick 10 things based on seed; reroll bumps the seed
  const picks = React.useMemo(() => {
    return shuffle(all).slice(0, 10);
  }, [seed]);

  const allRest = React.useMemo(() => {
    const set = new Set(picks.map(p => p.label));
    return all.filter(t => !set.has(t.label));
  }, [picks]);

  const hoursLeft = remainingMs / 3600000;

  const renderRow = (t, i) => {
    const count = hoursLeft / t.hoursEach;
    const display = count <= 0 ? '0' : formatCount(count);
    return (
      <div key={t.label} className="thing-row">
        <span className="thing-num mono">{pad2(i + 1)}</span>
        <div>
          <div className={"thing-count" + (count < 1 ? ' zero' : '')}>{display}</div>
          <div className="thing-label">{t.label}</div>
        </div>
        <span></span>
      </div>
    );
  };

  return (
    <section className="things-block">
      <div className="things-head">
        <h2 className="things-title">
          things you can still <em>do</em>, in the time you have left.
        </h2>
        <div className="things-actions">
          <button onClick={() => { setSeed(s => s + 1); setShowAll(false); }}>
            another ten
          </button>
          <button onClick={() => setShowAll(s => !s)}>
            {showAll ? 'collapse' : 'show the other ' + allRest.length}
          </button>
        </div>
      </div>

      <div className="things-list">
        {picks.map(renderRow)}
      </div>

      {showAll && (
        <div className="things-list fade-in" style={{ marginTop: 32, borderTop: '1px solid var(--rule)' }}>
          {allRest.map((t, i) => renderRow(t, i + picks.length))}
        </div>
      )}
    </section>
  );
}

window.Things = Things;
