import { Search, X } from 'lucide-react';

const STATUSES = [
  { value: 'ALL', label: 'ALL' },
  { value: 'RECEIVED', label: 'RECEIVED' },
  { value: 'PROCESSING', label: 'PROCESSING' },
  { value: 'READY', label: 'READY' },
  { value: 'DELIVERED', label: 'DELIVERED' },
];

export default function OrderFilters({ status, onStatusChange, search, onSearchChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or order ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-premium pl-10 pr-9 w-full"
          id="order-search-input"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5 px-1">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => onStatusChange(s.value)}
            className={`
              px-4 py-2 rounded-full text-[10px] font-black tracking-wider transition-all duration-150
              ${
                status === s.value
                  ? 'bg-[var(--brand-primary)] text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-[var(--brand-light)] hover:text-[var(--brand-primary)]'
              }
            `}
            id={`filter-${s.value.toLowerCase()}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
