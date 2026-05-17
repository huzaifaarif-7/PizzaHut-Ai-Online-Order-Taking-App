import React from 'react'

const MicIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

const PhoneOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.44 16.29 8.23 15.08 7.28 13.72" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </svg>
)

const SoundWaveBars = () => (
  <div className="flex items-center gap-1" style={{ height: '24px' }}>
    {[0.6, 1, 0.75, 1, 0.6].map((h, i) => (
      <div key={i} className="bar" style={{ width: '3px', height: `${h * 20}px`, borderRadius: '2px', background: '#fff' }} />
    ))}
  </div>
)

const Spinner = () => (
  <div className="spin-anim" style={{ width: '26px', height: '26px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
)

const STATUS_BTN_CLASS = {
  idle: 'mic-idle',
  connecting: 'mic-connecting',
  connected: 'mic-idle',
  listening: 'mic-listening',
  processing: 'mic-processing',
  speaking: 'mic-speaking',
  ended: 'mic-idle',
}

const STATUS_LABEL = {
  idle: 'Tap to call Sarah',
  connecting: 'Connecting…',
  connected: 'Tap to speak',
  listening: 'Listening…',
  processing: 'Thinking…',
  speaking: 'Sarah is speaking…',
  ended: 'Tap to call again',
}

export default function MicButton({ status, onStart, onEnd }) {
  const isActive = ['connecting', 'connected', 'listening', 'processing', 'speaking'].includes(status)
  const isListening = status === 'listening'
  const label = STATUS_LABEL[status] || ''

  const handleClick = () => {
    if (status === 'idle' || status === 'ended') { onStart() }
    // Don't toggle in other states — use end call button
  }

  return (
    <div className="glass-card rounded-3xl p-8 flex flex-col items-center gap-6">
      {/* Mic + pulse rings container */}
      <div className="relative flex items-center justify-center" style={{ width: '100px', height: '100px' }}>
        {isListening && (
          <>
            <div className="pulse-ring absolute inset-0 rounded-full" style={{ background: 'rgba(204,0,0,0.2)' }} />
            <div className="pulse-ring absolute inset-0 rounded-full" style={{ background: 'rgba(204,0,0,0.12)', animationDelay: '0.5s' }} />
          </>
        )}
        <button
          onClick={handleClick}
          disabled={isActive && status !== 'idle' && status !== 'ended'}
          className={`${STATUS_BTN_CLASS[status] || 'mic-idle'} w-24 h-24 rounded-full border-none cursor-pointer flex items-center justify-center text-white transition-all duration-300`}
          style={{ transform: isListening ? 'scale(1.06)' : 'scale(1)' }}
          aria-label={label}
        >
          {status === 'connecting' ? <Spinner /> : isListening ? <SoundWaveBars /> : <MicIcon />}
        </button>
      </div>

      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>

      {isActive && (
        <button
          onClick={onEnd}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(204,0,0,0.2)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
        >
          <PhoneOffIcon /> End Call
        </button>
      )}

      {/* Language badges */}
      <div className="flex flex-wrap justify-center gap-2">
        {['🇬🇧 English', '🇵🇰 Urdu', '🌐 Hinglish'].map(lang => (
          <span key={lang} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)', letterSpacing: '0.04em', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>
            {lang}
          </span>
        ))}
      </div>
    </div>
  )
}
