import React from "react";
import "./Input.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="nq-input">
      {label && <span className="nq-input__label">{label}</span>}
      <input className={["nq-input__field", className].filter(Boolean).join(" ")} {...props} />
    </label>
  );
}
