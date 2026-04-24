import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// ── helpers ──────────────────────────────────────────────────────────────────

function generateArray(size = 12) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

// ── algorithms ───────────────────────────────────────────────────────────────

function maxSumSubarray(arr, k) {
  const steps = [];
  let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  let maxSum = windowSum;
  let maxLeft = 0;

  steps.push({
    left: 0, right: k - 1,
    highlight: Array.from({ length: arr.length }, (_, i) => i < k ? 'window' : 'none'),
    windowSum, maxSum, maxLeft, maxRight: k - 1,
    info: `Init window [0..${k - 1}] → sum = ${windowSum}`,
  });

  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i];
    const left = i - k + 1;
    if (windowSum > maxSum) {
      maxSum = windowSum;
      maxLeft = left;
    }
    const h = arr.map((_, j) => {
      if (j === i) return 'add';
      if (j === i - k) return 'remove';
      if (j >= left && j <= i) return 'window';
      return 'none';
    });
    steps.push({
      left, right: i,
      highlight: h,
      windowSum, maxSum, maxLeft, maxRight: maxLeft + k - 1,
      info: `Slide: +arr[${i}]=${arr[i]}, -arr[${i - k}]=${arr[i - k]} → sum=${windowSum}${windowSum >= maxSum ? ' ✓ new max' : ''}`,
    });
  }
  return steps;
}

function twoSumSorted(arr, target) {
  const sorted = [...arr].sort((a, b) => a - b);
  const steps = [];
  let left = 0, right = sorted.length - 1;

  while (left < right) {
    const sum = sorted[left] + sorted[right];
    const h = sorted.map((_, i) => {
      if (i === left) return 'left';
      if (i === right) return 'right';
      return 'none';
    });
    let info, found = false;
    if (sum === target) {
      info = `arr[${left}]=${sorted[left]} + arr[${right}]=${sorted[right]} = ${sum} = target ✓ FOUND`;
      found = true;
    } else if (sum < target) {
      info = `arr[${left}]=${sorted[left]} + arr[${right}]=${sorted[right]} = ${sum} < ${target} → move L right`;
    } else {
      info = `arr[${left}]=${sorted[left]} + arr[${right}]=${sorted[right]} = ${sum} > ${target} → move R left`;
    }
    steps.push({ left, right, highlight: h, sum, target, info, found, arr: sorted });
    if (found) break;
    if (sum < target) left++;
    else right--;
  }
  if (steps.length === 0 || !steps[steps.length - 1].found) {
    steps.push({
      left, right,
      highlight: sorted.map(() => 'none'),
      sum: null, target, info: 'No pair found.', found: false, arr: sorted,
    });
  }
  return steps;
}

function longestSubstringNoRepeat(str) {
  const steps = [];
  const map = {};
  let left = 0, maxLen = 0, maxStart = 0;

  for (let right = 0; right < str.length; right++) {
    const ch = str[right];
    if (map[ch] !== undefined && map[ch] >= left) {
      const oldLeft = left;
      left = map[ch] + 1;
      steps.push({
        left, right,
        highlight: str.split('').map((_, i) => {
          if (i === right) return 'conflict';
          if (i >= left && i <= right) return 'window';
          return 'none';
        }),
        info: `'${ch}' conflicts at [${map[ch]}] → shrink left ${oldLeft}→${left}`,
        maxLen, maxStart,
      });
    }
    map[ch] = right;
    const len = right - left + 1;
    if (len > maxLen) { maxLen = len; maxStart = left; }
    steps.push({
      left, right,
      highlight: str.split('').map((_, i) => {
        if (i >= left && i <= right) return 'window';
        return 'none';
      }),
      info: `Window [${left}..${right}] = "${str.slice(left, right + 1)}" len=${len}${len >= maxLen ? ' ✓ best' : ''}`,
      maxLen, maxStart,
    });
  }
  return steps;
}

// ── components ───────────────────────────────────────────────────────────────

function ArrayCell({ value, state, index }) {
  return (
    <div className={`cell cell--${state}`}>
      <span className="cell-val">{value}</span>
      <span className="cell-idx">{index}</span>
    </div>
  );
}

function StringCell({ char, state, index }) {
  return (
    <div className={`cell cell--${state}`}>
      <span className="cell-val">{char}</span>
      <span className="cell-idx">{index}</span>
    </div>
  );
}

function StepInfo({ text }) {
  return <div className="step-info"><span className="tag">STEP</span>{text}</div>;
}

