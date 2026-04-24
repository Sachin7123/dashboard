export function Pagination({
  page,
  pageCount,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
}) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).slice(
    Math.max(0, page - 3),
    Math.max(5, Math.min(pageCount, page + 2)),
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-3 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-xl border border-white/8 px-3 py-2 text-xs text-text-muted transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <div className="flex items-center gap-2">
          {pages.map((item) => (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`h-9 min-w-9 rounded-xl border px-3 text-xs transition ${
                item === page
                  ? "border-accent-live/24 bg-accent-live/10 text-accent-live"
                  : "border-white/8 bg-white/[0.03] text-text-muted hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          className="rounded-xl border border-white/8 px-3 py-2 text-xs text-text-muted transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <label className="flex items-center gap-2 text-xs text-text-muted">
        Page size
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-xl border border-white/8 bg-black/25 px-3 py-2 text-xs text-white outline-none"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
