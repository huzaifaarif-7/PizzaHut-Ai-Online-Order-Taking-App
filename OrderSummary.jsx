import React from 'react'

function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="spin-anim w-8 h-8 rounded-full" style={{ border: '2px solid rgba(204,0,0,0.2)', borderTopColor: '#CC0000' }} />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="glass-card rounded-3xl p-7 text-center">
      <div className="text-4xl mb-3">🛒</div>
      <div className="font-display font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>No order yet</div>
      <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Talk to Sarah to start building your order
      </div>
    </div>
  )
}

export default function OrderSummary({ order, loading }) {
  if (loading) return <div className="glass-card rounded-3xl p-6"><Spinner /></div>
  if (!order) return <EmptyState />

  const { order_id, items, summary, estimated_time } = order

  return (
    <div className="glass-card-red rounded-3xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🍕</span>
        <span className="font-display font-bold text-sm">Order #{order_id}</span>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.18)', color: '#4ADE80' }}>Confirmed</span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2.5 mb-4">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-sm">{item.pizza}</span>
              <span className="font-bold text-sm ml-3 flex-shrink-0" style={{ color: '#FF9999' }}>
                PKR {item.total?.toLocaleString()}
              </span>
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {item.size} · {item.crust} · Qty {item.quantity}
              {item.add_ons?.length > 0 && <span> · {item.add_ons.join(', ')}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="pt-3.5 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          ['Subtotal', `PKR ${summary.subtotal?.toLocaleString()}`],
          ['Delivery', summary.delivery_fee === 0 ? '✅ Free' : `PKR ${summary.delivery_fee}`],
          ['Tax (13%)', `PKR ${summary.tax?.toLocaleString()}`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <span>{k}</span><span>{v}</span>
          </div>
        ))}
        <div className="flex justify-between font-display font-bold text-base mt-1">
          <span>Total</span>
          <span style={{ color: '#FF9999' }}>PKR {summary.grand_total?.toLocaleString()}</span>
        </div>
      </div>

      {/* ETA */}
      <div className="mt-4 flex items-center gap-2 text-xs rounded-xl px-3 py-2.5" style={{ background: 'rgba(204,0,0,0.12)', color: 'rgba(255,255,255,0.55)' }}>
        <span>🕐</span><span>Estimated delivery: {estimated_time}</span>
      </div>
    </div>
  )
}
