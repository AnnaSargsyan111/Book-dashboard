/** Field label with an optional quiet tag such as "Optional". `hidden` keeps it in the DOM (so the field still
 *  has its accessible name) but visually hides it — for a layout where a heading elsewhere already shows the
 *  same text, such as About Me's editorial sections. */
export function FieldLabel({ htmlFor, id, children, tag, hidden }: { htmlFor?: string; id?: string; children: string; tag?: string; hidden?: boolean }) {
  return (
    <label htmlFor={htmlFor} id={id} className={hidden ? "sr-only" : "mb-1.5 flex items-baseline gap-2 text-sm font-medium text-ink-2"}>
      <span>{children}</span>
      {tag ? <span className="text-xs font-normal text-muted">{tag}</span> : null}
    </label>
  );
}
