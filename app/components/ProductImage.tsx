import { ImageOff } from 'lucide-react';

/**
 * Product image served by the public website (or any https URL). A plain <img>: the images live
 * on another origin and are already sized for the web, so next/image optimisation adds nothing here.
 */
export default function ProductImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  if (!src) {
    return (
      <span className={`inline-flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        <ImageOff className="w-1/3 h-1/3" />
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={`object-cover bg-gray-100 ${className}`} />;
}
