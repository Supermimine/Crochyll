export function detectColumns(items: any[]) {
  const xs = items.map(i => i.transform[4]);
  const sorted = [...xs].sort((a, b) => a - b);

  const clusters: number[][] = [];
  const threshold = 40;

  for (const x of sorted) {
    const last = clusters[clusters.length - 1];
    if (!last || Math.abs(last[0] - x) > threshold) {
      clusters.push([x]);
    } else {
      last.push(x);
    }
  }

  return clusters
    .map(c => c.reduce((a, b) => a + b, 0) / c.length)
    .sort((a, b) => a - b);
}

export function buildParagraphs(items: any[]) {
  items.sort((a, b) => {
    const dy = b.transform[5] - a.transform[5];
    if (Math.abs(dy) > 5) return dy;
    return a.transform[4] - b.transform[4];
  });

  const paragraphs: string[] = [];
  let current = "";
  let lastY: number | null = null;

  for (const item of items) {
    const text = item.str.trim();
    if (!text) continue;

    const y = item.transform[5];

    if (lastY !== null && Math.abs(lastY - y) > 18) {
      paragraphs.push(current.trim());
      current = text;
    } else {
      current += " " + text;
    }

    lastY = y;
  }

  if (current) paragraphs.push(current.trim());
  return paragraphs;
}
