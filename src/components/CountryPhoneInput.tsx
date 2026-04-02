'use client';

import {useState, useRef, useEffect} from 'react';
import {cn} from '@/lib/utils';

// Common countries with their codes and phone number patterns
const countries = [
  {code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '\u{1F1F3}\u{1F1EC}', maxLength: 10},
  {code: 'US', name: 'United States', dialCode: '+1', flag: '\u{1F1FA}\u{1F1F8}', maxLength: 10},
  {code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '\u{1F1EC}\u{1F1E7}', maxLength: 10},
  {code: 'GH', name: 'Ghana', dialCode: '+233', flag: '\u{1F1EC}\u{1F1ED}', maxLength: 9},
  {code: 'KE', name: 'Kenya', dialCode: '+254', flag: '\u{1F1F0}\u{1F1EA}', maxLength: 9},
  {code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '\u{1F1FF}\u{1F1E6}', maxLength: 9},
  {code: 'CA', name: 'Canada', dialCode: '+1', flag: '\u{1F1E8}\u{1F1E6}', maxLength: 10},
  {code: 'IN', name: 'India', dialCode: '+91', flag: '\u{1F1EE}\u{1F1F3}', maxLength: 10},
  {code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '\u{1F1E6}\u{1F1EA}', maxLength: 9},
  {code: 'SG', name: 'Singapore', dialCode: '+65', flag: '\u{1F1F8}\u{1F1EC}', maxLength: 8},
  {code: 'AU', name: 'Australia', dialCode: '+61', flag: '\u{1F1E6}\u{1F1FA}', maxLength: 9},
  {code: 'DE', name: 'Germany', dialCode: '+49', flag: '\u{1F1E9}\u{1F1EA}', maxLength: 11},
  {code: 'FR', name: 'France', dialCode: '+33', flag: '\u{1F1EB}\u{1F1F7}', maxLength: 9},
];

interface CountryPhoneInputProps {
  value: string;
  countryCode: string;
  onChange: (phone: string, countryCode: string, isValid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function CountryPhoneInput({
  value,
  countryCode,
  onChange,
  placeholder = 'Phone number',
  disabled = false,
  className,
  error,
}: CountryPhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find(c => c.dialCode === countryCode) || countries[0];

  // Filter countries by search
  const filteredCountries = countries.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validate phone number
  const validatePhone = (phone: string): boolean => {
    if (!phone) return false;
    const digitsOnly = phone.replace(/\D/g, '');
    // Remove leading zero if present (common in Nigeria)
    const normalized = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
    return normalized.length >= 7 && normalized.length <= selectedCountry.maxLength;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d\s-]/g, '');
    const isValid = validatePhone(newValue);
    onChange(newValue, countryCode, isValid);
  };

  const handleCountrySelect = (country: (typeof countries)[0]) => {
    setIsOpen(false);
    setSearch('');
    const isValid = validatePhone(value);
    onChange(value, country.dialCode, isValid);
  };

  // Format E.164 number for display
  const getE164Number = (): string => {
    if (!value) return '';
    const digitsOnly = value.replace(/\D/g, '');
    const normalized = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
    return `${countryCode}${normalized}`;
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div
        className={cn(
          'flex items-stretch rounded-xl border-2 bg-muted/20 transition-all overflow-hidden',
          error ? 'border-red-500' : 'border-input focus-within:border-primary',
          disabled && 'opacity-50 cursor-not-allowed',
        )}>
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-3 border-r border-input/50 hover:bg-muted/30 transition-colors min-w-[100px]">
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-muted-foreground">{selectedCountry.dialCode}</span>
          <svg
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              isOpen && 'rotate-180',
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Phone input */}
        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 py-3 bg-transparent outline-none font-medium text-sm placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-xl shadow-lg z-50 max-h-64 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Search input */}
          <div className="p-2 border-b">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-muted/30 outline-none placeholder:text-muted-foreground/50"
              autoFocus
            />
          </div>

          {/* Country list */}
          <div className="overflow-y-auto max-h-48">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">No countries found</div>
            ) : (
              filteredCountries.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left',
                    selectedCountry.code === country.code && 'bg-primary/10',
                  )}>
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-sm font-medium">{country.name}</span>
                  <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}

      {/* E.164 preview (for debugging, can remove in production) */}
      {value && validatePhone(value) && (
        <p className="text-xs text-muted-foreground mt-1 ml-1">
          Will be sent as: {getE164Number()}
        </p>
      )}
    </div>
  );
}

// Helper function to format phone to E.164
export function formatE164(phone: string, countryCode: string): string {
  if (!phone) return '';
  const digitsOnly = phone.replace(/\D/g, '');
  const normalized = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
  return `${countryCode}${normalized}`;
}

export {countries};
