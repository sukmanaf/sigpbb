export function formatArea(area: number | string | undefined | null): string {
  if (area == null) return '0 m²';
  const numArea = typeof area === 'string' ? parseFloat(area) : area;
  if (isNaN(numArea)) return '0 m²';
  
  if (numArea >= 10000) {
    return `${(numArea / 10000).toFixed(2)} ha`;
  }
  return `${numArea.toFixed(2)} m²`;
}

export function formatNop(nop: string): string {
  // Format: XX.XX.XXX.XXX.XXXX.XXXX.X (PBB format)
  return nop;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
