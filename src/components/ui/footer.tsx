import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type FooterLink = { title: string; href: string };
export type FooterSocial = { label: string; href: string; icon: LucideIcon };

type FooterSectionProps = {
  links: FooterLink[];
  socials?: FooterSocial[];
  note?: React.ReactNode;
  copyright: string;
  logo?: React.ReactNode;
  className?: string;
};

/**
 * Centered footer from 21st.dev (Tailark), adapted for Sawa: links and icons come from props,
 * so nothing points at "#". External links open in a new tab with a descriptive label.
 */
export default function FooterSection({ links, socials = [], note, copyright, logo, className }: FooterSectionProps) {
  return (
    <footer className={cn("py-10 md:py-16", className)}>
      <div className="mx-auto max-w-5xl px-6">
        {logo && (
          <Link href="/" aria-label="Sawa home" className="mx-auto block size-fit">
            {logo}
          </Link>
        )}

        <nav aria-label="Footer" className="my-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
          {links.map((link) => (
            <Link key={link.href + link.title} href={link.href} className="rounded-sm font-medium text-muted-foreground duration-150 hover:text-blue-600">
              {link.title}
            </Link>
          ))}
        </nav>

        {socials.length > 0 && (
          <div className="my-6 flex flex-wrap justify-center gap-3 text-sm">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in a new tab)`}
                title={label}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-white/50 text-muted-foreground transition hover:-translate-y-0.5 hover:bg-white hover:text-pink-600"
              >
                <Icon className="size-5" aria-hidden />
              </a>
            ))}
          </div>
        )}

        {note && <p className="mx-auto mb-3 max-w-sm text-center text-xs text-muted-foreground">{note}</p>}
        <span className="block text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {copyright}
        </span>
      </div>
    </footer>
  );
}
