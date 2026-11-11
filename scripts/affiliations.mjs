import QRCode from 'qrcode';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const numberPattern = /^SLMMAF-CLUB-(\d{4,})$/;
const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function validateAffiliations(data) {
  if (data.affiliationSequence !== undefined && (!Number.isSafeInteger(data.affiliationSequence) || data.affiliationSequence < 0)) throw new Error('affiliationSequence must be a non-negative safe integer.');
  const used = new Set();
  for (const club of data.clubs) {
    if (!club.affiliationNumber) continue;
    const match = numberPattern.exec(club.affiliationNumber);
    if (!match || !Number.isSafeInteger(Number(match[1])) || Number(match[1]) < 1 || String(Number(match[1])).padStart(4, '0') !== match[1]) throw new Error(`Invalid affiliation number: ${club.slug}`);
    if (used.has(club.affiliationNumber)) throw new Error(`Duplicate affiliation number: ${club.affiliationNumber}`);
    used.add(club.affiliationNumber);
  }
}

export function assignAffiliationNumbers(data) {
  validateAffiliations(data);
  let sequence = data.affiliationSequence || 0;
  for (const club of data.clubs) {
    if (club.affiliationNumber) sequence = Math.max(sequence, Number(club.affiliationNumber.match(numberPattern)[1]));
  }
  const clubs = data.clubs.map(club => {
    if (club.status !== 'approved' || club.affiliationNumber) return { ...club };
    if (!Number.isSafeInteger(sequence + 1)) throw new Error('Affiliation number sequence is exhausted.');
    return { ...club, affiliationNumber: `SLMMAF-CLUB-${String(++sequence).padStart(4, '0')}` };
  });
  return { ...data, affiliationSequence: sequence, clubs };
}

export function affiliationAssetPaths(club) {
  if (!numberPattern.test(club.affiliationNumber)) throw new Error(`Assign an affiliation number before generating QR assets: ${club.slug}`);
  const directory = `assets/affiliations/${club.affiliationNumber}`;
  return { svg: `${directory}/qr.svg`, png: `${directory}/qr.png`, label: `${directory}/certificate-label.svg` };
}

function labelSvg(club, qrSvg) {
  const lines = [];
  let line = '';
  for (const word of club.name.split(/\s+/)) {
    if (line && (line + ' ' + word).length > 52) { lines.push(line); line = ''; }
    line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  const height = 1340 + lines.length * 44;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}">
<title>${escapeXml(club.name)} — ${escapeXml(club.affiliationNumber)}</title>
<rect width="1200" height="${height}" fill="white"/>
${qrSvg}
<text x="600" y="1260" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="700">${escapeXml(club.affiliationNumber)}</text>
${lines.map((text, index) => `<text x="600" y="${1320 + index * 44}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32">${escapeXml(text)}</text>`).join('\n')}
</svg>\n`;
}

export async function writeAffiliationAssets({ clubs, siteUrl, output }) {
  for (const club of clubs) {
    const paths = affiliationAssetPaths(club);
    const url = `${siteUrl}/clubs/${club.slug}/`;
    const options = { errorCorrectionLevel: 'M', margin: 4, width: 1200, color: { dark: '#000000ff', light: '#ffffffff' } };
    const svg = await QRCode.toString(url, { ...options, type: 'svg' });
    const png = await QRCode.toBuffer(url, { ...options, type: 'png' });
    await mkdir(dirname(join(output, paths.svg)), { recursive: true });
    await writeFile(join(output, paths.svg), svg);
    await writeFile(join(output, paths.png), png);
    await writeFile(join(output, paths.label), labelSvg(club, svg));
  }
}
