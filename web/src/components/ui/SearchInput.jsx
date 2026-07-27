import { Search, X } from 'lucide-react';
import { cn } from '../../lib/cn';

// Catalogue search field. Shares the pill shape and mono type of Dropdown so
// the filter bar reads as one control group.
export function SearchInput({ value, onChange, placeholder = 'Search…', label = 'Search', className }) {
  return (
    <div className={cn('relative min-w-[220px] flex-1', className)}>
      <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ac-med-gray" />
      <input
        type="search"
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        className="w-full appearance-none rounded-full border border-ac-light-gray bg-ac-card py-1.5 pl-9 pr-9 text-[13.5px] text-ac-dark outline-none transition-colors placeholder:text-ac-med-gray hover:border-ac-coral focus:border-ac-coral [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ac-med-gray transition-colors hover:text-ac-dark"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
