export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: '16px', md: '32px', lg: '48px' };
  return (
    <div
      className="loading-spinner"
      style={{ width: sizes[size], height: sizes[size] }}
    />
  );
}
