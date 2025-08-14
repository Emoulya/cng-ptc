"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { CustomerSelector } from "@/components/customer-selector"
import { DataEntryForm } from "@/components/data-entry-form"
import { LogOut, Plus, BarChart3 } from "lucide-react"

export function OperatorDashboard() {
  const { user, logout } = useAuth()
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [showDataEntry, setShowDataEntry] = useState(false)
  const [showDataTable, setShowDataTable] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const handleDataEntrySuccess = () => {
    // Switch to data table view after successful submission
    setShowDataEntry(false)
    setShowDataTable(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">PTC Monitoring</h1>
            <p className="text-blue-100 text-sm">Operator: {user?.username}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-blue-700">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerSelector value={selectedCustomer} onChange={setSelectedCustomer} />
          </CardContent>
        </Card>

        {selectedCustomer && (
          <>
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  setShowDataEntry(true)
                  setShowDataTable(false)
                }}
                className="h-12 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Enter Data
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDataTable(true)
                  setShowDataEntry(false)
                }}
                className="h-12 flex items-center justify-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                View Data
              </Button>
            </div>

            {/* Current Time Display */}
            <Card className="bg-blue-50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Current Time</p>
                  <p className="text-lg font-mono font-semibold text-blue-600">
                    {new Date().toLocaleString("id-ID", {
                      timeZone: "Asia/Jakarta",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">WIB (Server Time)</p>
                </div>
              </CardContent>
            </Card>

            {/* Conditional Content */}
            {showDataEntry && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Data Entry - {selectedCustomer}</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataEntryForm customerCode={selectedCustomer} onSuccess={handleDataEntrySuccess} />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
