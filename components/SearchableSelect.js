"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, Loader2 } from 'lucide-react';

const SearchableSelect = ({
  options = [],
  value = "",
  onChange,
  onSearch,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  loading = false,
  error = null,
  disabled = false,
  required = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => String(opt.id) === String(value));

  // Filter options locally if no onSearch is provided
  const filteredOptions = onSearch 
    ? options 
    : options.filter(opt => 
        (opt.displayName || "").toLowerCase().includes(searchTerm.toLowerCase())
      );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  const handleSelect = (option) => {
    onChange(option.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm transition-all cursor-pointer space-gap-2
          ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : 'hover:border-primary'}
          ${isOpen ? 'ring-1 ring-primary border-primary' : 'border-input'}
        `}
      >
        <span className={`truncate flex-1 ${!selectedOption ? 'text-muted-foreground' : 'text-foreground'}`}>
          {selectedOption ? selectedOption.displayName : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selectedOption && !disabled && !required && (
            <X 
              size={14} 
              className="text-muted-foreground hover:text-foreground" 
              onClick={clearSelection}
            />
          )}
          {loading ? (
            <Loader2 size={16} className="text-muted-foreground animate-spin" />
          ) : (
            <ChevronDown 
              size={16} 
              className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border shadow-lg rounded-md animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                type="text"
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                    ${String(option.id) === String(value) ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}
                  `}
                >
                  <span className="truncate">{option.displayName}</span>
                  {String(option.id) === String(value) && <Check size={14} className="shrink-0" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
