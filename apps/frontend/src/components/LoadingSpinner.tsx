export function LoadingSpinner({ size = 'md', message }: { size?: 'sm' | 'md' | 'lg', message?: string }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  }

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className={`${sizes[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
        {message && <p className="text-gray-600 font-medium animate-pulse">{message}</p>}
      </div>
    </div>
  )
}

