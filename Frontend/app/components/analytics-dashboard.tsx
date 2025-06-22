"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, Zap, Activity, Target, Calendar } from "lucide-react"

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

interface AnalyticsDashboardProps {
  selections: Selection[]
  commands: Command[]
}

export default function AnalyticsDashboard({ selections, commands }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    if (selections.length === 0) {
      return {
        totalCommands: 0,
        mostUsedCommand: null,
        averageFrequency: 0,
        commandCounts: {},
        hourlyDistribution: {},
        recentActivity: [],
        successRate: 0,
      }
    }

    // Command usage counts
    const commandCounts = selections.reduce(
      (acc, selection) => {
        acc[selection.command] = (acc[selection.command] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Most used command
    const mostUsedCommand = Object.entries(commandCounts).sort(([, a], [, b]) => b - a)[0]

    // Average frequency
    const averageFrequency = selections.reduce((sum, s) => sum + s.frequency, 0) / selections.length

    // Hourly distribution
    const hourlyDistribution = selections.reduce(
      (acc, selection) => {
        const hour = selection.timestamp.getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    // Recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentActivity = selections.filter((s) => s.timestamp > oneDayAgo)

    return {
      totalCommands: selections.length,
      mostUsedCommand,
      averageFrequency: Math.round(averageFrequency * 10) / 10,
      commandCounts,
      hourlyDistribution,
      recentActivity,
      successRate: 98.5, // Simulated success rate
    }
  }, [selections])

  const getCommandColor = (commandName: string) => {
    const command = commands.find((c) => c.name === commandName)
    return command?.color || "bg-gray-500"
  }

  const getCommandIcon = (commandName: string) => {
    const command = commands.find((c) => c.name === commandName)
    return command?.icon || "?"
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commands</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalCommands}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-emerald-600">{analytics.successRate}%</p>
              </div>
              <Target className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Excellent performance</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Frequency</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.averageFrequency} Hz</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Optimal range: 10-25 Hz</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-3xl font-bold text-orange-600">{analytics.recentActivity.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Last 24 hours</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Command Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Command Usage Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(analytics.commandCounts).length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No data available yet</p>
              <p className="text-gray-400 text-sm">Start using commands to see analytics</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(analytics.commandCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([command, count]) => {
                  const percentage = (count / analytics.totalCommands) * 100
                  return (
                    <div key={command} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg ${getCommandColor(command)} flex items-center justify-center text-white text-sm font-bold`}
                          >
                            {getCommandIcon(command)}
                          </div>
                          <span className="font-medium">{command}</span>
                          {analytics.mostUsedCommand && analytics.mostUsedCommand[0] === command && (
                            <Badge variant="secondary">Most Used</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{count}</span>
                          <span className="text-sm text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hourly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Activity by Hour
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(analytics.hourlyDistribution).length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No hourly data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-2">
              {Array.from({ length: 24 }, (_, hour) => {
                const count = analytics.hourlyDistribution[hour] || 0
                const maxCount = Math.max(...Object.values(analytics.hourlyDistribution))
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0

                return (
                  <div key={hour} className="flex flex-col items-center">
                    <div className="w-full bg-gray-200 rounded-t h-20 flex items-end">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all duration-500"
                        style={{ height: `${height}%` }}
                        title={`${hour}:00 - ${count} commands`}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{hour}</div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Recent Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analytics.recentActivity.slice(0, 10).map((selection) => (
                <div key={selection.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className={`w-8 h-8 rounded-lg ${getCommandColor(selection.command)} flex items-center justify-center text-white text-sm font-bold`}
                  >
                    {getCommandIcon(selection.command)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{selection.command}</div>
                    <div className="text-sm text-gray-500">{selection.frequency} Hz</div>
                  </div>
                  <div className="text-sm text-gray-500">{selection.timestamp.toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
