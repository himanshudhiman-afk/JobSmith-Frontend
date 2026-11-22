export function BrandLogo({ className = "", compactOnMobile = false }) {
  return (
    <span className={`inline-flex shrink-0 items-center ${className}`} aria-label="JobSmith">
      <img
        src="/jobsmith-logo.svg"
        alt="JobSmith"
        className={compactOnMobile ? "hidden h-10 w-auto sm:block" : "h-10 w-auto"}
      />
      {compactOnMobile && (
        <img src="/jobsmith-icon.svg" alt="JobSmith" className="h-9 w-9 sm:hidden" />
      )}
    </span>
  );
}
