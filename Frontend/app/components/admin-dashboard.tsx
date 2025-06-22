"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Database,
  Activity,
  Users,
  AlertTriangle,
  Download,
  Upload,
  Server,
  Wifi,
  HardDrive,
  Cpu,
} from "lucide-react"

interface Selection {
  id: string
  command: string
  frequency: number
  timestamp: Date
  userId?: string
}

interface User {
  id: string
  name: string
  role: "patient" | "caregiver" | "admin"
  customCommands: any[]
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

interface AdminDashboardProps {
  selections: Selection[]
  users: User[]
  commands: Command[]
  onCommandsUpdate: (commands: Command[]) => void
}

export default function AdminDashboard({ selections, users, commands, onCommandsUpdate }: AdminDashboardProps) {
  const [systemStatus, setSystemStatus] = useState({
    server: "online",
    database: "connected",
    api: "healthy",
    storage: "85%",
  })

  const [newFrequency, setNewFrequency] = useState("")
  const [selectedCommand, setSelectedCommand] = useState("")

  const updateFrequency = () => {
    if (!selectedCommand || !newFrequency) return

    const updatedCommands = commands.map((cmd) =>
      cmd.id === selectedCommand ? { ...cmd, frequency: Number.parseInt(newFrequency) } : cmd,
    )
    onCommandsUpdate(updatedCommands)
    setNewFrequency("")
    setSelectedCommand("")
  }

  const exportSystemData = () => {
    const systemData = {
      users: users.length,
      commands: commands.length,
      selections: selections.length,
      timestamp: new Date().toISOString(),
      systemStatus,
    }

    const blob = new Blob([JSON.stringify(systemData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bci-system-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getRecentAlerts = () => {
    return [
      {
        id: "1",
        type: "warning",
        message: "High frequency usage detected for Patient Demo",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: "2",
        type: "info",
        message: "New user registered: Dr. Sarah Johnson",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "3",
        type: "success",
        message: "System backup completed successfully",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ]
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Server Status</p>
                <p className="text-2xl font-bold text-green-600">Online</p>
              </div>
              <Server className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-green-700 bg-green-100">
                99.9% Uptime
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Database</p>
                <p className="text-2xl font-bold text-blue-600">Connected</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                Low Latency
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Health</p>
                <p className="text-2xl font-bold text-emerald-600">Healthy</p>
              </div>
              <Wifi className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-emerald-700 bg-emerald-100">
                All Endpoints
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage</p>
                <p className="text-2xl font-bold text-orange-600">85%</p>
              </div>
              <HardDrive className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-orange-700 bg-orange-100">
                15% Free
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="commands">Command Config</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  System Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Commands Today</span>
                    <Badge variant="secondary">{selections.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Users</span>
                    <Badge variant="secondary">{users.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>System Load</span>
                    <Badge className="bg-green-100 text-green-800">Low</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Response Time</span>
                    <Badge className="bg-blue-100 text-blue-800">45ms</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-purple-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>23%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "23%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>67%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "67%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Network I/O</span>
                      <span>12%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "12%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{user.customCommands.length} custom commands</Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Command Configuration Tab */}
        <TabsContent value="commands" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Frequency Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    value={selectedCommand}
                    onChange={(e) => setSelectedCommand(e.target.value)}
                  >
                    <option value="">Select Command</option>
                    {commands.map((cmd) => (
                      <option key={cmd.id} value={cmd.id}>
                        {cmd.name} ({cmd.frequency} Hz)
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="New frequency (Hz)"
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    min="1"
                    max="50"
                  />
                  <Button onClick={updateFrequency} disabled={!selectedCommand || !newFrequency}>
                    Update Frequency
                  </Button>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Current Command Frequencies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {commands.map((cmd) => (
                      <div key={cmd.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded ${cmd.color} flex items-center justify-center text-white text-sm font-bold`}
                          >
                            {cmd.icon}
                          </div>
                          <span className="font-medium">{cmd.name}</span>
                        </div>
                        <Badge variant="outline">{cmd.frequency} Hz</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRecentAlerts().map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.type === "warning"
                        ? "border-orange-500 bg-orange-50"
                        : alert.type === "success"
                          ? "border-green-500 bg-green-50"
                          : "border-blue-500 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{alert.message}</p>
                      <span className="text-sm text-gray-500">{alert.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                System Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={exportSystemData} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export System Data
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Configuration
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Database Status</h4>
                    <p className="text-sm text-gray-600">{selections.length} total selections recorded</p>
                    <p className="text-sm text-gray-600">Last backup: 2 hours ago</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">System Health</h4>
                    <p className="text-sm text-gray-600">All services operational</p>
                    <p className="text-sm text-gray-600">Next maintenance: Scheduled</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
