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
      <div className="bg-amber-50 border-y border-amber-200">
        <div className="container mx-auto px-4 py-2 text-center text-amber-800 text-sm">
          ⚠️ このサイトは自主学習用のデモです。入力した内容は保存されません。
        </div>
      </div>
    </header>
  )
}
