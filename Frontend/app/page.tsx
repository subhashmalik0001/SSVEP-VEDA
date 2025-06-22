"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trash2,
  Volume2,
  Activity,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  Settings,
  BarChart3,
  Users,
  Plus,
  Shield,
  Download,
  Brain,
} from "lucide-react"
import SettingsPanel from "./components/settings-panel"
import AdminDashboard from "./components/admin-dashboard"
import AnalyticsDashboard from "./components/analytics-dashboard"
import UserProfiles from "./components/user-profiles"
import CustomCommandCreator from "./components/custom-command-creator"
import { Clock as CustomClock } from './components/Clock'

interface Selection {
  id: string
  command: string
  frequency: number
  timestamp: Date
  userId?: string
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

interface User {
  id: string
  name: string
  role: "patient" | "caregiver" | "admin"
  customCommands: Command[]
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

const defaultCommands: Command[] = [
  {
    id: "yes",
    name: "Yes",
    frequency: 10,
    color: "bg-emerald-500",
    gradient: "from-emerald-400 to-emerald-600",
    icon: "✓",
    description: "Confirm or agree",
    category: "basic",
  },
  {
    id: "no",
    name: "No",
    frequency: 12,
    color: "bg-rose-500",
    gradient: "from-rose-400 to-rose-600",
    icon: "✗",
    description: "Decline or disagree",
    category: "basic",
  },
  {
    id: "water",
    name: "Water",
    frequency: 15,
    color: "bg-blue-500",
    gradient: "from-blue-400 to-blue-600",
    icon: "💧",
    description: "Request water",
    category: "basic",
  },
  {
    id: "help",
    name: "Help",
    frequency: 17,
    color: "bg-amber-500",
    gradient: "from-amber-400 to-amber-600",
    icon: "🆘",
    description: "Call for assistance",
    category: "basic",
  },
]

const advancedCommands: Command[] = [
  ...defaultCommands,
  {
    id: "food",
    name: "Food",
    frequency: 20,
    color: "bg-orange-500",
    gradient: "from-orange-400 to-orange-600",
    icon: "🍽️",
    description: "Request food",
    category: "advanced",
  },
  {
    id: "bathroom",
    name: "Bathroom",
    frequency: 22,
    color: "bg-purple-500",
    gradient: "from-purple-400 to-purple-600",
    icon: "🚻",
    description: "Need bathroom",
    category: "advanced",
  },
  {
    id: "pain",
    name: "Pain",
    frequency: 25,
    color: "bg-red-600",
    gradient: "from-red-500 to-red-700",
    icon: "⚡",
    description: "Experiencing pain",
    category: "advanced",
  },
  {
    id: "doctor",
    name: "Doctor",
    frequency: 27,
    color: "bg-teal-500",
    gradient: "from-teal-400 to-teal-600",
    icon: "👨‍⚕️",
    description: "Call doctor",
    category: "advanced",
  },
]

export default function SSVEPInterface() {
  const [currentCommand, setCurrentCommand] = useState<string>("")
  const [selections, setSelections] = useState<Selection[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingCommand, setProcessingCommand] = useState<string>("")
  const [systemStatus, setSystemStatus] = useState<"ready" | "processing" | "success" | "error">("ready")
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("connected")

  // User and Settings State
  const [currentUser, setCurrentUser] = useState<User>({
    id: "patient-1",
    name: "Patient Demo",
    role: "patient",
    customCommands: [],
    settings: {
      voiceEnabled: true,
      language: "en-US",
      fontSize: "medium",
      boxSize: "medium",
      theme: "light",
      mode: "basic",
      eyeTrackingMode: false,
    },
  })

  const [activeTab, setActiveTab] = useState("interface")
  const [commands, setCommands] = useState<Command[]>(defaultCommands)

  // Update commands based on mode
  useEffect(() => {
    switch (currentUser.settings.mode) {
      case "basic":
        setCommands(defaultCommands)
        break
      case "advanced":
        setCommands(advancedCommands)
        break
      case "custom":
        setCommands([...defaultCommands, ...currentUser.customCommands])
        break
    }
  }, [currentUser.settings.mode, currentUser.customCommands])

  // System heartbeat simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus("connected")
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleCommandSelect = async (command: Command, isHover = false) => {
    if (currentUser.settings.eyeTrackingMode && !isHover) return
    if (!currentUser.settings.eyeTrackingMode && isHover) return

    setIsProcessing(true)
    setProcessingCommand(command.name)
    setSystemStatus("processing")

    try {
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }

      const response = await fetch("/api/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          frequency: command.frequency,
          userId: currentUser.id,
          commandId: command.id,
        }),
      })

