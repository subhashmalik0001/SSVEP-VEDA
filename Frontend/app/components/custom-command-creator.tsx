"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Save, X, Palette, Zap, Type, MessageSquare } from "lucide-react"

interface User {
  id: string
  name: string
  role: "patient" | "caregiver" | "admin"
  customCommands: Command[]
  settings: any
}

interface Command {
  id: string
  name: string
  frequency: number
  color: string
  gradient: string
  icon: string
  description: string
  isCustom?: boolean
  category?: string
}

interface CustomCommandCreatorProps {
  user: User
  onUserUpdate: (user: User) => void
  existingCommands: Command[]
}

const colorOptions = [
  { name: "Blue", color: "bg-blue-500", gradient: "from-blue-400 to-blue-600" },
  { name: "Green", color: "bg-green-500", gradient: "from-green-400 to-green-600" },
  { name: "Red", color: "bg-red-500", gradient: "from-red-400 to-red-600" },
  { name: "Purple", color: "bg-purple-500", gradient: "from-purple-400 to-purple-600" },
  { name: "Orange", color: "bg-orange-500", gradient: "from-orange-400 to-orange-600" },
  { name: "Pink", color: "bg-pink-500", gradient: "from-pink-400 to-pink-600" },
  { name: "Teal", color: "bg-teal-500", gradient: "from-teal-400 to-teal-600" },
  { name: "Indigo", color: "bg-indigo-500", gradient: "from-indigo-400 to-indigo-600" },
]

const iconOptions = ["🏠", "🍽️", "🚿", "📺", "🌡️", "💊", "📞", "🚨", "💡", "🎵", "📖", "☕"]

