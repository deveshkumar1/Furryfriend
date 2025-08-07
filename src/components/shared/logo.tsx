import { PawPrint } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  href?: string;
}

export function Logo({ className, iconSize = 28, textSize = "text-2xl", href = "/dashboard" }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-2 font-bold ${className} text-primary hover:text-primary/90 transition-colors`}>
      <PawPrint size={iconSize} strokeWidth={2.5} />
      <span className={textSize}>FurryFriend</span>
    </Link>
  );
}
