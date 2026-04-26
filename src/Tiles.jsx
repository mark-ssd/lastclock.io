import { useEffect, useMemo, useState } from 'react';
import { pad2 } from './util.js';

function startOfDay(d){
  const x = new Date(d); x.setHours(0,0,0,0); return x;
}

function diffMs(a, b){ return b.getTime() - a.getTime(); }

function breakdownDuration(ms){
  const sign = ms < 0 ? -1 : 1;
  ms = Math.abs(ms);
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const totalDays = Math.floor(totalHours / 24);
  const years = Math.floor(totalDays / 365.25);
  const remAfterYears = totalDays - Math.floor(years * 365.25);
  const months = Math.floor(remAfterYears / 30.4375);
  const days = Math.floor(remAfterYears - months * 30.4375);
  return { sign, years, months, days, hours, minutes, seconds, totalDays };
}

export function TilesAndCountdown({ dob, deathDate }){
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const data = useMemo(() => {
    const dobD = startOfDay(dob);
    const deathD = startOfDay(deathDate);
    const totalDays = Math.max(1, Math.round(diffMs(dobD, deathD) / 86400000));
    const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));
    const livedDays = Math.max(0, Math.round(diffMs(dobD, startOfDay(now)) / 86400000));
    const livedWeeks = Math.min(totalWeeks, Math.floor(livedDays / 7));
    return { totalDays, totalWeeks, livedDays, livedWeeks };
  }, [dob, deathDate, now]);

  const COLS = 52;
  const rows = Math.ceil(data.totalWeeks / COLS);
  const tiles = [];
  for (let i = 0; i < rows * COLS; i++){
    if (i >= data.totalWeeks){
      tiles.push(<span key={i} className="tile" style={{ visibility: 'hidden' }}></span>);
    } else if (i < data.livedWeeks){
      tiles.push(<span key={i} className="tile filled"></span>);
    } else if (i === data.livedWeeks){
      tiles.push(<span key={i} className="tile now"></span>);
    } else {
      tiles.push(<span key={i} className="tile"></span>);
    }
  }

  const remainingMs = Math.max(0, diffMs(now, deathDate));
  const cd = breakdownDuration(remainingMs);
  const livedMs = Math.max(0, diffMs(dob, now));

  const pct = (data.livedDays / data.totalDays) * 100;

  return (
    <div className="result-grid">
      <div className="tiles-block">
        <div className="section-label">
          <span>life · one tile per week</span>
          <span>{data.livedWeeks.toLocaleString()} / {data.totalWeeks.toLocaleString()}</span>
        </div>
        <div className="tiles-grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {tiles}
        </div>
        <div className="tiles-legend">
          <span><span className="swatch filled"></span>lived</span>
          <span><span className="swatch now"></span>this week</span>
          <span><span className="swatch"></span>remaining</span>
          <span style={{ marginLeft: 'auto' }}>{pct.toFixed(2)}% spent</span>
        </div>
      </div>

      <div className="countdown-block">
        <div className="section-label">
          <span>time remaining</span>
          <span>· live</span>
        </div>
        <div className="countdown-grid">
          <Cell n={cd.years}   l="years" />
          <Cell n={cd.months}  l="months" />
          <Cell n={cd.days}    l="days" />
          <Cell n={cd.hours}   l="hours" />
          <Cell n={cd.minutes} l="minutes" />
          <Cell n={pad2(cd.seconds)} l="seconds" />
        </div>

        <div className="lived-summary">
          <div className="row"><span className="k">days lived</span><span>{data.livedDays.toLocaleString()}</span></div>
          <div className="row"><span className="k">days remaining</span><span>{(data.totalDays - data.livedDays).toLocaleString()}</span></div>
          <div className="row"><span className="k">heartbeats spent (est.)</span><span>{Math.round(livedMs / 1000 * (72/60)).toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
}

function Cell({ n, l }){
  return (
    <div className="cd-cell">
      <div className="cd-num">{typeof n === 'number' ? n.toLocaleString() : n}</div>
      <div className="cd-lab">{l}</div>
    </div>
  );
}
