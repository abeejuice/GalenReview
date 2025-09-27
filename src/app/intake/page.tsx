'use client'

import { useState } from 'react'

export default function IntakePage() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const data = JSON.parse(content)
      
      const endpoint = data.type === 'FLASHCARD' 
        ? '/api/intake/flashcard' 
        : '/api/intake/mcq'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        setMessage(`✅ Successfully created item: ${result.itemId}`)
        setContent('')
      } else {
        const error = await response.json()
        setMessage(`❌ Error: ${error.error}`)
      }
    } catch (error) {
      setMessage(`❌ Invalid JSON or request failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const exampleFlashcard = {
    type: 'FLASHCARD',
    subject: 'Cardiology',
    topic: 'Heart Rate',
    competencyId: 'physiology',
    flashcard: {
      question: 'What is the normal resting heart rate range?',
      answer: 'The normal resting heart rate for adults is typically 60-100 beats per minute.'
    },
    references: [
      {
        title: 'Harrison\'s Principles of Internal Medicine',
        page: '234'
      }
    ]
  }

  const exampleMCQ = {
    type: 'MCQ',
    subject: 'Anatomy',
    topic: 'Heart Chambers',
    competencyId: 'anatomy',
    mcq: {
      question: 'How many chambers does the human heart have?',
      options: ['2', '3', '4', '5'],
      correctIndex: 2,
      explanation: 'The human heart has 4 chambers: 2 atria and 2 ventricles.'
    },
    references: [
      {
        title: 'Gray\'s Anatomy',
        page: '156'
      }
    ]
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Intake</h1>
        <p className="text-gray-600">
          Submit medical education content for review and quality assessment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JSON Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 p-3 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="Paste your JSON content here..."
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
              
              <button
                type="button"
                onClick={() => setContent('')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
            
            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.startsWith('✅') 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Examples */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Example Flashcard
            </h3>
            <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
              {JSON.stringify(exampleFlashcard, null, 2)}
            </pre>
            <button
              onClick={() => setContent(JSON.stringify(exampleFlashcard, null, 2))}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Use this example
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Example MCQ
            </h3>
            <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
              {JSON.stringify(exampleMCQ, null, 2)}
            </pre>
            <button
              onClick={() => setContent(JSON.stringify(exampleMCQ, null, 2))}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Use this example
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}