import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-base", md: "text-xl", lg: "text-3xl" };
  return (
    <Link href="/" className={`font-syne font-black tracking-tight ${sizes[size]} text-white`}>
      Neural<span className="text-accent">Hub</span>
      <span className="text-muted font-normal">.ai</span>
    </Link>
  );
}
