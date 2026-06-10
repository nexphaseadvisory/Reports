// interconnect_inject.js
// Final Code node ("Code — Inject") for the Interconnect Publisher workflow.
//
// SOURCE OF TRUTH: the locked design shell at
//   interconnect/template/the_interconnect_TEMPLATE.html  (in nexphaseadvisory/Reports)
// This node FETCHES that file from GitHub at runtime — there is NO embedded copy here,
// so the template can never drift from the repo. The ONLY things replaced are the tokens:
//   {{DATELINE}} {{VOL}} {{NO}} {{YEAR}} {{LEDE}} {{SIGNAL_CARDS}} {{CONNECTOR_MARKETS}} {{QUEUE_ROWS}}
// Every CSS rule, every HTML element, the masthead, the footer — untouched.
//
// UPSTREAM FIELD CONTRACT:
//   Set Metadata        -> { dateline, vol, no }
//   Generate Lede       -> Claude JSON: { lede }
//   Generate Signals    -> Claude JSON: [ { iso, location, category, headline, detail, angle, variant } ]
//   Generate Connectors -> Claude JSON: [ { demand_market, demand_text, supply_market, supply_text } ]
//   Fetch Queue Records -> Airtable rows: project<-Project Name, iso<-Utility (mapped),
//                          type<-Generation Type, mw<-MW Capacity, status<-Status, poi<-POI Name

// ---------- fetch the locked template from the repo (GitHub API, no embedded copy) ----------
const TEMPLATE_URL = 'https://api.github.com/repos/nexphaseadvisory/Reports/contents/interconnect/template/the_interconnect_TEMPLATE.html?ref=main';
const resp = await this.helpers.httpRequest({
  method: 'GET',
  url: TEMPLATE_URL,
  headers: { 'Accept': 'application/vnd.github.raw', 'User-Agent': 'n8n-interconnect-publisher' },
  json: false
});
let TEMPLATE;
if (typeof resp === 'string') {
  TEMPLATE = resp;                                         // raw accept returned the file text
} else if (resp && resp.content) {
  TEMPLATE = Buffer.from(resp.content, 'base64').toString('utf8'); // fallback: default JSON+base64
} else {
  TEMPLATE = String(resp);
}
if (TEMPLATE.indexOf('{{LEDE}}') === -1 || TEMPLATE.indexOf('{{SIGNAL_CARDS}}') === -1) {
  throw new Error('Template fetch failed or missing tokens — got ' + TEMPLATE.length + ' chars from ' + TEMPLATE_URL);
}

// ---------- helpers ----------
function claudeJSON(resp) {
  try {
    const content = (resp && resp.content) || [];
    const text = content.filter(b => b && b.type === 'text').map(b => b.text).join('').trim();
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) { return null; }
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const ISO_BADGE = { PJM: 'badge-pjm', WECC: 'badge-wecc', MISO: 'badge-miso', ERCOT: 'badge-ercot', CAISO: 'badge-caiso', FRCC: 'badge-frcc', SERC: 'badge-serc', NYISO: 'badge-pjm', SPP: 'badge-pjm' };
function badgeClass(iso) { return ISO_BADGE[String(iso || '').toUpperCase()] || 'badge-pjm'; }
function isoFromUtility(u) {
  const s = String(u || '');
  if (/Florida Power|Duke Energy Florida|Tampa Electric|Gulf Power/i.test(s)) return 'FRCC';
  if (/Duke/i.test(s)) return 'SERC';
  if (/PJM/i.test(s)) return 'PJM';
  if (/CAISO/i.test(s)) return 'CAISO';
  if (/MISO/i.test(s)) return 'MISO';
  return s;
}

// ---------- pull upstream ----------
const meta = $('Set Metadata').first().json;
const ledeObj = claudeJSON($('Generate Lede').first().json) || { lede: '' };
const signals = claudeJSON($('Generate Signals').first().json) || [];
const connectors = claudeJSON($('Generate Connectors').first().json) || [];
const queueRaw = $('Fetch Queue Records').all().map(i => i.json);

// ---------- SIGNAL_CARDS ----------
const signalCards = (Array.isArray(signals) ? signals : []).map(s => {
  const variant = (s.variant === 'flag' || s.variant === 'gold') ? ' ' + s.variant : '';
  return '<div class="signal-card' + variant + '">\n' +
    '      <div class="signal-meta">\n' +
    '        <span class="badge ' + badgeClass(s.iso) + '">' + esc(s.iso) + '</span>\n' +
    '        ' + esc(s.location) + ' · ' + esc(s.category) + '\n' +
    '      </div>\n' +
    '      <h3>' + esc(s.headline) + '</h3>\n' +
    '      <p>' + esc(s.detail) + '</p>\n' +
    '      <div class="angle">\n' +
    '        <strong>The Angle</strong>\n' +
    '        ' + esc(s.angle) + '\n' +
    '      </div>\n' +
    '    </div>';
}).join('\n');

// ---------- CONNECTOR_MARKETS (each pairing = demand cell + supply cell) ----------
const connectorCells = (Array.isArray(connectors) ? connectors : []).map(c => {
  return '<div class="connector-cell demand">\n' +
    '        <div class="cell-label">Demand Signal</div>\n' +
    '        <h4>' + esc(c.demand_market) + '</h4>\n' +
    '        <p>' + esc(c.demand_text) + '</p>\n' +
    '      </div>\n' +
    '      <div class="connector-cell">\n' +
    '        <div class="cell-label">Supply Context</div>\n' +
    '        <h4>' + esc(c.supply_market) + '</h4>\n' +
    '        <p>' + esc(c.supply_text) + '</p>\n' +
    '      </div>';
}).join('\n');

// ---------- QUEUE_ROWS (map Airtable fields; cap for spotlight) ----------
const QUEUE_CAP = 8;
const queueRows = queueRaw.map(q => ({
  project: q['Project Name'] || q['POI Name'] || '',
  iso: isoFromUtility(q['Utility']),
  type: q['Generation Type'] || q['Project Type'] || '',
  mw: (q['MW Capacity'] != null ? q['MW Capacity'] : ''),
  status: q['Status'] || '',
  poi: q['POI Name'] || ''
}))
  .sort((a, b) => (parseFloat(b.mw) || 0) - (parseFloat(a.mw) || 0))
  .slice(0, QUEUE_CAP)
  .map(q =>
    '<tr>\n' +
    '          <td>' + esc(q.project) + '</td>\n' +
    '          <td>' + esc(q.iso) + '</td>\n' +
    '          <td>' + esc(q.type) + '</td>\n' +
    '          <td class="mw">' + esc(q.mw) + '</td>\n' +
    '          <td>' + esc(q.status) + '</td>\n' +
    '          <td>' + esc(q.poi) + '</td>\n' +
    '        </tr>'
  ).join('\n');

// ---------- inject ONLY the tokens; everything else is the locked template verbatim ----------
const year = new Date().getFullYear();
const html = TEMPLATE
  .split('{{DATELINE}}').join(esc(meta.dateline))
  .split('{{VOL}}').join(esc(meta.vol))
  .split('{{NO}}').join(esc(meta.no))
  .split('{{LEDE}}').join(esc(ledeObj.lede))
  .split('{{SIGNAL_CARDS}}').join(signalCards)
  .split('{{CONNECTOR_MARKETS}}').join(connectorCells)
  .split('{{QUEUE_ROWS}}').join(queueRows)
  .split('{{YEAR}}').join(String(year));

const filename = 'interconnect-vol' + meta.vol + '-no' + meta.no + '.html';
return [{ json: { html, filename, vol: meta.vol, no: meta.no, dateline: meta.dateline } }];
