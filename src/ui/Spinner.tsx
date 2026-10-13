/** Three quiet dots, like a pen about to write. Static under reduced motion (see globals.css). */
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-current"
          style={{ animation: "dot 1.1s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
