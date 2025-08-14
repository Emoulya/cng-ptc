import { ProtectedRoute } from "@/components/protected-route"
import { OperatorDashboard } from "@/components/operator-dashboard"

export default function OperatorPage() {
  return (
    <ProtectedRoute requiredRole="operator">
      <OperatorDashboard />
    </ProtectedRoute>
  )
}
