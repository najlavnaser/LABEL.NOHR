(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Icons ---------- */
  const P = {
    dashboard: '<rect x="3" y="3" width="8" height="10" rx="1"/><rect x="13" y="3" width="8" height="6" rx="1"/><rect x="13" y="11" width="8" height="10" rx="1"/><rect x="3" y="15" width="8" height="6" rx="1"/>',
    bag: '<path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    box: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11h14V8M10 12h4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-4 3-6 6.5-6s6 2 6.5 6M16 5a3.5 3.5 0 0 1 0 7M18 14c2 .7 3.3 2.7 3.5 6"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
    chat: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22l3-4M7 9h10M7 13h6"/>',
    ticket: '<path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6H3v2z"/><path d="M9 7v10" stroke-dasharray="2 2"/>',
    return: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8.5 12.5 12 16l3.5-3.5"/>',
    chart: '<path d="M3 20h18M5 16l4-5 4 3 6-8"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.2"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 21h4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    cart: '<path d="M3 4h3l2.5 11h9L20 8H7"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>',
    clip: '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M9 4h6v3H9zM12 11v6M9 14h6"/>',
    alert: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17v.2"/>',
    hanger: '<path d="M12 8a2 2 0 1 0-2-2M12 8v2L3 16h18l-9-6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>'
  };
  const icon = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;
  $$('[data-icon]').forEach(el => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)));

  /* ---------- Data ---------- */
  const products = [
    ['Classic Linen Kurta', 'Apparel', 482, 24100],
    ['Organic Cotton Tote', 'Accessories', 395, 7900],
    ['Hemp Fiber Sandals', 'Footwear', 210, 12600],
    ['Bamboo Fiber Towel', 'Home', 185, 4625],
    ['Recycled Wool Beanie', 'Accessories', 160, 3200],
    ['Organic Cotton Socks', 'Apparel', 142, 1420],
    ['Upcycled Denim Jacket', 'Apparel', 98, 12740],
    ['Vegan Leather Belt', 'Accessories', 85, 4250],
    ['Linen Bed Sheets', 'Home', 76, 9120],
    ['Hemp Canvas Backpack', 'Accessories', 62, 5580]
  ];
  const categories = [['Apparel', 45], ['Accessories', 28], ['Footwear', 15], ['Home', 12]];
  const stock = [
    { name: 'Classic Linen Kurta', sku: 'L-402', left: 3, icon: 'hanger' },
    { name: 'Organic Cotton Tote', sku: 'T-882', left: 8, icon: 'bag' }
  ];
  // 30 days of sales (₹ thousands) and average order value (₹)
  const sales = [38,52,41,64,56,78,70,86,60,74,80,64,56,72,66,82,58,70,76,62,68,84,72,60,78,66,74,88,70,76];
  const aov = [1100,1180,1050,1220,1160,1260,1210,1300,1150,1240,1280,1190,1140,1230,1200,1310,1170,1220,1260,1180,1210,1330,1250,1190,1280,1200,1240,1340,1230,1270];
  const KPI = { // per range: revenue, orders, customers, pending
    7:  ['₹34,920.00', 29, 31, 4],
    14: ['₹71,415.25', 58, 54, 4],
    30: ['₹1,45,280.50', 120, 90, 4]
  };

  const inr = n => '₹' + n.toLocaleString('en-IN');
  const toast = (msg) => {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove('show'), 2200);
  };

  /* ---------- Chart ---------- */
  const chart = $('#chart');
  const fmtDay = i => 'Oct ' + String(i + 1).padStart(2, '0');

  function renderChart(days) {
    const s = sales.slice(-days), a = aov.slice(-days);
    const offset = sales.length - days;
    const max = Math.max(...s) * 1.05;
    chart.innerHTML = s.map((v, i) => `
      <div class="bar-col" tabindex="0" aria-label="${fmtDay(i + offset)}: ${inr(v * 1000)}">
        <div class="bar" data-h="${(v / max * 100).toFixed(1)}"></div>
        <span class="tip">${fmtDay(i + offset)} · ${inr(v * 1000)} · AOV ${inr(a[i])}</span>
      </div>`).join('');
    // average-order-value line, spanning the same columns
    const amin = Math.min(...a) - 100, amax = Math.max(...a) + 100;
    const pts = a.map((v, i) => `${((i + .5) / days * 100).toFixed(2)},${(100 - (v - amin) / (amax - amin) * 70 - 10).toFixed(2)}`).join(' ');
    chart.insertAdjacentHTML('beforeend',
      `<svg class="aov" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
         <polyline points="${pts}" fill="none" stroke="#3b4a38" stroke-width="1.2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`);
    requestAnimationFrame(() => requestAnimationFrame(() =>
      $$('.bar', chart).forEach(b => b.style.height = b.dataset.h + '%')));
    $('#rangeLabel').textContent = days;
    $('#xStart').textContent = fmtDay(offset);
    $('#xMid').textContent = fmtDay(offset + Math.floor(days / 2));
    $('#xEnd').textContent = fmtDay(sales.length - 1);
  }

  $$('.lg').forEach(btn => btn.addEventListener('click', () => {
    btn.classList.toggle('on');
    chart.classList.toggle('hide-' + btn.dataset.series, !btn.classList.contains('on'));
  }));

  /* ---------- Table ---------- */
  function renderProducts(q = '') {
    const term = q.trim().toLowerCase();
    const rows = products
      .map((p, i) => ({ p, rank: i + 1 }))
      .filter(({ p }) => !term || p[0].toLowerCase().includes(term) || p[1].toLowerCase().includes(term));
    $('#products').innerHTML = rows.length
      ? rows.map(({ p, rank }) => `<tr><td>${String(rank).padStart(2, '0')}</td><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}</td><td>${inr(p[3])}</td></tr>`).join('')
      : '<tr><td class="empty" colspan="5">No products match your search. Try a different name or category.</td></tr>';
  }
  $('#search').addEventListener('input', e => renderProducts(e.target.value));

  /* ---------- Categories & stock ---------- */
  $('#cats').innerHTML = categories.map(([n, v]) =>
    `<div class="cat-row"><div class="top"><span>${n}</span><span>${v}%</span></div><div class="track"><i data-w="${v}"></i></div></div>`).join('');
  requestAnimationFrame(() => requestAnimationFrame(() =>
    $$('.cat-row i').forEach(i => i.style.width = i.dataset.w + '%')));

  $('#stock').innerHTML = stock.map(s => `
    <div class="stock-item">
      <div class="stock-img">${icon(s.icon)}</div>
      <div class="stock-info">
        <div class="stock-name">${s.name}</div>
        <div class="stock-meta"><span>Only ${s.left} left</span><span>SKU: ${s.sku}</span></div>
        <div class="track"><i style="width:${Math.min(100, s.left * 5)}%"></i></div>
      </div>
    </div>`).join('');
  $('#restock').addEventListener('click', () => toast('Restock request sent for ' + stock.length + ' items'));

  /* ---------- Range, KPIs, export ---------- */
  function setRange(days) {
    const k = KPI[days];
    $('#kRevenue').textContent = k[0];
    $('#kOrders').textContent = k[1];
    $('#kCustomers').textContent = k[2];
    $('#kPending').textContent = k[3];
    renderChart(days);
  }
  $('#range').addEventListener('change', e => setRange(+e.target.value));

  $('#export').addEventListener('click', () => {
    const days = +$('#range').value;
    const lines = ['Rank,Product,Category,Units Sold,Revenue'];
    products.forEach((p, i) => lines.push(`${i + 1},"${p[0]}",${p[1]},${p[2]},${p[3]}`));
    lines.push('', 'Date,Sales,Avg Order Value');
    sales.slice(-days).forEach((v, i) => lines.push(`${fmtDay(i + sales.length - days)},${v * 1000},${aov.slice(-days)[i]}`));
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `nohr-report-last-${days}-days.csv` });
    a.click(); URL.revokeObjectURL(url);
    toast('Report downloaded');
  });

  /* ---------- Navigation ---------- */
  $$('.nav a').forEach(a => a.addEventListener('click', e => {
    $$('.nav a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    $('#sidebar').classList.remove('open');
  }));
  $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));

  renderProducts();
  setRange(30);
})();