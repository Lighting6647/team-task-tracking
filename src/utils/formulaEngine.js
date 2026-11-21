// Safe Formula Evaluator (zero eval / Function constructor) + Time Tracking formatter

export function formatDuration(totalSeconds = 0) {
  const sec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getElapsedSeconds(timeVal, nowMs = Date.now()) {
  if (!timeVal || typeof timeVal !== 'object') return 0;
  const base = Number(timeVal.seconds) || 0;
  if (timeVal.runningSince) {
    const delta = Math.max(0, Math.floor((nowMs - Number(timeVal.runningSince)) / 1000));
    return base + delta;
  }
  return base;
}

// Tokenize arithmetic expressions safely: numbers, + - * / ( )
function evaluateArithmetic(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if ('+-*/()'.includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        numStr += expr[i++];
      }
      const val = Number(numStr);
      if (Number.isNaN(val)) return null;
      tokens.push(val);
      continue;
    }
    return null;
  }

  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseExpression() {
    let left = parseTerm();
    if (left === null) return null;
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const right = parseTerm();
      if (right === null) return null;
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    if (left === null) return null;
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const right = parseFactor();
      if (right === null) return null;
      if (op === '/') {
        if (right === 0) return 0;
        left = left / right;
      } else {
        left = left * right;
      }
    }
    return left;
  }

  function parseFactor() {
    if (peek() === '-') {
      consume();
      const val = parseFactor();
      return val === null ? null : -val;
    }
    if (peek() === '+') {
      consume();
      return parseFactor();
    }
    if (peek() === '(') {
      consume();
      const val = parseExpression();
      if (consume() !== ')') return null;
      return val;
    }
    const tok = consume();
    return typeof tok === 'number' ? tok : null;
  }

  const result = parseExpression();
  if (pos !== tokens.length) return null;
  return result;
}

function resolveNumericField(item, columns, token) {
  const key = token.trim();
  const byId = item[key];
  if (byId !== undefined && byId !== null && byId !== '') {
    if (typeof byId === 'object' && 'seconds' in byId) {
      return Number((getElapsedSeconds(byId) / 3600).toFixed(2));
    }
    const n = Number(byId);
    if (!Number.isNaN(n)) return n;
  }
  const col = (columns || []).find(
    (c) => c.id === key || (c.title || '').toLowerCase() === key.toLowerCase()
  );
  if (col) {
    const raw = item[col.id];
    if (raw && typeof raw === 'object' && 'seconds' in raw) {
      return Number((getElapsedSeconds(raw) / 3600).toFixed(2));
    }
    const n = Number(raw);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

export function evaluateFormula(formulaStr, item, columns = []) {
  if (!formulaStr || typeof formulaStr !== 'string') return '-';
  const trimmed = formulaStr.trim().replace(/^=/, '');
  if (!trimmed) return '-';

  // Replace {columnId} or {Column Title} with numeric value
  let substituted = trimmed.replace(/\{([^}]+)\}/g, (_, ref) =>
    String(resolveNumericField(item, columns, ref))
  );

  // Support simple helper functions: SUM(a,b), AVG(a,b), ROUND(a,n), MIN(a,b), MAX(a,b)
  substituted = substituted.replace(
    /\b(SUM|AVG|MIN|MAX|ROUND)\(([^()]+)\)/gi,
    (_, fn, argsStr) => {
      const args = argsStr.split(',').map((a) => evaluateArithmetic(a.trim()) ?? 0);
      const name = fn.toUpperCase();
      if (name === 'SUM') return String(args.reduce((s, v) => s + v, 0));
      if (name === 'AVG') return String(args.length ? args.reduce((s, v) => s + v, 0) / args.length : 0);
      if (name === 'MIN') return String(args.length ? Math.min(...args) : 0);
      if (name === 'MAX') return String(args.length ? Math.max(...args) : 0);
      if (name === 'ROUND') {
        const digits = args[1] ?? 2;
        const factor = Math.pow(10, digits);
        return String(Math.round((args[0] ?? 0) * factor) / factor);
      }
      return '0';
    }
  );

  const val = evaluateArithmetic(substituted);
  if (val === null || !Number.isFinite(val)) return 'ERR';
  return Number.isInteger(val) ? val.toLocaleString('en-US') : Number(val.toFixed(2)).toLocaleString('en-US');
}
