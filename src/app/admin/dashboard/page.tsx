import { Suspense } from 'react'
import AdminDashboardClient from './admin-dashboard-client'
import { 
  Shield,
  Database
} from 'lucide-react'
import ModernCard from '@/components/ui/modern-card'

// Loading component para as estatísticas
function StatsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm">
              <Shield className="h-6 w-6" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-96"></div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-9 bg-gray-200 rounded w-32"></div>
          <div className="h-9 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      {/* Stats Grid Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
        ))}
      </div>

      {/* Additional Content Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64 bg-gray-200 rounded-xl"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<StatsLoading />}>
      <AdminDashboardClient />
    </Suspense>
  )
}
