import Link from 'next/link';

/** "DUHINGENEZA SHOP" on two lines in bold brand green, as on the website. */
export default function Logo({ className = '', href }: { className?: string; href?: string }) {
  const text = (
    <span className={`block text-[#47A15E] font-bold leading-tight ${className}`}>
      DUHINGENEZA
      <br />
      SHOP
    </span>
  );
  return href ? (
    <Link href={href} aria-label="Duhingeneza Shop admin home">
      {text}
    </Link>
  ) : (
    text
  );
}
