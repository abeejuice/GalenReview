import Link from 'next/link'

interface QueueCardProps {
  item: any
}

export default function QueueCard({ item }: QueueCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEEDS_REVIEW': return 'bg-blue-100 text-blue-800'
      case 'CHANGES_REQUESTED': return 'bg-orange-100 text-orange-800'
      case 'PUBLISHED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getContent = () => {
    if (item.flashcard) {
      return {
        title: item.flashcard.question,
        preview: item.flashcard.answer.substring(0, 100) + '...'
      }
    }
    if (item.mcq) {
      return {
        title: item.mcq.question,
        preview: item.mcq.options.join(' | ')
      }
    }
    return { title: 'Unknown', preview: '' }
  }

  const { title, preview } = getContent()

  return (
    <Link href={`/item/${item.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
            {item.status.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-500">{item.type}</span>
        </div>
        
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {preview}
        </p>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{item.subject} • {item.topic}</span>
          <span>{item.competency?.name}</span>
        </div>
        
        {item.autoChecks && (
          <div className="mt-2 flex gap-1">
            {item.autoChecks.duplicates.length > 0 && (
              <span className="bg-red-100 text-red-700 px-1 py-0.5 rounded text-xs">
                Duplicates
              </span>
            )}
            {item.autoChecks.conflicts.length > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded text-xs">
                Conflicts
              </span>
            )}
            {item.autoChecks.coverage < 0.8 && (
              <span className="bg-orange-100 text-orange-700 px-1 py-0.5 rounded text-xs">
                Low Coverage
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}