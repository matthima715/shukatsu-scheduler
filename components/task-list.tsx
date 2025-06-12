"use client"

import { Trash2, Pencil } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TaskList({ tasks = [], onDeleteTask, onEditTask, onStatusChange }) {
  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "未着手":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "対応中":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "完了":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  if (tasks.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader className="bg-blue-50 rounded-t-lg">
          <CardTitle className="text-blue-700">タスク一覧</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-500 text-center py-8">タスクはありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-blue-50 rounded-t-lg">
        <CardTitle className="text-blue-700">タスク一覧</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="p-3 bg-white border rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{task.task}</p>
                    <Badge className={cn("font-normal", getStatusColor(task.status))}>{task.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{task.company}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(task.date), "yyyy年MM月dd日", { locale: ja })}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t">
                    <Select value={task.status} onValueChange={(value) => onStatusChange(task.id, value)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue placeholder="ステータス変更" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="未着手">未着手</SelectItem>
                        <SelectItem value="対応中">対応中</SelectItem>
                        <SelectItem value="完了">完了</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => onEditTask && onEditTask(task)}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> 編集
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> 削除
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
