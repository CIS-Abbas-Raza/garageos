import Image from 'next/image'

export function BrandLoader({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-white px-6 ${className}`}
      role="status"
      aria-label="Loading GarageWorkOs"
    >
      <div className="flex w-full max-w-xs flex-col items-center">
        <div className="flex size-20 items-center justify-center rounded-full border border-blue-100 bg-blue-50 shadow-[0_4px_18px_rgba(37,99,235,0.10)]">
          <Image
            src="/garageworkos-logo.png"
            alt=""
            width={64}
            height={32}
            priority
            className="h-9 w-9 object-contain"
          />
        </div>
        <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-2/5 rounded-full bg-[#2563eb] motion-safe:animate-[brand-loader_1.5s_ease-in-out_infinite]" />
        </div>
        <p className="mt-8 text-lg font-bold tracking-tight text-[#0b1220]">
          <span className="text-[#2563eb]">GarageWork</span>Os
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
          Workshop Management System
        </p>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}
