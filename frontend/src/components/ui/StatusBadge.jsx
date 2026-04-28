const STATUS_CONFIG = {
  RECEIVED: {
    label: 'RECEIVED',
    bg: 'bg-[#e0f2fe]',
    text: 'text-[#0369a1]',
    ring: 'ring-[#0369a1]/10',
    dot: 'bg-[#0369a1]',
  },
  PROCESSING: {
    label: 'PROCESSING',
    bg: 'bg-[#fef9c3]',
    text: 'text-[#854d0e]',
    ring: 'ring-[#854d0e]/10',
    dot: 'bg-[#a16207]',
  },
  READY: {
    label: 'READY',
    bg: 'bg-[#ecfdf5]',
    text: 'text-[#065f46]',
    ring: 'ring-[#065f46]/10',
    dot: 'bg-[#10b981]',
  },
  DELIVERED: {
    label: 'DELIVERED',
    bg: 'bg-white',
    text: 'text-[#64748b]',
    ring: 'ring-gray-200',
    dot: 'bg-gray-300',
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.RECEIVED;

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-[11px] px-2.5 py-1',
    md: 'text-xs px-3 py-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-bold rounded-full ring-1 ring-inset
        ${config.bg} ${config.text} ${config.ring} ${sizeClasses[size]}
        transition-all duration-300 hover:scale-105 active:scale-95 cursor-default
      `}
    >
      <span className={`w-1 h-1 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
