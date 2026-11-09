import type { InputHTMLAttributes } from "react";
import Icon, { type IconName } from "./Icon";

type FieldProps = {
  label: string;
  id: string;
  hint?: string;
  icon?: IconName;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Field({ label, id, hint, icon, className = "", ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <Icon
            name={icon}
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          />
        ) : null}
        <input
          id={id}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`h-12 w-full rounded-md border border-line bg-white pr-3 text-base text-ink outline-none placeholder:text-muted/70 focus:border-navy focus:ring-2 focus:ring-navy/25 ${
            icon ? "pl-11" : "pl-3.5"
          } ${className}`}
          {...props}
        />
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
