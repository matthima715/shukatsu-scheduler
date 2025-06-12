import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <h1 className="text-xl font-bold text-blue-700">Shukatsu Scheduler</h1>
        </Link>
      </div>
    </header>
  )
}
