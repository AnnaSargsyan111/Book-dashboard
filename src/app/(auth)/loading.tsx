/** Skeleton shown while an auth screen loads: same rhythm as the real form, so nothing jumps when it arrives. */
export default function AuthLoading() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-5">
      <div className="mb-3 space-y-3">
        <div className="skeleton h-11 w-4/5" />
        <div className="skeleton h-5 w-3/5" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="skeleton h-[4.6rem]" />
        <div className="skeleton h-[4.6rem]" />
      </div>
      <div className="skeleton h-[4.6rem]" />
      <div className="skeleton h-[4.6rem]" />
      <div className="skeleton mt-1 h-[3.125rem]" />
    </div>
  );
}
