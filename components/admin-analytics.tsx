"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

// Mock analytics data
const ANALYTICS_DATA = {
  totalReadings: 1247,
  avgPSI: 149.3,
  avgTemp: 25.7,
  avgFlow: 122.4,
  trends: {
    psi: "up",
    temp: "stable",
    flow: "down",
  },
}

const TOP_CUSTOMERS = [
  { customer: "ALM", readings: 156, lastReading: "2024-01-15 14:30:00" },
  { customer: "BCN", readings: 142, lastReading: "2024-01-15 14:25:00" },
  { customer: "DKI", readings: 138, lastReading: "2024-01-15 14:20:00" },
  { customer: "GSJ", readings: 134, lastReading: "2024-01-15 14:15:00" },
  { customer: "APM", readings: 129, lastReading: "2024-01-15 14:10:00" },
]

export function AdminAnalytics() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ANALYTICS_DATA.totalReadings}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average PSI</CardTitle>
            {getTrendIcon(ANALYTICS_DATA.trends.psi)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ANALYTICS_DATA.avgPSI}</div>
            <p className={`text-xs ${getTrendColor(ANALYTICS_DATA.trends.psi)}`}>
              {ANALYTICS_DATA.trends.psi === "up" ? "↑" : ANALYTICS_DATA.trends.psi === "down" ? "↓" : "→"} vs last
              month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Temp</CardTitle>
            {getTrendIcon(ANALYTICS_DATA.trends.temp)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ANALYTICS_DATA.avgTemp}°C</div>
            <p className={`text-xs ${getTrendColor(ANALYTICS_DATA.trends.temp)}`}>
              {ANALYTICS_DATA.trends.temp === "up" ? "↑" : ANALYTICS_DATA.trends.temp === "down" ? "↓" : "→"} vs last
              month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Flow</CardTitle>
            {getTrendIcon(ANALYTICS_DATA.trends.flow)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ANALYTICS_DATA.avgFlow}</div>
            <p className={`text-xs ${getTrendColor(ANALYTICS_DATA.trends.flow)}`}>
              {ANALYTICS_DATA.trends.flow === "up" ? "↑" : ANALYTICS_DATA.trends.flow === "down" ? "↓" : "→"} vs last
              month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Active Customers</CardTitle>
            <CardDescription>Customers with most data entries this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {TOP_CUSTOMERS.map((customer, index) => (
                <div key={customer.customer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1">
                        {customer.customer}
                      </Badge>
                      <p className="text-xs text-gray-500">Last: {customer.lastReading}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{customer.readings}</p>
                    <p className="text-xs text-gray-500">readings</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>System performance and data quality indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-sm text-green-800">Data Completeness</p>
                  <p className="text-xs text-green-600">All required fields captured</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-800">98.5%</p>
                  <p className="text-xs text-green-600">This month</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-sm text-blue-800">On-time Reporting</p>
                  <p className="text-xs text-blue-600">Hourly data submissions</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-800">94.2%</p>
                  <p className="text-xs text-blue-600">This month</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-sm text-yellow-800">Data Accuracy</p>
                  <p className="text-xs text-yellow-600">Values within expected ranges</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-800">91.8%</p>
                  <p className="text-xs text-yellow-600">This month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
