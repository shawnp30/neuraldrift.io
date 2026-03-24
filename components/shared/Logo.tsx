import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-base", md: "text-xl", lg: "text-3xl" };
  const iconSizes = { sm: 16, md: 24, lg: 32 };
  return (
    <Link href="/" className={`font-syne font-black tracking-tight ${sizes[size]} text-white flex items-center gap-2`}>
      <BrainCircuit size={iconSizes[size]} className="text-accent" />
      <span>neural<span className="text-accent">drift</span></span>
    </Link>
  );
}
