'use client';

import { CSSProperties, useEffect, useId, useMemo, useRef, useState } from 'react';

export interface PremiumSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface PremiumSelectProps {
  value: string;
  options: PremiumSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

export function PremiumSelect({
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  ariaLabel,
  className = '',
  style,
  disabled = false,
}: PremiumSelectProps) {
  const selectId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      return;
    }

    const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);
    const firstEnabledIndex = options.findIndex((option) => !option.disabled);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex);
  }, [open, options, value]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;

    const activeButton = menuRef.current?.querySelector<HTMLButtonElement>(`[data-option-index="${activeIndex}"]`);
    activeButton?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const commitValue = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  const moveActiveIndex = (direction: 1 | -1) => {
    if (!options.length) return;

    let nextIndex = activeIndex;
    for (let step = 0; step < options.length; step += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;
      if (!options[nextIndex]?.disabled) {
        setActiveIndex(nextIndex);
        return;
      }
    }
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      moveActiveIndex(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      moveActiveIndex(-1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (activeIndex >= 0 && !options[activeIndex]?.disabled) {
        commitValue(options[activeIndex].value);
      }
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActiveIndex(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActiveIndex(-1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (activeIndex >= 0 && !options[activeIndex]?.disabled) {
        commitValue(options[activeIndex].value);
      }
      return;
    }

    if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`premium-select ${open ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`.trim()} style={style}>
      <button
        type="button"
        id={selectId}
        className={`premium-select-trigger ${selectedOption ? '' : 'is-placeholder'}`.trim()}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${selectId}-menu`}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="premium-select-content">
          <span className="premium-select-label">{selectedOption?.label ?? placeholder}</span>
          {selectedOption?.description ? (
            <span className="premium-select-description">{selectedOption.description}</span>
          ) : null}
        </span>
        <span className="premium-select-chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={`${selectId}-menu`}
          className="premium-select-menu"
          role="listbox"
          aria-labelledby={selectId}
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <button
                key={`${selectId}-${option.value || index}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`premium-select-option ${isSelected ? 'is-selected' : ''} ${isActive ? 'is-active' : ''}`.trim()}
                data-option-index={index}
                disabled={option.disabled}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commitValue(option.value)}
              >
                <span className="premium-select-option-copy">
                  <span className="premium-select-option-label">{option.label}</span>
                  {option.description ? (
                    <span className="premium-select-option-description">{option.description}</span>
                  ) : null}
                </span>
                {isSelected ? <span className="premium-select-check">✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
