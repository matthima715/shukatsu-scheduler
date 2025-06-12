"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon, Pencil, Save, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState({ ...task })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Function to get status color
  const getStatusColor = (status) => {
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

  // Start editing
  const handleEditClick = () => {
    setIsEditing(true)
    setEditedTask({ ...task })
  }

  // Save edited task
  const handleSaveClick = () => {
    onEdit(editedTask)
    setIsEditing(false)
  }

  // Cancel editing
  const handleCancelClick = () => {
    setIsEditing(false)
  }

  // Handle status change
  const handleStatusChange = (newStatus) => {
    onStatusChange(task.id, newStatus)
  }

  // Open delete confirmation
  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true)
  }

  // Confirm delete
  const handleConfirmDelete = () => {
    onDelete(task.id)
    setDeleteConfirmOpen(false)
  }

  return (
    <>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        {isEditing ? (
          // Edit mode
          <div className="space-y-3">
            <div>
              <Input
                placeholder="タスク名"
                value={editedTask.task}
                onChange={(e) => setEditedTask({ ...editedTask, task: e.target.value })}
                className="mb-2"
              />
              <Input
                placeholder="企業名"
                value={editedTask.company}
                onChange={(e) => setEditedTask({ ...editedTask, company: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex-1 min-w-[200px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTask.date ? (
                        format(new Date(editedTask.date), "yyyy年MM月dd日", { locale: ja })
                      ) : (
                        <span>日付を選択</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(editedTask.date)}
                      onSelect={(date) => setEditedTask({ ...editedTask, date })}
                      initialFocus
                      locale={ja}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 min-w-[150px]">
                <Select
                  value={editedTask.status}
                  onValueChange={(value) => setEditedTask({ ...editedTask, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="未着手">未着手</SelectItem>
                    <SelectItem value="対応中">対応中</SelectItem>
                    <SelectItem value="完了">完了</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCancelClick}>
                <X className="h-4 w-4 mr-1" /> キャンセル
              </Button>
              <Button size="sm" onClick={handleSaveClick}>
                <Save className="h-4 w-4 mr-1" /> 保存
              </Button>
            </div>
          </div>
        ) : (
          // View mode
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium">{task.task}</h3>
                <p className="text-sm text-gray-600">{task.company}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(task.date), "yyyy年MM月dd日", { locale: ja })}
                </p>
              </div>
              <Badge className={cn("font-normal", getStatusColor(task.status))}>{task.status}</Badge>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t">
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="ステータス変更" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="未着手">未着手</SelectItem>
                  <SelectItem value="対応中">対応中</SelectItem>
                  <SelectItem value="完了">完了</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="h-9" onClick={handleEditClick}>
                <Pencil className="h-4 w-4 mr-1" /> 編集
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4 mr-1" /> 削除
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{task.task}」（{task.company}）を削除します。
              <br />
              この操作は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
