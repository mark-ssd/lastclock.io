import { useMemo, useState } from 'react';
import { THINGS } from './things.js';
import { pad2 } from './util.js';

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

export function Things({ remainingMs }){
  const [seed, setSeed] = useState(0);

  const picks = useMemo(() => {
    return shuffle(THINGS).slice(0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const hoursLeft = remainingMs / 3600000;

  return (
    <section className="things-block">
      <div className="things-head">
        <h2 className="things-title">
          things you can still <em>do</em>, in the time you have left.
        </h2>
        <div className="things-actions">
          <button onClick={() => setSeed(s => s + 1)}>another ten</button>
        </div>
      </div>

      <div className="things-list" key={seed}>
        {picks.map((t, i) => {
          const count = hoursLeft / t.hoursEach;
          const display = count <= 0 ? '0' : formatCount(count);
          return (
            <div
              key={t.label}
              className="thing-row thing-row-anim"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="thing-num mono">{pad2(i + 1)}</span>
              <div>
                <div className={"thing-count" + (count < 1 ? ' zero' : '')}>{display}</div>
                <div className="thing-label">{t.label}</div>
              </div>
              <span></span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
