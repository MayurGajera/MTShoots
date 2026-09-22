import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#181615] text-white shadow-xs",
        secondary: "border-transparent bg-[#F4EFEB] text-[#181615]",
        terracotta: "border-[#dec0b7] bg-[#fbf2ee] text-[#9f3c16]",
        success: "border-[#D1E6D6] bg-[#EAF4ED] text-[#2D593E]",
        warning: "border-[#faebd7] bg-[#FBF3E8] text-[#8C531B]",
        destructive: "border-transparent bg-red-100 text-red-800",
        outline: "border-[#E7E1DA] text-[#57423b]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
