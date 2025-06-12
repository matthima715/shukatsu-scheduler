"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Calendar } from "@/components/calendar/calendar"
import { TaskForm } from "@/components/task/task-form"
import { useToast } from "@/hooks/use-toast"

// Empty initial data
const initialTasks = []

export default function HomePage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Add new task
  const handleAddTask = (newTask) => {
    setTasks([...tasks, newTask])
    toast({
      title: "タスクを追加しました",
      description: `${newTask.task} (${newTask.company})`,
    })
  }

  // Delete task
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    toast({
      title: "タスクを削除しました",
      description: "タスクがカレンダーから削除されました",
    })
  }

  // Edit task
  const handleEditTask = (editedTask) => {
    setTasks(tasks.map((task) => (task.id === editedTask.id ? editedTask : task)))
    toast({
      title: "タスクを更新しました",
      description: `${editedTask.task} (${editedTask.company})`,
    })
  }

  // Change task status
  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
    toast({
      title: "ステータスを変更しました",
      description: `新しいステータス: ${newStatus}`,
    })
  }

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <TaskForm onAddTask={handleAddTask} />
          </div>
          <div>
            <Calendar
              tasks={tasks}
              onDateSelect={handleDateSelect}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
