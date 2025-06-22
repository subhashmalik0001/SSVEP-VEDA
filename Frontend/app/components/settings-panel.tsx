"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Volume2, Eye, Palette, Type, Monitor, Accessibility, Save } from "lucide-react"

interface User {
  id: string
  name: string
  role: "patient" | "caregiver" | "admin"
  customCommands: any[]
  settings: UserSettings
}

interface UserSettings {
  voiceEnabled: boolean
  language: string
  fontSize: "small" | "medium" | "large"
  boxSize: "small" | "medium" | "large"
  theme: "light" | "dark" | "high-contrast"
  mode: "basic" | "advanced" | "custom"
  eyeTrackingMode: boolean
}

interface SettingsPanelProps {
  user: User
  onUserUpdate: (user: User) => void
  onCommandsUpdate: (commands: any[]) => void
}

const languages = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
  { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
  { code: "fr-FR", name: "French", flag: "🇫🇷" },
  { code: "de-DE", name: "German", flag: "🇩🇪" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
  { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
]

export default function SettingsPanel({ user, onUserUpdate, onCommandsUpdate }: SettingsPanelProps) {
  const [settings, setSettings] = useState(user.settings)
  const [hasChanges, setHasChanges] = useState(false)

  const updateSetting = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    setHasChanges(true)
  }

  const saveSettings = () => {
    const updatedUser = { ...user, settings }
    onUserUpdate(updatedUser)
    setHasChanges(false)

    // Show success message
    if ("speechSynthesis" in window && settings.voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance("Settings saved successfully")
      utterance.lang = settings.language
      window.speechSynthesis.speak(utterance)
    }
  }

  const testVoice = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("This is a voice test")
      utterance.lang = settings.language
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-6">
      {/* Voice & Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-blue-600" />
            Voice & Audio Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Voice Feedback</h4>
              <p className="text-sm text-gray-500">Enable spoken confirmation of commands</p>
            </div>
            <Switch
              checked={settings.voiceEnabled}
              onCheckedChange={(checked) => updateSetting("voiceEnabled", checked)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Voice Language</label>
            <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={testVoice} disabled={!settings.voiceEnabled}>
              Test Voice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-600" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme
            </label>
            <Select
              value={settings.theme}
              onValueChange={(value: "light" | "dark" | "high-contrast") => updateSetting("theme", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light Theme</SelectItem>
                <SelectItem value="dark">Dark Theme</SelectItem>
                <SelectItem value="high-contrast">High Contrast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Size
            </label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: "small" | "medium" | "large") => updateSetting("fontSize", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Command Box Size</label>
            <Select
              value={settings.boxSize}
              onValueChange={(value: "small" | "medium" | "large") => updateSetting("boxSize", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (Compact)</SelectItem>
                <SelectItem value="medium">Medium (Standard)</SelectItem>
                <SelectItem value="large">Large (Accessible)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Interaction Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Interface Mode</label>
            <Select
              value={settings.mode}
              onValueChange={(value: "basic" | "advanced" | "custom") => updateSetting("mode", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (4 commands)</SelectItem>
                <SelectItem value="advanced">Advanced (8 commands)</SelectItem>
                <SelectItem value="custom">Custom (user-defined)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Eye Tracking Mode
              </h4>
              <p className="text-sm text-gray-500">Use hover instead of click for selection</p>
            </div>
            <Switch
              checked={settings.eyeTrackingMode}
              onCheckedChange={(checked) => updateSetting("eyeTrackingMode", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-blue-600" />
            Accessibility Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Screen Reader Support</h4>
              <p className="text-sm text-blue-700">Full ARIA labels and semantic HTML</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Keyboard Navigation</h4>
              <p className="text-sm text-green-700">Tab through all interactive elements</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">High Contrast Mode</h4>
              <p className="text-sm text-purple-700">Enhanced visibility for low vision</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900">Reduced Motion</h4>
              <p className="text-sm text-orange-700">Respects system motion preferences</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          {hasChanges && (
            <Badge variant="secondary" className="mr-2">
              Unsaved Changes
            </Badge>
          )}
          <span className="text-sm text-gray-600">
            {hasChanges ? "You have unsaved changes" : "All settings saved"}
          </span>
        </div>
        <Button onClick={saveSettings} disabled={!hasChanges} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
