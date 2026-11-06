// Shared Tailwind class strings, so buttons and inputs look the same everywhere.

export const labelClass = 'block text-sm font-medium text-[#1a1a1a] mb-1.5';

export const inputClass =
  'w-full rounded-md border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:border-[#47A15E] focus:ring-2 focus:ring-[#47A15E]/20 transition-colors disabled:bg-gray-50';

export const inputErrorClass = 'border-red-400 focus:border-red-500 focus:ring-red-500/20';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap';

export const primaryButton = `${buttonBase} bg-[#17643F] text-white hover:bg-[#12502f]`;

export const secondaryButton = `${buttonBase} border border-gray-200 bg-white text-[#1a1a1a] hover:border-gray-300 hover:bg-gray-50`;

export const dangerButton = `${buttonBase} bg-red-600 text-white hover:bg-red-700`;

export const dangerOutlineButton = `${buttonBase} border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300`;

export const card = 'bg-white rounded-md border border-gray-200';