function Controls({ step, total, onPrev, onNext, onPlay, playing, onReset }) {
  return (
    <div className="controls">
      <button onClick={onReset} className="btn btn-secondary">↺ Reset</button>
      <button onClick={onPrev} className="btn" disabled={step === 0}>◀ Prev</button>
      <button onClick={onPlay} className="btn btn-accent">{playing ? '⏸ Pause' : '▶ Play'}</button>
      <button onClick={onNext} className="btn" disabled={step >= total - 1}>Next ▶</button>
      <span className="step-counter">{step + 1} / {total}</span>
    </div>
  );
}

// ── SLIDING WINDOW TAB ────────────────────────────────────────────────────────

function SlidingWindowTab() {
  const [arr, setArr] = useState(() => generateArray(12));
  const [k, setK] = useState(3);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  const build = useCallback((a, kk) => {
    const s = maxSumSubarray(a, kk);
    setSteps(s);
    setStepIdx(0);
    setPlaying(false);
  }, []);

  useEffect(() => { build(arr, k); }, [arr, k, build]);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev >= steps.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(timer.current);
  }, [playing, steps.length]);

  const cur = steps[stepIdx] || {};

  return (
    <div className="tab-content">
      <p className="algo-desc">
        <strong>Max Sum Subarray of size K</strong> — slide a fixed window across the array,
        adding the new right element and dropping the leftmost each step. O(n) time.
      </p>
      <div className="config-row">
        <label>Window size K:
          <input type="range" min={2} max={Math.min(6, arr.length)} value={k}
            onChange={e => setK(+e.target.value)} />
          <span className="val-badge">{k}</span>
        </label>
        <button className="btn btn-secondary" onClick={() => { setArr(generateArray(12)); }}>
          🎲 New Array
        </button>
      </div>
      <div className="array-row">
        {arr.map((v, i) => (
          <ArrayCell key={i} value={v} index={i} state={cur.highlight?.[i] || 'none'} />
        ))}
      </div>
      <div className="pointer-row">
        {arr.map((_, i) => (
          <div key={i} className="pointer-slot">
            {i === cur.left && <span className="ptr ptr-l">L</span>}
            {i === cur.right && <span className="ptr ptr-r">R</span>}
          </div>
        ))}
      </div>
      {cur.info && <StepInfo text={cur.info} />}
      <div className="stats-row">
        <div className="stat"><span>Window Sum</span><strong>{cur.windowSum}</strong></div>
        <div className="stat"><span>Max Sum</span><strong className="accent">{cur.maxSum}</strong></div>
        <div className="stat"><span>Best Window</span><strong>[{cur.maxLeft}..{cur.maxRight}]</strong></div>
      </div>
      <Controls step={stepIdx} total={steps.length}
        onPrev={() => setStepIdx(s => Math.max(0, s - 1))}
        onNext={() => setStepIdx(s => Math.min(steps.length - 1, s + 1))}
        onPlay={() => setPlaying(p => !p)}
        playing={playing}
        onReset={() => build(arr, k)} />
    </div>
  );
}

// ── TWO POINTER TAB ───────────────────────────────────────────────────────────

function TwoPointerTab() {
  const [arr, setArr] = useState(() => generateArray(10));
  const [target, setTarget] = useState(100);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  const build = useCallback((a, t) => {
    const s = twoSumSorted(a, t);
    setSteps(s);
    setStepIdx(0);
    setPlaying(false);
  }, []);

  useEffect(() => { build(arr, target); }, [arr, target, build]);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev >= steps.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(timer.current);
  }, [playing, steps.length]);

  const cur = steps[stepIdx] || {};
  const displayArr = cur.arr || [...arr].sort((a, b) => a - b);

  return (
    <div className="tab-content">
      <p className="algo-desc">
        <strong>Two Sum (Sorted Array)</strong> — place L at start, R at end.
        If sum too small → move L right; too big → move R left. O(n) time.
      </p>
      <div className="config-row">
        <label>Target:
          <input type="number" min={20} max={200} value={target}
            onChange={e => setTarget(+e.target.value)}
            className="num-input" />
        </label>
        <button className="btn btn-secondary" onClick={() => setArr(generateArray(10))}>
          🎲 New Array
        </button>
      </div>
      <div className="array-row">
        {displayArr.map((v, i) => (
          <ArrayCell key={i} value={v} index={i} state={cur.highlight?.[i] || 'none'} />
        ))}
      </div>
      <div className="pointer-row">
        {displayArr.map((_, i) => (
          <div key={i} className="pointer-slot">
            {i === cur.left && <span className="ptr ptr-l">L</span>}
            {i === cur.right && <span className="ptr ptr-r">R</span>}
          </div>
        ))}
      </div>
      {cur.info && <StepInfo text={cur.info} />}
      <div className="stats-row">
        <div className="stat"><span>Current Sum</span><strong>{cur.sum ?? '—'}</strong></div>
        <div className="stat"><span>Target</span><strong className="accent">{target}</strong></div>
        <div className="stat"><span>Status</span>
          <strong className={cur.found ? 'found' : ''}>{cur.found ? '✓ Found!' : 'Searching…'}</strong>
        </div>
      </div>
      <Controls step={stepIdx} total={steps.length}
        onPrev={() => setStepIdx(s => Math.max(0, s - 1))}
        onNext={() => setStepIdx(s => Math.min(steps.length - 1, s + 1))}
        onPlay={() => setPlaying(p => !p)}
        playing={playing}
        onReset={() => build(arr, target)} />
    </div>
  );
}

