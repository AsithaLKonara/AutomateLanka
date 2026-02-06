export function AnimatedBackground({ variant = 'default' }: { variant?: 'default' | 'purple' | 'blue' }) {
  const gradients = {
    default: 'from-[#0e0918] via-[#1a1625] to-[#0e0918]',
    purple: 'from-[#1a1625] via-[#0e0918] to-[#1a1625]',
    blue: 'from-[#0e0918] via-[#0e0918] to-[#1a1625]'
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

