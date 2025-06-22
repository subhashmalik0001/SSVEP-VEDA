import { type NextRequest, NextResponse } from "next/server"

// Frequency to command mapping
const FREQUENCY_MAP: Record<number, string> = {
  10: "Yes",
  12: "No",
  15: "Water",
  17: "Help",
  20: "Food",
  22: "Bathroom",
  25: "Pain",
  27: "Doctor",
}

// In-memory storage for logging (in production, use a database)
let selectionLog: Array<{
  frequency: number
  command: string
  timestamp: Date
  userId?: string
  commandId?: string
}> = []

// User activity tracking
let userActivity: Record<
  string,
  {
    totalCommands: number
    lastActive: Date
    frequencyUsage: Record<number, number>
  }
> = {}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { frequency, userId, commandId } = body

    // Validate frequency
    if (!frequency || typeof frequency !== "number") {
      return NextResponse.json({ error: "Invalid frequency data" }, { status: 400 })
    }

    // Map frequency to command (including custom commands)
    let command = FREQUENCY_MAP[frequency]

    // If not found in default mapping, it might be a custom command
    if (!command) {
      // In a real implementation, you'd query the database for custom commands
      command = `Custom Command (${frequency} Hz)`
    }

    // Update user activity
    if (userId) {
      if (!userActivity[userId]) {
        userActivity[userId] = {
          totalCommands: 0,
          lastActive: new Date(),
          frequencyUsage: {},
        }
      }

      userActivity[userId].totalCommands++
      userActivity[userId].lastActive = new Date()
      userActivity[userId].frequencyUsage[frequency] = (userActivity[userId].frequencyUsage[frequency] || 0) + 1
    }

    // Log the selection
    const logEntry = {
      frequency,
      command,
      timestamp: new Date(),
      userId,
      commandId,
    }
    selectionLog.push(logEntry)

    // Keep only last 1000 entries to prevent memory issues
    if (selectionLog.length > 1000) {
      selectionLog = selectionLog.slice(-1000)
    }

    // Simulate processing delay with some variation
    const processingDelay = Math.random() * 200 + 50 // 50-250ms
    await new Promise((resolve) => setTimeout(resolve, processingDelay))

    // Simulate occasional errors for testing (1% chance)
    if (Math.random() < 0.01) {
      throw new Error("Simulated processing error")
    }

    return NextResponse.json({
      command,
      frequency,
      timestamp: logEntry.timestamp.toISOString(),
      processingTime: processingDelay,
      success: true,
      userId,
      commandId,
    })
  } catch (error) {
    console.error("Error processing frequency detection:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// GET endpoint to retrieve selection logs and analytics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const limit = Number.parseInt(searchParams.get("limit") || "50")

  try {
    let filteredLogs = selectionLog

    if (userId) {
      filteredLogs = selectionLog.filter((log) => log.userId === userId)
    }

    // Sort by timestamp (most recent first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply limit
    const logs = filteredLogs.slice(0, limit)

    // Calculate analytics
    const analytics = {
      totalSelections: filteredLogs.length,
      uniqueCommands: new Set(filteredLogs.map((log) => log.command)).size,
      averageFrequency:
        filteredLogs.length > 0 ? filteredLogs.reduce((sum, log) => sum + log.frequency, 0) / filteredLogs.length : 0,
      mostUsedCommand: getMostUsedCommand(filteredLogs),
      hourlyDistribution: getHourlyDistribution(filteredLogs),
      recentActivity: filteredLogs.filter((log) => new Date().getTime() - log.timestamp.getTime() < 24 * 60 * 60 * 1000)
        .length,
    }

    return NextResponse.json({
      logs,
      analytics,
      userActivity: userId ? userActivity[userId] : null,
      systemStats: {
        totalUsers: Object.keys(userActivity).length,
        totalLogs: selectionLog.length,
        systemUptime: "99.9%",
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error("Error retrieving logs:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve logs",
      },
      { status: 500 },
    )
  }
}

// Helper function to get most used command
function getMostUsedCommand(logs: typeof selectionLog) {
  const commandCounts: Record<string, number> = {}

  logs.forEach((log) => {
    commandCounts[log.command] = (commandCounts[log.command] || 0) + 1
  })

  const entries = Object.entries(commandCounts)
  if (entries.length === 0) return null

  return entries.reduce((max, current) => (current[1] > max[1] ? current : max))
}

// Helper function to get hourly distribution
function getHourlyDistribution(logs: typeof selectionLog) {
  const hourlyCount: Record<number, number> = {}

  logs.forEach((log) => {
    const hour = log.timestamp.getHours()
    hourlyCount[hour] = (hourlyCount[hour] || 0) + 1
  })

  return hourlyCount
}

// DELETE endpoint for clearing logs (admin only)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const adminKey = searchParams.get("adminKey")

  // Simple admin authentication (in production, use proper auth)
  if (adminKey !== "admin-secret-key") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const beforeCount = selectionLog.length
    selectionLog = []
    userActivity = {}

    return NextResponse.json({
      message: "Logs cleared successfully",
      clearedEntries: beforeCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error clearing logs:", error)
    return NextResponse.json(
      {
        error: "Failed to clear logs",
      },
      { status: 500 },
    )
  }
}
