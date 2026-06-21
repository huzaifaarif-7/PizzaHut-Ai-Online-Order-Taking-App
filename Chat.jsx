import React, { useRef, useEffect } from 'react'

function SoundWave({ active }) {
  return (
    <div className="flex items-center gap-1" style={{ height: '20px' }}>
      {[0.6, 1, 0.75, 1, 0.6].map((h, i) => (
        <div key={i} className={active ? 'bar' : ''}
          style={{
            width: '3px', height: `${h * 16}px`, borderRadius: '2px',
            background: '#CC0000', opacity: active ? 1 : 0.3,
            transform: active ? undefined : `scaleY(${h * 0.4})`,
            transition: 'all 0.3s ease'
          }} />
      ))}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="chat-bubble flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-display flex-shrink-0"
        style={{ background: '#CC0000' }}>S</div>
      <div className="glass-card px-4 py-3 rounded-[18px_18px_18px_4px] flex gap-1.5 items-center">
        {[0, 0.2, 0.4].map((d, i) => (
          <div key={i} className="dot-blink w-2 h-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.5)', animationDelay: `${d}s` }} />
        ))}
      </div>
    </div>
  )
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`chat-bubble flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-display flex-shrink-0"
          style={{ background: '#CC0000' }}>S</div>
      )}
      <div style={{
        maxWidth: '75%', padding: '11px 15px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? '#CC0000' : 'rgba(255,255,255,0.07)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.09)',
        fontSize: '14px', lineHeight: '1.55', color: '#fff'
      }}>
        {msg.content}
        <div style={{ fontSize: '10px', opacity: 0.45, marginTop: '4px', textAlign: isUser ? 'right' : 'left' }}>
          {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

export default function Chat({ messages, isTyping, callStatus }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [messages, isTyping])

  const isSpeaking = callStatus === 'speaking'

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="w-2 h-2 rounded-full transition-all duration-300"
          style={{ background: isSpeaking ? '#CC0000' : '#2D2D2D', boxShadow: isSpeaking ? '0 0 10px rgba(204,0,0,0.7)' : 'none' }} />
        <span className="font-display font-semibold text-sm">Conversation</span>
        {isSpeaking && <div className="ml-auto"><SoundWave active /></div>}
      </div>
      <div ref={ref} className="flex-1 p-5 overflow-y-auto" style={{ maxHeight: '380px' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-5xl mb-4">👋</div>
            <div className="font-display font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Tap the mic below to begin</div>
            <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Sarah speaks English
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {isTyping && <TypingIndicator />}
          </>
        )}
      </div>
    </div>
  )
}
