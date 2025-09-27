import QueueCard from '@/components/QueueCard'

async function getItems() {
  try {
    const response = await fetch('http://localhost:5000/api/items', {
      cache: 'no-store'
    })
    if (!response.ok) {
      throw new Error('Failed to fetch items')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching items:', error)
    return []
  }
}

export default async function QueuePage() {
  const items = await getItems()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Queue</h1>
        <p className="text-gray-600">
          Items awaiting review and quality assessment
        </p>
      </div>

      {/* Filter Bar - simplified for now */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex gap-4">
            <select className="border border-gray-300 rounded-md px-3 py-2">
              <option value="all">All Subjects</option>
            </select>
            <select className="border border-gray-300 rounded-md px-3 py-2">
              <option value="all">All Types</option>
            </select>
            <select className="border border-gray-300 rounded-md px-3 py-2">
              <option value="all">All Statuses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {items.map((item: any) => (
          <QueueCard key={item.id} item={item} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items in queue</h3>
          <p className="text-gray-500">
            Items will appear here once they're submitted for review.
          </p>
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {items.filter((i: any) => i.status === 'NEEDS_REVIEW').length}
          </div>
          <div className="text-sm text-blue-600">Needs Review</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {items.filter((i: any) => i.status === 'CHANGES_REQUESTED').length}
          </div>
          <div className="text-sm text-orange-600">Changes Requested</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {items.filter((i: any) => i.status === 'PUBLISHED').length}
          </div>
          <div className="text-sm text-green-600">Published</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {items.filter((i: any) => i.autoChecks && 
              (i.autoChecks.duplicates.length > 0 || 
               i.autoChecks.conflicts.length > 0 || 
               i.autoChecks.coverage < 0.8)).length}
          </div>
          <div className="text-sm text-red-600">Quality Issues</div>
        </div>
      </div>
    </div>
  )
}