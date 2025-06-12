"use client"

import { useState } from "react"
import { ja } from "date-fns/locale"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { TaskCard } from "@/components/task/task-card"

export function Calendar({ tasks = [], onDateSelect, onEditTask, onDeleteTask, onStatusChange }) {
  const [date, setDate] = useState<Date>(new Date())

  // Get tasks for the selected date
  const selectedDateTasks = tasks.filter(
    (task) =>
      task.date.getDate() === date?.getDate() &&
      task.date.getMonth() === date?.getMonth() &&
      task.date.getFullYear() === date?.getFullYear(),
  )

  // Function to render date cell content
  const renderDateContent = (date: Date) => {
    const dayTasks = tasks.filter(
      (task) =>
        task.date.getDate() === date.getDate() &&
        task.date.getMonth() === date.getMonth() &&
        task.date.getFullYear() === date.getFullYear(),
    )

    if (dayTasks.length > 0) {
      return (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center">
          {dayTasks.length === 1 ? (
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
          ) : dayTasks.length === 2 ? (
            <div className="flex space-x-1">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            </div>
          ) : (
            <div className="flex space-x-1">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      if (onDateSelect) {
        onDateSelect(newDate)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader className="bg-blue-50 rounded-t-lg">
          <CardTitle className="text-blue-700">カレンダー</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {tasks.length === 0 && (
            <div className="text-center py-8 mb-6 border rounded-lg bg-white">
              <p className="text-gray-500">まだタスクが登録されていません</p>
              <p className="text-sm text-gray-400 mt-1">左側のフォームからタスクを追加してください</p>
            </div>
          )}

          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            locale={ja}
            className="rounded-md border w-full mx-auto"
            modifiers={{
              weekend: (date) => {
                const day = date.getDay()
                return day === 0 || day === 6
              },
            }}
            modifiersClassNames={{
              selected: "bg-blue-100 text-blue-900 hover:bg-blue-100 rounded-full",
              weekend: "text-gray-500 bg-gray-50",
            }}
            components={{
              DayContent: ({ date }) => (
                <div className="relative h-full w-full flex items-center justify-center">
                  <span>{date.getDate()}</span>
                  {renderDateContent(date)}
                </div>
              ),
            }}
            styles={{
              month: { width: "100%" },
              table: { width: "100%" },
              head_cell: { width: "calc(100% / 7)" },
              cell: { width: "calc(100% / 7)" },
              day: { width: "100%" },
            }}
          />
        </CardContent>
      </Card>

      {/* Selected date tasks */}
      <Card className="shadow-md">
        <CardHeader className="bg-blue-50 rounded-t-lg">
          <CardTitle className="text-blue-700">
            {date ? format(new Date(date), "M月d日のタスク", { locale: ja }) : "選択された日付のタスク"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {selectedDateTasks.length > 0 ? (
            <div className="space-y-4">
              {selectedDateTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-white">
              <p className="text-gray-500">この日のタスクはありません</p>
              <p className="text-sm text-gray-400 mt-1">左側のフォームからタスクを追加してください</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