// ── LONGEST SUBSTRING TAB ─────────────────────────────────────────────────────

const SAMPLE_STRINGS = ['abcabcbb', 'pwwkew', 'aabbccdd', 'abcdefgh', 'dvdf'];

function LongestSubstringTab() {
  const [str, setStr] = useState('abcabcbb');
  const [custom, setCustom] = useState('');
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  const build = useCallback((s) => {
    const st = longestSubstringNoRepeat(s);
    setSteps(st);
    setStepIdx(0);
    setPlaying(false);
  }, []);

  useEffect(() => { build(str); }, [str, build]);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev >= steps.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 600);
    }
    return () => clearInterval(timer.current);
  }, [playing, steps.length]);

  const cur = steps[stepIdx] || {};

  return (
    <div className="tab-content">
      <p className="algo-desc">
        <strong>Longest Substring Without Repeating Characters</strong> — variable-size window.
        Expand R; if duplicate found, shrink from L. Track character positions in a map. O(n).
      </p>
      <div className="config-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
        {SAMPLE_STRINGS.map(s => (
          <button key={s} className={`btn btn-sm ${str === s ? 'btn-accent' : 'btn-secondary'}`}
            onClick={() => setStr(s)}>{s}</button>
        ))}
        <input placeholder="custom string…" value={custom}
          onChange={e => setCustom(e.target.value.slice(0, 20))}
          onKeyDown={e => e.key === 'Enter' && custom && setStr(custom)}
          className="str-input" />
        {custom && <button className="btn" onClick={() => setStr(custom)}>Use ↵</button>}
      </div>
      <div className="array-row">
        {str.split('').map((ch, i) => (
          <StringCell key={i} char={ch} index={i} state={cur.highlight?.[i] || 'none'} />
        ))}
      </div>
      <div className="pointer-row">
        {str.split('').map((_, i) => (
          <div key={i} className="pointer-slot">
            {i === cur.left && <span className="ptr ptr-l">L</span>}
            {i === cur.right && <span className="ptr ptr-r">R</span>}
          </div>
        ))}
      </div>
      {cur.info && <StepInfo text={cur.info} />}
      <div className="stats-row">
        <div className="stat"><span>Window</span>
          <strong>"{str.slice(cur.left, (cur.right ?? -1) + 1)}"</strong></div>
        <div className="stat"><span>Length</span>
          <strong>{(cur.right ?? -1) - (cur.left ?? 0) + 1}</strong></div>
        <div className="stat"><span>Best</span>
          <strong className="accent">"{str.slice(cur.maxStart, cur.maxStart + cur.maxLen)}" ({cur.maxLen})</strong>
        </div>
      </div>
      <Controls step={stepIdx} total={steps.length}
        onPrev={() => setStepIdx(s => Math.max(0, s - 1))}
        onNext={() => setStepIdx(s => Math.min(steps.length - 1, s + 1))}
        onPlay={() => setPlaying(p => !p)}
        playing={playing}
        onReset={() => build(str)} />
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'sliding', label: '⊡ Sliding Window', component: SlidingWindowTab },
  { id: 'twoptr', label: '⇔ Two Pointer', component: TwoPointerTab },
  { id: 'substr', label: '∑ Longest Substring', component: LongestSubstringTab },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('sliding');
  const Tab = TABS.find(t => t.id === activeTab)?.component;

  return (
    <div className="app">
      <header className="header">
        <h1>Sliding Window <span className="amp">&</span> Two Pointer</h1>
        <p className="subtitle">Algorithm Visualizer · Step-by-step</p>
      </header>
      <nav className="tabs">
        {TABS.map(t => (
          <button key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      <main className="main">
        {Tab && <Tab />}
      </main>
      <footer className="footer">
        Use Prev / Next or Play to step through each algorithm state.
      </footer>
    </div>
  );
}
