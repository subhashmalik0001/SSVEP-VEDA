"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Plus, Edit, Trash2, User, Shield, Heart, UserCheck, Settings } from "lucide-react"

interface UserType {
  id: string
  name: string
  role: "patient" | "caregiver" | "admin"
  customCommands: any[]
  settings: any
  avatar?: string
  email?: string
  lastActive?: Date
}

interface UserProfilesProps {
  currentUser: UserType
  onUserChange: (user: UserType) => void
}

const mockUsers: UserType[] = [
  {
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
    email: "patient@demo.com",
    lastActive: new Date(),
  },
  {
    id: "caregiver-1",
    name: "Dr. Sarah Johnson",
    role: "caregiver",
    customCommands: [],
    settings: {
      voiceEnabled: true,
      language: "en-US",
      fontSize: "medium",
      boxSize: "medium",
      theme: "light",
      mode: "advanced",
      eyeTrackingMode: false,
    },
    email: "sarah.johnson@hospital.com",
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "admin-1",
    name: "System Administrator",
    role: "admin",
    customCommands: [],
    settings: {
      voiceEnabled: false,
      language: "en-US",
      fontSize: "small",
      boxSize: "small",
      theme: "dark",
      mode: "custom",
      eyeTrackingMode: false,
    },
    email: "admin@bci-system.com",
    lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
]

export default function UserProfiles({ currentUser, onUserChange }: UserProfilesProps) {
  const [users, setUsers] = useState<UserType[]>(mockUsers)
  const [isCreating, setIsCreating] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [newUserRole, setNewUserRole] = useState<"patient" | "caregiver" | "admin">("patient")

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "patient":
        return <Heart className="h-4 w-4" />
      case "caregiver":
        return <UserCheck className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "patient":
        return "bg-blue-100 text-blue-800"
      case "caregiver":
        return "bg-green-100 text-green-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const createUser = () => {
    if (!newUserName.trim()) return

    const newUser: UserType = {
      id: `${newUserRole}-${Date.now()}`,
      name: newUserName,
      role: newUserRole,
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
      email: `${newUserName.toLowerCase().replace(" ", ".")}@demo.com`,
      lastActive: new Date(),
    }

    setUsers([...users, newUser])
    setNewUserName("")
    setIsCreating(false)
  }

  const switchUser = (user: UserType) => {
    onUserChange(user)
  }

  const deleteUser = (userId: string) => {
    if (userId === currentUser.id) return // Can't delete current user
    setUsers(users.filter((u) => u.id !== userId))
  }

  return (
    <div className="space-y-6">
      {/* Current User Card */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Current User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-600 text-white text-lg font-bold">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{currentUser.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getRoleColor(currentUser.role)}>
                  {getRoleIcon(currentUser.role)}
                  <span className="ml-1 capitalize">{currentUser.role}</span>
                </Badge>
                <Badge variant="outline">Mode: {currentUser.settings.mode}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">{currentUser.email}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Active now</div>
              <Button variant="outline" size="sm" className="mt-2">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            All Users ({users.length})
          </CardTitle>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          {/* Create New User Form */}
          {isCreating && (
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <h4 className="font-medium mb-3">Create New User</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="User name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                >
                  <option value="patient">Patient</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="admin">Administrator</option>
                </select>
                <div className="flex gap-2">
                  <Button onClick={createUser} disabled={!newUserName.trim()}>
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  user.id === currentUser.id
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback
                        className={`${
                          user.role === "patient"
                            ? "bg-blue-600"
                            : user.role === "caregiver"
                              ? "bg-green-600"
                              : "bg-purple-600"
                        } text-white font-bold`}
                      >
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{user.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(user.role)} variant="secondary">
                          {getRoleIcon(user.role)}
                          <span className="ml-1 capitalize">{user.role}</span>
                        </Badge>
                        {user.id === currentUser.id && <Badge variant="default">Current</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Last active: {formatLastActive(user.lastActive || new Date())}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {user.settings.mode} mode • {user.customCommands.length} custom commands
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.id !== currentUser.id && (
                        <Button variant="outline" size="sm" onClick={() => switchUser(user)}>
                          Switch
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.id !== currentUser.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-blue-600">{users.filter((u) => u.role === "patient").length}</p>
              </div>
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Caregivers</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter((u) => u.role === "caregiver").length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrators</p>
                <p className="text-3xl font-bold text-purple-600">{users.filter((u) => u.role === "admin").length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
