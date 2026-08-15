type Props = { mood: 'idle' | 'cheer' | 'oops' | 'think'; outfit?: string }

export function Mascot({ mood, outfit = 'chikki' }: Props) {
  const face = mood === 'oops' ? '😮' : mood === 'cheer' ? '😄' : mood === 'think' ? '🧐' : '😊'
  const body = outfit === 'mysore' ? '#E11D48' : outfit === 'gold' ? '#F59E0B' : '#58CC02'
  return (
    <svg className="mascot" viewBox="0 0 160 160" aria-hidden>
      <ellipse cx="80" cy="148" rx="42" ry="8" fill="rgba(0,0,0,0.12)" />
      <ellipse cx="80" cy="92" rx="48" ry="52" fill={body} />
      <ellipse cx="80" cy="86" rx="40" ry="38" fill="#FFFDE8" />
      <circle cx="64" cy="82" r="7" fill="#3C3C3C" />
      <circle cx="96" cy="82" r="7" fill="#3C3C3C" />
      <circle cx="66" cy="80" r="2.2" fill="#fff" />
      <circle cx="98" cy="80" r="2.2" fill="#fff" />
      <path
        d={mood === 'oops' ? 'M68 104 Q80 96 92 104' : 'M68 100 Q80 112 92 100'}
        fill="none"
        stroke="#E85D4C"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <text x="80" y="54" textAnchor="middle" fontSize="22">
        {face}
      </text>
      <text x="80" y="28" textAnchor="middle" fontSize="20">
        🦚
      </text>
    </svg>
  )
}
