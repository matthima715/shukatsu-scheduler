import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold text-blue-700 md:text-2xl">Shukatsu Scheduler</h1>
        <Button variant="outline" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
          ログイン
        </Button>
      </div>
    </header>
  )
}
