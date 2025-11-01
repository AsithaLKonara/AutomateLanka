export function AnimatedBackground({ variant = 'default' }: { variant?: 'default' | 'purple' | 'blue' }) {
  const gradients = {
    default: 'from-blue-50 via-purple-50 to-pink-50',
    purple: 'from-purple-50 via-blue-50 to-pink-50',
    blue: 'from-blue-50 via-indigo-50 to-purple-50'
  }

  const orbs = {
    default: [
      { color: 'bg-purple-300', position: 'top-0 -left-4', delay: '0s' },
      { color: 'bg-yellow-300', position: 'top-0 -right-4', delay: '2s' },
      { color: 'bg-pink-300', position: '-bottom-8 left-20', delay: '4s' }
    ],
    purple: [
      { color: 'bg-purple-300', position: 'top-20 -left-4', delay: '0s' },
      { color: 'bg-blue-300', position: 'top-40 -right-4', delay: '2s' }
    ],
    blue: [
      { color: 'bg-blue-300', position: 'top-0 left-0', delay: '0s' },
      { color: 'bg-purple-300', position: 'bottom-0 right-0', delay: '3s' }
    ]
  }

  return (
    <div className="fixed inset-0 -z-10">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[variant]}`}></div>
      {orbs[variant].map((orb, idx) => (
        <div
          key={idx}
          className={`absolute w-72 h-72 ${orb.color} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float ${orb.position}`}
          style={{ animationDelay: orb.delay }}
        ></div>
      ))}
      <div className="tech-grid absolute inset-0 opacity-30"></div>
    </div>
  )
}