      const data = await response.json()

      if (data.command) {
        setCurrentCommand(data.command)
        setSystemStatus("success")

        const newSelection: Selection = {
          id: Date.now().toString(),
          command: data.command,
          frequency: command.frequency,
          timestamp: new Date(),
          userId: currentUser.id,
        }
        setSelections((prev) => [newSelection, ...prev.slice(0, 19)]) // Keep last 20

        if (currentUser.settings.voiceEnabled) {
          speakCommand(data.command, currentUser.settings.language)
        }

        // Alert caregivers for emergency commands
        if (command.name.toLowerCase().includes("help") || command.name.toLowerCase().includes("emergency")) {
          alertCaregivers(command.name, currentUser.name)
        }

        setTimeout(() => {
          setSystemStatus("ready")
        }, 2000)
      }
    } catch (error) {
      console.error("Error detecting command:", error)
      setSystemStatus("error")
      setTimeout(() => {
        setSystemStatus("ready")
      }, 3000)
    } finally {
      setIsProcessing(false)
      setProcessingCommand("")
    }
  }

  const speakCommand = (command: string, language = "en-US") => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(command)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.8
      utterance.lang = language
      window.speechSynthesis.speak(utterance)
    }
  }

  const alertCaregivers = async (command: string, patientName: string) => {
    // Simulate caregiver alert
    console.log(`🚨 ALERT: ${patientName} requested: ${command}`)
    // In real implementation, this would send notifications via WebSocket, email, or SMS
  }

  const clearSelections = () => {
    setSelections([])
    setCurrentCommand("")
    setSystemStatus("ready")
  }

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "Command", "Frequency", "User"],
      ...selections.map((s) => [s.timestamp.toISOString(), s.command, s.frequency.toString(), s.userId || "unknown"]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bci-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getStatusColor = () => {
    switch (systemStatus) {
      case "processing":
        return "text-blue-600"
      case "success":
        return "text-emerald-600"
      case "error":
        return "text-rose-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = () => {
    switch (systemStatus) {
      case "processing":
        return <Activity className="h-5 w-5 animate-pulse" />
      case "success":
        return <CheckCircle2 className="h-5 w-5" />
      case "error":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Zap className="h-5 w-5" />
    }
  }

  const getFontSizeClass = () => {
    switch (currentUser.settings.fontSize) {
      case "small":
        return "text-sm"
      case "large":
        return "text-lg"
      default:
        return "text-base"
    }
  }

  const getBoxSizeClass = () => {
    switch (currentUser.settings.boxSize) {
      case "small":
        return "h-32"
      case "large":
        return "h-48"
      default:
        return "h-40"
    }
  }

  const getThemeClasses = () => {
    switch (currentUser.settings.theme) {
      case "dark":
        return "bg-gray-900 text-white"
      case "high-contrast":
        return "bg-black text-yellow-400 high-contrast"
      default:
        return "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    }
  }

  return (
    <div className={`min-h-screen ${getThemeClasses()} ${getFontSizeClass()}`}>
      {/* Enhanced Header with Status Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {connectionStatus === "connected" ? "System Online" : "Connecting..."}
                </span>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                {getStatusIcon()}
                <span className={getStatusColor()}>
                  {systemStatus === "processing"
                    ? `Processing ${processingCommand}...`
                    : systemStatus === "success"
                      ? "Command Executed"
                      : systemStatus === "error"
                        ? "Error Occurred"
                        : "Ready"}
                </span>
              </Badge>
              <Badge variant="secondary">
                {currentUser.name} ({currentUser.role})
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <CustomClock />
              <Button variant="outline" size="sm" onClick={exportLogs} disabled={selections.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Main Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Advanced SSVEP BCI System
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Mode: {currentUser.settings.mode.toUpperCase()} |
                {currentUser.settings.eyeTrackingMode ? " Eye Tracking" : " Click Mode"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="interface" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Interface
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Custom
            </TabsTrigger>
          </TabsList>

          {/* Main Interface Tab */}
          <TabsContent value="interface" className="space-y-8">
            {/* Current Command Display */}
            <Card className="bg-gradient-to-r from-white to-gray-50 border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="mb-4">
                    <Volume2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h2 className="text-xl font-semibold text-gray-700">Current Command</h2>
                  </div>
                  <div className="relative">
                    <div
                      className={`text-7xl font-bold mb-4 transition-all duration-500 ${
                        currentCommand ? "text-blue-600 scale-110" : "text-gray-300"
                      }`}
                    >
                      {currentCommand || "Ready"}
                    </div>
                    {currentCommand && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-lg">
                    {currentCommand
                      ? `Command detected and ${currentUser.settings.voiceEnabled ? "spoken" : "processed"}`
                      : currentUser.settings.eyeTrackingMode
                        ? "Hover over a command to select"
                        : "Click on a command to select"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SSVEP Command Grid */}
            <div
              className={`grid gap-6 mb-8 ${
                currentUser.settings.mode === "basic"
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
                  : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {commands.map((command, index) => (
                <Card
                  key={command.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 overflow-hidden group ${
                    processingCommand === command.name ? "ring-4 ring-blue-400 ring-opacity-50" : ""
                  }`}
                  onClick={() => handleCommandSelect(command, false)}
                  onMouseEnter={() => currentUser.settings.eyeTrackingMode && handleCommandSelect(command, true)}
                >
                  <CardContent className="p-0 relative">
                    <div
                      className={`
                        bg-gradient-to-br ${command.gradient}
                        ${getBoxSizeClass()} flex flex-col items-center justify-center
                        ssvep-flicker relative overflow-hidden
                      `}
                      style={{
                        animationDuration: `${1000 / command.frequency}ms`,
                      }}
                    >
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-shimmer"></div>
                      </div>

                      <div className="text-white text-center z-10 relative">
                        <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform">
                          {command.icon}
                        </div>
                        <div className="text-2xl font-bold mb-1">{command.name}</div>
                        <div className="text-sm opacity-90 font-medium">{command.frequency} Hz</div>
                        {command.isCustom && <Badge className="mt-1 bg-white/20 text-white">Custom</Badge>}
                      </div>

                      {processingCommand === command.name && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <div className="text-sm font-medium">Processing...</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white">
                      <p className="text-sm text-gray-600 text-center">{command.description}</p>
                      <div className="flex items-center justify-center mt-2 gap-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span className="text-xs text-gray-500 font-mono">{command.frequency}Hz</span>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Command History */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Command History ({selections.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportLogs} disabled={selections.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelections}
                    disabled={selections.length === 0}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selections.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No commands executed yet</p>
                    <p className="text-gray-400">Select a command above to begin communication</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selections.map((selection, index) => (
                      <div
                        key={selection.id}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                          index === 0 ? "bg-blue-50 border-2 border-blue-200" : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                              commands.find((c) => c.name === selection.command)?.color || "bg-gray-500"
                            }`}
                          >
                            {commands.find((c) => c.name === selection.command)?.icon || "?"}
                          </div>
                          <div>
                            <div className="font-semibold text-lg text-gray-900">{selection.command}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Zap className="h-3 w-3" />
                              {selection.frequency} Hz
                              {index === 0 && (
                                <Badge variant="secondary" className="ml-2">
                                  Latest
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">{formatTime(selection.timestamp)}</div>
                          <div className="text-xs text-gray-500">
                            {Math.floor((Date.now() - selection.timestamp.getTime()) / 1000)}s ago
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsPanel user={currentUser} onUserUpdate={setCurrentUser} onCommandsUpdate={setCommands} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard selections={selections} commands={commands} />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserProfiles currentUser={currentUser} onUserChange={setCurrentUser} />
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin">
            <AdminDashboard
              selections={selections}
              users={[currentUser]}
              commands={commands}
              onCommandsUpdate={setCommands}
            />
          </TabsContent>

          {/* Custom Commands Tab */}
          <TabsContent value="custom">
            <CustomCommandCreator user={currentUser} onUserUpdate={setCurrentUser} existingCommands={commands} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
