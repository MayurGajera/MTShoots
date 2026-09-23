import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 sm:h-11 w-full rounded-xl border border-[#E7E1DA] bg-white px-3.5 py-2 text-xs sm:text-sm shadow-xs transition-all placeholder:text-[#8a726a]/60 placeholder:font-normal focus-visible:outline-none focus-visible:border-[#C85A32] focus-visible:ring-2 focus-visible:ring-[#C85A32]/25 disabled:cursor-not-allowed disabled:opacity-50 text-[#181615]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
