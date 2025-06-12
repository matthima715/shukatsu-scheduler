"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function TaskForm({ onAddTask }) {
  const { toast } = useToast()
  const [taskName, setTaskName] = useState("")
  const [company, setCompany] = useState("")
  const [date, setDate] = useState<Date>()
  const [status, setStatus] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!taskName || !company || !date || !status) {
      toast({
        title: "入力エラー",
        description: "すべての項目を入力してください",
        variant: "destructive",
      })
      return
    }

    const newTask = {
      id: Date.now(),
      task: taskName,
      company,
      date: new Date(date),
      status,
    }

    onAddTask(newTask)

    // Reset form
    setTaskName("")
    setCompany("")
    setDate(undefined)
    setStatus("")

    toast({
      title: "タスクを追加しました",
      description: `${taskName} (${company})`,
    })
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-blue-50 rounded-t-lg">
        <CardTitle className="text-blue-700">タスク登録</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="task">タスク名</Label>
            <Input
              id="task"
              placeholder="面接準備、エントリーシート提出など"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">企業名</Label>
            <Input
              id="company"
              placeholder="〇〇株式会社"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">締切日</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal" id="date">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ja }) : <span>日付を選択</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus locale={ja} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="未着手">未着手</SelectItem>
                <SelectItem value="対応中">対応中</SelectItem>
                <SelectItem value="完了">完了</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            追加
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
