export const STYLES = [
  { id: 'mid-century', name: 'Mid-Century Modern', prompt: 'Mid-Century Modern style, featuring clean lines, organic curves, teak wood furniture, and retro-inspired decor.' },
  { id: 'scandinavian', name: 'Scandinavian', prompt: 'Scandinavian style, bright and airy, minimalist, light wood floors, white walls, cozy textiles, and functional furniture.' },
  { id: 'industrial', name: 'Industrial', prompt: 'Industrial style, exposed brick, metal accents, leather furniture, vintage lighting, and raw textures.' },
  { id: 'bohemian', name: 'Bohemian', prompt: 'Bohemian style, eclectic mix of patterns, rattan furniture, abundant indoor plants, macrame, and warm earthy colors.' },
  { id: 'minimalist', name: 'Minimalist', prompt: 'Ultra-minimalist style, monochromatic palette, sleek surfaces, hidden storage, and very few curated decor pieces.' },
];

export function StyleCarousel({ 
  activeStyleId, 
  onSelectStyle 
}: { 
  activeStyleId: string | null, 
  onSelectStyle: (styleId: string) => void 
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
      {STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => onSelectStyle(style.id)}
          className={`snap-start whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-all ${
            activeStyleId === style.id
              ? 'bg-ink text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          {style.name}
        </button>
      ))}
    </div>
  );
}
