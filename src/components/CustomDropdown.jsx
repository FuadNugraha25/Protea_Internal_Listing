import React, { useState, useRef, useEffect, useCallback } from 'react';
import './CustomDropdown.css';

/**
 * CustomDropdown Component
 * 
 * @param {Object} props
 * @param {Array} props.options - Array of options { value, label } or strings
 * @param {string|number} props.value - Selected value
 * @param {Function} props.onChange - Selection change callback
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional class names
 * @param {Object} props.style - Inline styles for the container
 */
const CustomDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
  style = {},
  searchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);

  // Normalize options to [{ value, label }]
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') return { value: opt, label: opt };
    return opt;
  });

  const filteredOptions = searchable && searchQuery
    ? normalizedOptions.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : normalizedOptions;

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(prev => {
        if (!prev) setSearchQuery('');
        return !prev;
      });
    }
  };

  const selectOption = (option) => {
    if (onChange) {
      onChange(option.value);
    }
    setIsOpen(false);
  };

  const handleClickOutside = useCallback((event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0) {
        selectOption(normalizedOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev => (prev < normalizedOptions.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex];
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Reset highlighted index when opening
  useEffect(() => {
    if (isOpen) {
      const selectedIdx = filteredOptions.findIndex(opt => opt.value === value);
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
      if (searchable) setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  return (
    <div 
      className={`custom-dropdown-container ${isOpen ? 'is-open' : ''} ${className}`}
      ref={containerRef}
      style={style}
    >
      <div 
        className={`custom-dropdown-trigger ${disabled ? 'is-disabled' : ''}`}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="custom-dropdown-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="custom-dropdown-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="custom-dropdown-menu">
          {searchable && (
            <div className="custom-dropdown-search">
              <input
                ref={searchRef}
                type="text"
                className="custom-dropdown-search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
          <ul
            className="custom-dropdown-options-list"
            ref={listRef}
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <li className="custom-dropdown-option" style={{ opacity: 0.4, cursor: 'default' }}>No results</li>
            ) : filteredOptions.map((option, index) => (
              <li
                key={option.value}
                className={`custom-dropdown-option ${value === option.value ? 'is-selected' : ''} ${highlightedIndex === index ? 'is-highlighted' : ''}`}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
