'use client';

/* LocationAutocomplete — predictive city/location search with Google Places */

/**
 * LocationAutocomplete
 * A search input with Google Places predictive text.
 * Works standalone — wraps its own APIProvider so it can be used
 * anywhere on the page, including outside the map canvas.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Search, MapPin, X } from 'lucide-react';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

// All valid US state/territory abbreviations
const US_STATE_ABBREVS = new Set([
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
  'DC',
  'PR',
  'GU',
]);

// Full state name → abbreviation (covers every format Google Places returns)
const STATE_NAME_TO_ABBREV: Record<string, string> = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
  'district of columbia': 'DC',
  'washington dc': 'DC',
  'washington d.c.': 'DC',
  'puerto rico': 'PR',
  guam: 'GU',
};

/**
 * Extracts a US state abbreviation from Google Places text.
 * Handles all formats Google returns:
 *   "OR, USA"  |  "New York, NY, USA"  |  "Oregon, United States"
 *   "Portland, Oregon, United States"  |  "New York, New York, United States"
 */
function extractState(text: string): string | null {
  // Clean up "United States" / "USA" noise so we don't confuse it with state names
  const cleaned = text
    .replace(/,?\s*United States\s*/gi, '')
    .replace(/,?\s*USA\s*/gi, '')
    .trim();

  const parts = cleaned
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    const upper = part.toUpperCase();
    // Direct abbreviation match (e.g. "OR", "NY")
    if (US_STATE_ABBREVS.has(upper)) return upper;

    // Full name match (e.g. "Oregon", "New York")
    const lower = part.toLowerCase();
    if (STATE_NAME_TO_ABBREV[lower]) return STATE_NAME_TO_ABBREV[lower];
  }

  // Last resort: scan the entire original text for a full state name
  // (handles run-together formats like "Portland Oregon")
  const fullLower = text.toLowerCase();
  // Sort by length descending so "west virginia" beats "virginia"
  const sortedNames = Object.keys(STATE_NAME_TO_ABBREV).sort((a, b) => b.length - a.length);
  for (const name of sortedNames) {
    if (fullLower.includes(name)) return STATE_NAME_TO_ABBREV[name];
  }

  return null;
}

interface Suggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  /** Fired with the 2-letter state code whenever a suggestion is selected */
  onStateDetected?: (state: string) => void;
  placeholder?: string;
  className?: string;
  types?: string[];
  icon?: React.ReactNode;
  /** aria-label for the input */
  label?: string;
}

function AutocompleteInput({
  value,
  onChange,
  onSelect,
  onStateDetected,
  placeholder = 'Start typing a city or state...',
  className = '',
  types = ['(cities)'],
  icon,
  label = 'Location search',
}: AutocompleteInputProps) {
  const places = useMapsLibrary('places');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceRef = useRef<any>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build the service once the library is loaded
  useEffect(() => {
    if (!places) return;
    serviceRef.current = new places.AutocompleteService();
  }, [places]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!serviceRef.current || input.trim().length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      serviceRef.current.getPlacePredictions(
        {
          input,
          types,
          componentRestrictions: { country: 'us' },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (predictions: any[] | null, status: string) => {
          if (status === 'OK' && predictions && predictions.length > 0) {
            setSuggestions(
              predictions.slice(0, 6).map((p: any) => ({
                placeId: p.place_id,
                mainText: p.structured_formatting.main_text,
                secondaryText: p.structured_formatting.secondary_text ?? '',
                fullText: p.description,
              }))
            );
            setOpen(true);
            setActiveIdx(-1);
          } else {
            setSuggestions([]);
            setOpen(false);
          }
        }
      );
    },
    [types]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 200);
  };

  const handleSelect = (suggestion: Suggestion) => {
    // Fill the input with just the city/place name
    const selected = suggestion.mainText;
    onChange(selected);
    onSelect?.(selected);

    // Try secondaryText first ("OR, USA"), then fall back to the full description
    // ("Portland, Oregon, United States") — covers every format Google returns
    const state = extractState(suggestion.secondaryText) || extractState(suggestion.fullText);
    if (state && onStateDetected) onStateDetected(state);

    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          aria-label={label}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          autoComplete="off"
          spellCheck={false}
          className={`${className} ${icon ? 'pl-8' : ''} ${value ? 'pr-8' : ''}`}
        />
        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div
          role="listbox"
          aria-label="Location suggestions"
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <button
              key={s.placeId}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                handleSelect(s);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                i === activeIdx ? 'bg-blue-50' : 'hover:bg-gray-50'
              } ${i > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <MapPin size={13} className="text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{s.mainText}</p>
                {s.secondaryText && (
                  <p className="text-xs text-gray-400 truncate">{s.secondaryText}</p>
                )}
              </div>
            </button>
          ))}
          <div className="flex items-center justify-end px-3 py-1.5 border-t border-gray-100 bg-gray-50">
            <span className="text-[10px] text-gray-400">powered by Google</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Public-facing wrapper that includes the APIProvider
interface LocationAutocompleteProps extends Omit<AutocompleteInputProps, 'icon'> {
  showIcon?: boolean;
  onStateDetected?: (state: string) => void;
}

export default function LocationAutocomplete({
  showIcon = true,
  ...props
}: LocationAutocompleteProps) {
  return (
    <APIProvider apiKey={API_KEY} libraries={['places']}>
      <AutocompleteInput {...props} icon={showIcon ? <Search size={13} /> : undefined} />
    </APIProvider>
  );
}