export default function CustomCommandCreator({ user, onUserUpdate, existingCommands }: CustomCommandCreatorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    frequency: "",
    description: "",
    icon: "🔧",
    color: "bg-blue-500",
    gradient: "from-blue-400 to-blue-600",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      frequency: "",
      description: "",
      icon: "🔧",
      color: "bg-blue-500",
      gradient: "from-blue-400 to-blue-600",
    })
  }

  const getUsedFrequencies = () => {
    return [...existingCommands, ...user.customCommands].map((cmd) => cmd.frequency)
  }

  const isFrequencyAvailable = (freq: number) => {
    return !getUsedFrequencies().includes(freq)
  }

  const createCommand = () => {
    if (!formData.name || !formData.frequency) return

    const frequency = Number.parseInt(formData.frequency)
    if (!isFrequencyAvailable(frequency)) {
      alert("This frequency is already in use. Please choose a different one.")
      return
    }

    const newCommand: Command = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      frequency: frequency,
      color: formData.color,
      gradient: formData.gradient,
      icon: formData.icon,
      description: formData.description,
      isCustom: true,
      category: "custom",
    }

    const updatedUser = {
      ...user,
      customCommands: [...user.customCommands, newCommand],
    }

    onUserUpdate(updatedUser)
    resetForm()
    setIsCreating(false)
  }

  const editCommand = (command: Command) => {
    setFormData({
      name: command.name,
      frequency: command.frequency.toString(),
      description: command.description,
      icon: command.icon,
      color: command.color,
      gradient: command.gradient,
    })
    setEditingId(command.id)
    setIsCreating(true)
  }

  const updateCommand = () => {
    if (!formData.name || !formData.frequency || !editingId) return

    const frequency = Number.parseInt(formData.frequency)
    const otherFrequencies = getUsedFrequencies().filter(
      (f) => f !== user.customCommands.find((cmd) => cmd.id === editingId)?.frequency,
    )

    if (otherFrequencies.includes(frequency)) {
      alert("This frequency is already in use. Please choose a different one.")
      return
    }

    const updatedCommands = user.customCommands.map((cmd) =>
      cmd.id === editingId
        ? {
            ...cmd,
            name: formData.name,
            frequency: frequency,
            description: formData.description,
            icon: formData.icon,
            color: formData.color,
            gradient: formData.gradient,
          }
        : cmd,
    )

    const updatedUser = {
      ...user,
      customCommands: updatedCommands,
    }

    onUserUpdate(updatedUser)
    resetForm()
    setIsCreating(false)
    setEditingId(null)
  }

  const deleteCommand = (commandId: string) => {
    const updatedCommands = user.customCommands.filter((cmd) => cmd.id !== commandId)
    const updatedUser = {
      ...user,
      customCommands: updatedCommands,
    }
    onUserUpdate(updatedUser)
  }

  const cancelEdit = () => {
    resetForm()
    setIsCreating(false)
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Create/Edit Command Form */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            {editingId ? "Edit Custom Command" : "Create Custom Command"}
          </CardTitle>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Command
            </Button>
          )}
        </CardHeader>

        {isCreating && (
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Command Name
                </label>
                <Input
                  placeholder="e.g., Turn on TV"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Frequency (Hz)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  min="1"
                  max="50"
                />
                {formData.frequency && !isFrequencyAvailable(Number.parseInt(formData.frequency)) && (
                  <p className="text-sm text-red-600">This frequency is already in use</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Description
              </label>
              <Textarea
                placeholder="Describe what this command does..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Visual Customization */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Visual Appearance
              </h4>

              {/* Icon Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`p-3 text-2xl border rounded-lg hover:bg-gray-50 ${
                        formData.icon === icon ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                      onClick={() => setFormData({ ...formData, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Color Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      className={`p-3 rounded-lg border ${
                        formData.color === option.color ? "border-gray-800 ring-2 ring-gray-300" : "border-gray-200"
                      }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          color: option.color,
                          gradient: option.gradient,
                        })
                      }
                    >
                      <div className={`w-full h-8 rounded bg-gradient-to-r ${option.gradient}`}></div>
                      <p className="text-xs mt-1">{option.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <div className="flex justify-center">
                <div className="w-48">
                  <div
                    className={`bg-gradient-to-br ${formData.gradient} h-32 flex flex-col items-center justify-center rounded-lg`}
                  >
                    <div className="text-white text-center">
                      <div className="text-3xl mb-2">{formData.icon}</div>
                      <div className="text-lg font-bold">{formData.name || "Command Name"}</div>
                      <div className="text-sm opacity-90">{formData.frequency || "0"} Hz</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-t-0 rounded-b-lg">
                    <p className="text-sm text-gray-600 text-center">{formData.description || "Command description"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={editingId ? updateCommand : createCommand}
                disabled={
                  !formData.name ||
                  !formData.frequency ||
                  (formData.frequency && !isFrequencyAvailable(Number.parseInt(formData.frequency)) && !editingId)
                }
              >
                <Save className="h-4 w-4 mr-2" />
                {editingId ? "Update Command" : "Create Command"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Existing Custom Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Your Custom Commands ({user.customCommands.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.customCommands.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No custom commands yet</p>
              <p className="text-gray-400">Create your first custom command to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.customCommands.map((command) => (
                <div key={command.id} className="border rounded-lg overflow-hidden">
                  <div className={`bg-gradient-to-br ${command.gradient} h-24 flex items-center justify-center`}>
                    <div className="text-white text-center">
                      <div className="text-2xl mb-1">{command.icon}</div>
                      <div className="text-sm font-bold">{command.name}</div>
                      <div className="text-xs opacity-90">{command.frequency} Hz</div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-600 mb-3">{command.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editCommand(command)} className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCommand(command.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frequency Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Frequency Usage Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Used Frequencies</h4>
              <div className="space-y-2">
                {getUsedFrequencies()
                  .sort((a, b) => a - b)
                  .map((freq) => {
                    const command = [...existingCommands, ...user.customCommands].find((cmd) => cmd.frequency === freq)
                    return (
                      <div key={freq} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{command?.name}</span>
                        <Badge variant="outline">{freq} Hz</Badge>
                      </div>
                    )
                  })}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Use frequencies between 8-30 Hz for optimal SSVEP response</p>
                <p>• Avoid frequencies too close to each other (minimum 2 Hz difference)</p>
                <p>• Higher frequencies (20+ Hz) may be less comfortable for extended use</p>
                <p>• Test new frequencies with short sessions first</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
