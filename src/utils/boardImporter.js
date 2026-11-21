import { v4 as uuidv4 } from 'uuid';

const STATUS_PALETTE = ['#00c875', '#fdab3d', '#e2445c', '#579bfc', '#c455de', '#00a8a8', '#ff642e', '#7f5347'];

// RFC-4180 CSV / TSV parser supporting UTF-8 BOM, quoted commas, and Excel tab-separated paste
export function parseDelimitedText(rawText) {
  const cleaned = String(rawText || '').replace(/^\uFEFF/, '').trim();
  if (!cleaned) return { headers: [], rows: [] };

  const firstLine = cleaned.split(/\r?\n/)[0] || '';
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = tabCount > commaCount ? '\t' : ',';

  const matrix = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    const next = cleaned[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\r' && next === '\n') {
      row.push(cell.trim());
      matrix.push(row);
      row = [];
      cell = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      row.push(cell.trim());
      matrix.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    matrix.push(row);
  }

  const nonEmpty = matrix.filter((r) => r.some((v) => v !== ''));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const headers = nonEmpty[0].map((h, idx) => h || `Column ${idx + 1}`);
  const rows = nonEmpty.slice(1).map((r) => {
    const padded = [...r];
    while (padded.length < headers.length) padded.push('');
    return padded.slice(0, headers.length);
  });

  return { headers, rows };
}

function normalizeDate(val) {
  const s = String(val || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    let year = Number(dmy[3]);
    if (year > 2400) year -= 543; // Buddhist Era -> Gregorian
    return `${year}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }
  return null;
}

function isNumericValue(val) {
  const s = String(val || '').replace(/[,฿$\s]/g, '');
  return s !== '' && !Number.isNaN(Number(s));
}

export function inferColumnsFromTable(headers, rows) {
  // Column 0 is always Item Title
  const extraHeaders = headers.slice(1);

  return extraHeaders.map((title, idx) => {
    const colIndex = idx + 1;
    const values = rows.map((r) => String(r[colIndex] || '').trim()).filter(Boolean);
    const id = `col_${idx + 1}_${title.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, '_').replace(/^_|_$/g, '') || 'field'}`;
    const lowerTitle = title.toLowerCase();

    if (/owner|assignee|person|ผู้รับผิดชอบ|พนักงาน|เจ้าของ/.test(lowerTitle)) {
      return { id, title, type: 'person', width: 135, sourceIndex: colIndex };
    }

    if (values.length > 0 && values.every((v) => normalizeDate(v) !== null)) {
      return { id, title, type: 'date', width: 135, sourceIndex: colIndex };
    }

    if (values.length > 0 && values.every((v) => isNumericValue(v))) {
      return { id, title, type: 'number', width: 125, sourceIndex: colIndex };
    }

    const unique = Array.from(new Set(values));
    if (
      /status|stage|priority|department|สถานะ|แผนก|ระดับ/.test(lowerTitle) ||
      (values.length >= 2 && unique.length >= 1 && unique.length <= 7 && unique.length < values.length)
    ) {
      const options = unique.map((label, optIdx) => {
        const lower = label.toLowerCase();
        let color = STATUS_PALETTE[optIdx % STATUS_PALETTE.length];
        if (lower.includes('done') || lower.includes('เสร็จ') || lower.includes('won') || lower.includes('approved')) color = '#00c875';
        else if (lower.includes('stuck') || lower.includes('ติด') || lower.includes('lost') || lower.includes('critical')) color = '#e2445c';
        else if (lower.includes('work') || lower.includes('กำลัง') || lower.includes('pending')) color = '#fdab3d';
        return {
          id: `opt_${optIdx}_${label.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, '_')}`,
          label,
          color,
        };
      });
      options.push({ id: 'empty', label: '', color: '#c4c4c4' });
      return { id, title, type: 'status', width: 145, options, sourceIndex: colIndex };
    }

    return { id, title, type: 'text', width: 150, sourceIndex: colIndex };
  });
}

export function buildBoardFromDelimited({ boardTitle, rawText, workspaceId = 'ws-main' }) {
  const { headers, rows } = parseDelimitedText(rawText);
  if (headers.length === 0 || rows.length === 0) {
    throw new Error('ไม่พบข้อมูลตาราง กรุณาอัปโหลดไฟล์ CSV หรือวางข้อมูลจาก Excel อย่างน้อย 1 แถว');
  }

  const inferredCols = inferColumnsFromTable(headers, rows);
  const columns = inferredCols.map(({ sourceIndex: _ignored, ...col }) => col);

  const items = rows.map((r) => {
    const item = {
      id: `item-${uuidv4()}`,
      title: r[0] || 'Untitled Item',
    };

    for (const col of inferredCols) {
      const rawVal = String(r[col.sourceIndex] || '').trim();
      if (!rawVal) continue;
      if (col.type === 'number') {
        item[col.id] = Number(rawVal.replace(/[,฿$\s]/g, '')) || 0;
      } else if (col.type === 'date') {
        item[col.id] = normalizeDate(rawVal) || rawVal;
      } else if (col.type === 'status') {
        const match = (col.options || []).find((o) => o.label === rawVal);
        item[col.id] = match ? match.id : 'empty';
      } else {
        item[col.id] = rawVal;
      }
    }

    return item;
  });

  return {
    id: `board-${uuidv4()}`,
    workspaceId,
    title: (boardTitle || '').trim() || 'Imported Board',
    type: 'grid',
    color: '#0073ea',
    parentId: null,
    columns,
    groups: [
      {
        id: `g-${uuidv4()}`,
        title: 'Imported Items',
        color: '#0073ea',
        items,
      },
    ],
  };
}
