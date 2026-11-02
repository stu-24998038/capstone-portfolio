import { initials } from '../utils/format';

const PALETTES = [
  'bg-terracotta text-cream',
  'bg-forest text-cream',
  'bg-butter text-ink',
  'bg-moss text-cream',
  'bg-[#7c9c9a] text-ink',
  'bg-clay text-cream',
];

export default function Avatar({ name = 'Alex Chen', size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8 text-[0.62rem]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-16 w-16 text-lg',
  };
  const code = String(name)
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const palette = PALETTES[code % PALETTES.length];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono font-medium uppercase tracking-wider ${palette} ${sizes[size]} ${className}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
