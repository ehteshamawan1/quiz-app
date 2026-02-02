import React from "react";
import "../Input/Input.css"; // Reuse input styles if possible or define similar ones

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Array<{ value: string; label: string }>;
};

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <label className="nq-input">
      {label && <span className="nq-input__label">{label}</span>}
      <select className={["nq-input__field", className].filter(Boolean).join(" ")} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
