import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all",
          "hover:bg-emerald-700 hover:shadow-emerald-500/30",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "dark:focus:ring-offset-slate-900",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
