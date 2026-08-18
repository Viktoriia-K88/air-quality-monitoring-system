import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import type { DistrictKey } from "../../constants/districts";
import { districts } from "../../constants/districts";

import "./DistrictSelect.scss";

type DistrictSelectProps = {
  value: DistrictKey;
  onChange: (district: DistrictKey) => void;
};

const districtKeys = Object.keys(districts) as DistrictKey[];

function DistrictSelect({ value, onChange }: DistrictSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // close dropdown on outside click or escape

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleOutsideClick(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function selectDistrict(district: DistrictKey) {
    onChange(district);

    setIsOpen(false);

    triggerRef.current?.focus();
  }

  return (
    <div className="district-select" ref={selectRef}>
      <button
        ref={triggerRef}
        className={`district-select__trigger ${
          isOpen ? "district-select__trigger--open" : ""
        }`}
        type="button"
        aria-label="Select district"
        aria-expanded={isOpen}
        aria-controls="district-options"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{value}</span>

        <ChevronDown
          className={`district-select__chevron ${
            isOpen ? "district-select__chevron--open" : ""
          }`}
          size={17}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div id="district-options" className="district-select__menu">
          {districtKeys.map((district) => {
            const isSelected = district === value;

            return (
              <button
                key={district}
                className={`district-select__option ${
                  isSelected ? "district-select__option--selected" : ""
                }`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => selectDistrict(district)}
              >
                <span>{district}</span>

                {isSelected && (
                  <Check size={16} strokeWidth={2} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DistrictSelect;
