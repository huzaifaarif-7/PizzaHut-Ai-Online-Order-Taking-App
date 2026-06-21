import React, { useState, useCallback, useEffect } from 'react'
import Header from './components/Header'
import Chat from './components/Chat'
import MicButton from './components/MicButton'
import OrderSummary from './components/OrderSummary'
import MenuPreview from './components/MenuPreview'
import OrderConfirmModal from './components/OrderConfirmModal'
import { useVapi } from './hooks/useVapi'
import { fetchMenu, placeOrder } from './api'

// Pizza names from backend menu (used for parsing)
const PIZZA_NAMES = ['Chicken Tikka', 'Chicken Fajita', 'Chicken Supreme', 'Pepperoni']
const SIZES = ['Small', 'Medium', 'Large']

function parseOrderFromText(text) {
  const lower = text.toLowerCase()
  const foundPizza = PIZZA_NAMES.find(p => lower.includes(p.toLowerCase()))
  const foundSize = SIZES.find(s => lower.includes(s.toLowerCase())) || 'Medium'
  const orderWords = ['order', 'want', 'get', 'place', 'confirm', 'yes', 'please', 'take', 'wanna', 'want to']
  const isOrder = orderWords.some(k => lower.includes(k)) && foundPizza
  return isOrder ? { pizza: foundPizza, size: foundSize } : null
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [menu, setMenu] = useState(null)
  const [order, setOrder] = useState(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState(null)

  // Fetch menu on mount
  useEffect(() => {
    fetchMenu()
      .then(setMenu)
      .catch(() => {
        // Fallback mock data if backend is down
        setMenu({
          pizzas: [
            { id: 'p1', name: 'Chicken Tikka', description: 'Classic chicken tikka flavor with signature sauce', popular: true, prices: { Small: 899, Medium: 1399, Large: 1999 } },
            { id: 'p2', name: 'Chicken Fajita', description: 'Tender chicken fajita with onion and green pepper notes', popular: true, prices: { Small: 899, Medium: 1399, Large: 1999 } },
            { id: 'p3', name: 'Chicken Supreme', description: 'Loaded chicken pizza with premium toppings', popular: true, prices: { Small: 999, Medium: 1499, Large: 2199 } },
          ],
          deals: [
            { id: 'd1', name: 'My Box Deal', description: '1 Personal Pizza + Fries + 1 Drink', price: 699, saves: 0 },
            { id: 'd2', name: 'Medium Duo Deal', description: '2 Medium Pizzas', price: 2499, saves: 0 },
          ]
        })
      })
  }, [])

  const handleMessage = useCallback(({ role, content, ts }) => {
    setMessages(prev => [...prev, { role, content, ts }])
    // Try to parse order intent from assistant response
    if (role === 'assistant') {
      const parsed = parseOrderFromText(content)
      if (parsed) {
        setShowConfirm(true)
        submitOrder(parsed.pizza, parsed.size)
      }
    }
  }, [])

  const handleCallStart = useCallback(() => {
    setMessages([{
      role: 'sarah',
      content: "Hello! Welcome to Pizza Hut! I'm Sarah, your AI ordering assistant. I can help you in English. What would you like to order today?",
      ts: Date.now()
    }])
    setOrder(null)
    setApiError(null)
  }, [])

  const handleCallEnd = useCallback(() => { }, [])

  const { status, error: vapiError, isTyping, startCall, endCall } = useVapi({
    onMessage: handleMessage,
    onCallStart: handleCallStart,
    onCallEnd: handleCallEnd,
  })

  const submitOrder = useCallback(async (pizzaName, size) => {
    setOrderLoading(true)
    try {
      const result = await placeOrder({
        items: [{ name: pizzaName, size, quantity: 1, crust: 'Pan' }]
      })
      setOrder(result)
    } catch {
      // Mock fallback
      setOrder({
        order_id: 'PHT-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        items: [{ pizza: pizzaName, size, crust: 'Pan', quantity: 1, add_ons: [], total: size === 'Large' ? 1999 : (size === 'Medium' ? 1399 : 899) }],
        summary: { subtotal: size === 'Large' ? 1999 : (size === 'Medium' ? 1399 : 899), delivery_fee: 149, tax: size === 'Large' ? 260 : (size === 'Medium' ? 182 : 117), grand_total: size === 'Large' ? 2408 : (size === 'Medium' ? 1730 : 1165), currency: 'PKR' },
        estimated_time: '30-45 minutes'
      })
    }
    setOrderLoading(false)
    setShowConfirm(false)
  }, [])

  return (
    <div className="min-h-screen relative z-10">
      {/* Background blobs */}
      <div style={{ position: 'fixed', top: '-120px', left: '-120px', width: '550px', height: '550px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(204,0,0,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-150px', right: '-100px', width: '650px', height: '650px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(204,0,0,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        <Header status={status} />

        {/* Error banner */}
        {(vapiError || apiError) && (
          <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: 'rgba(204,0,0,0.15)', border: '1px solid rgba(204,0,0,0.3)', color: '#FF9999' }}>
            ⚠️ {vapiError || apiError}
          </div>
        )}

        {/* Main layout */}
        <div className="grid gap-5" style={{ gridTemplateColumns: window.innerWidth > 900 ? '1fr 340px' : '1fr' }}>

          {/* Left: Chat + Mic */}
          <div className="flex flex-col gap-5">
            <Chat messages={messages} isTyping={isTyping} callStatus={status} />
            <MicButton status={status} onStart={startCall} onEnd={endCall} />
          </div>

          {/* Right: Order + Menu */}
          <div className="flex flex-col gap-4">
            <div className="font-display font-bold text-xs tracking-widest uppercase px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Your Order</div>
            <OrderSummary order={order} loading={orderLoading} />
            <div className="font-display font-bold text-xs tracking-widest uppercase px-1 mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Menu</div>
            <MenuPreview menu={menu} />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-10 pb-4 text-xs" style={{ color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
          Pizza Hut Sarah — AI Ordering Assistant · Vapi + FastAPI
        </p>
      </div>

      <OrderConfirmModal show={showConfirm} />
    </div>
  )
}
