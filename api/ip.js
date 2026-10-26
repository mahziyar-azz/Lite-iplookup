export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const raw = req.headers['x-real-ip'];
  const ip = (Array.isArray(raw) ? raw[0] : raw)?.split(',')[0].trim();
  if (!ip) return res.status(400).json({ error: 'IP unavailable' });
  try {
    const url = 'https://ipwho.is/' + encodeURIComponent(ip) + '?fields=success,ip,country';
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error('Lookup failed');
    const data = await response.json();
    if (!data.success || !data.ip) throw new Error('Lookup failed');
    return res.status(200).json({ ip: data.ip, country: data.country || 'Unknown country' });
  } catch {
    return res.status(502).json({ error: 'Lookup failed' });
  }
}
