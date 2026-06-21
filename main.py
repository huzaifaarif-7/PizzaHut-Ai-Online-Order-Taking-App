from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

app = FastAPI(title="Pizza Hut Sarah - AI Ordering Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Models ─────────────────────────────────────────────────────────

class OrderItem(BaseModel):
    name: str
    size: Optional[str] = "Medium"
    crust: Optional[str] = "Pan"
    quantity: int = 1
    add_ons: Optional[List[str]] = []

class OrderRequest(BaseModel):
    items: List[OrderItem]
    session_id: Optional[str] = None
    customer_name: Optional[str] = None

class SessionRequest(BaseModel):
    session_id: Optional[str] = None

# ─── In-memory store ─────────────────────────────────────────────────────────

sessions = {}

# ─── Menu Data ───────────────────────────────────────────────────────────────

MENU = {
    "pizzas": [
        {
            "id": "p1",
            "name": "Chicken Tikka",
            "description": "Classic chicken tikka flavor with signature sauce",
            "category": "Chicken",
            "prices": {"Small": 899, "Medium": 1399, "Large": 1999},
            "crust_prices": {
                "Small": {"Pan": 899, "Stuffed Crust": 1099, "Thin Crust": 999},
                "Medium": {"Pan": 1399, "Stuffed Crust": 1699, "Thin Crust": 1499},
                "Large": {"Pan": 1999, "Stuffed Crust": 2399, "Thin Crust": 2199}
            },
            "image": "🍕",
            "popular": True
        },
        {
            "id": "p2",
            "name": "Chicken Fajita",
            "description": "Tender chicken fajita with onion and green pepper notes",
            "category": "Chicken",
            "prices": {"Small": 899, "Medium": 1399, "Large": 1999},
            "crust_prices": {
                "Small": {"Pan": 899, "Stuffed Crust": 1099, "Thin Crust": 999},
                "Medium": {"Pan": 1399, "Stuffed Crust": 1699, "Thin Crust": 1499},
                "Large": {"Pan": 1999, "Stuffed Crust": 2399, "Thin Crust": 2199}
            },
            "image": "🍕",
            "popular": True
        },
        {
            "id": "p3",
            "name": "Chicken Supreme",
            "description": "Loaded chicken pizza with premium toppings",
            "category": "Chicken",
            "prices": {"Small": 999, "Medium": 1499, "Large": 2199},
            "crust_prices": {
                "Small": {"Pan": 999, "Stuffed Crust": 1199, "Thin Crust": 1099},
                "Medium": {"Pan": 1499, "Stuffed Crust": 1799, "Thin Crust": 1599},
                "Large": {"Pan": 2199, "Stuffed Crust": 2599, "Thin Crust": 2399}
            },
            "image": "🍕",
            "popular": True
        },
        {
            "id": "p4",
            "name": "Pepperoni",
            "description": "Classic pepperoni pizza with rich tomato base",
            "category": "Meat",
            "prices": {"Small": 1099, "Medium": 1599, "Large": 2299},
            "crust_prices": {
                "Small": {"Pan": 1099, "Stuffed Crust": 1299, "Thin Crust": 1199},
                "Medium": {"Pan": 1599, "Stuffed Crust": 1899, "Thin Crust": 1699},
                "Large": {"Pan": 2299, "Stuffed Crust": 2699, "Thin Crust": 2499}
            },
            "image": "🍕",
            "popular": False
        },
    ],
    "crusts": [
        {"id": "c1", "name": "Pan", "extra_price": 0},
        {"id": "c2", "name": "Thin Crust", "extra_price": 200},
        {"id": "c3", "name": "Stuffed Crust", "extra_price": 400},
    ],
    "add_ons": [
        {"id": "a1", "name": "Extra Cheese", "price": 250},
        {"id": "a2", "name": "Extra Topping", "price": 200},
    ],
    "customization_options": {
        "remove_ingredients": "Free",
        "spice_level_options": ["Mild", "Medium", "Spicy"],
        "stuffed_crust_upgrade_note": "Additional PKR 300 to 400 depending on size"
    },
    "sides": [
        {"id": "s1", "name": "Garlic Bread", "price": 499},
        {"id": "s2", "name": "Chicken Wings", "price": 799},
        {"id": "s3", "name": "Fries", "price": 399},
        {"id": "s4", "name": "Pasta", "price": 699},
    ],
    "drinks": [
        {"id": "d1", "name": "Regular Soft Drink", "price": 199},
        {"id": "d2", "name": "Large Soft Drink", "price": 299},
        {"id": "d3", "name": "1.5 Liter Bottle", "price": 349},
    ],
    "desserts": [
        {"id": "ds1", "name": "Lava Cake", "price": 399},
        {"id": "ds2", "name": "Brownie", "price": 349},
        {"id": "ds3", "name": "Ice Cream", "price": 299},
    ],
    "deals": [
        {
            "id": "deal1",
            "name": "My Box Deal",
            "description": "1 Personal Pizza + Fries + 1 Drink",
            "price": 699,
            "saves": 0
        },
        {
            "id": "deal2",
            "name": "Medium Duo Deal",
            "description": "2 Medium Pizzas",
            "price": 2499,
            "saves": 0
        },
        {
            "id": "deal3",
            "name": "Family Feast Deal",
            "description": "2 Large Pizzas + Garlic Bread + 1.5L Drink",
            "price": 3999,
            "saves": 0
        },
        {
            "id": "deal4",
            "name": "WOW Deal",
            "description": "1 Medium Pizza + Garlic Bread + 1 Drink",
            "price": 1599,
            "saves": 0
        },
    ]
}

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Pizza Hut Sarah API is live 🍕", "version": "1.0.0"}

@app.get("/menu")
def get_menu():
    return {
        "status": "success",
        "data": MENU,
        "currency": "PKR",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/order")
def place_order(order: OrderRequest):
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item.")

    pizza_lookup = {p["name"].lower(): p for p in MENU["pizzas"]}
    crust_lookup = {c["name"].lower(): c for c in MENU["crusts"]}
    addon_lookup = {a["name"].lower(): a for a in MENU["add_ons"]}

    order_lines = []
    subtotal = 0

    for item in order.items:
        pizza = pizza_lookup.get(item.name.lower())
        if not pizza:
            # Try partial match
            pizza = next((p for p in MENU["pizzas"] if item.name.lower() in p["name"].lower()), None)
        if not pizza:
            raise HTTPException(status_code=404, detail=f"Pizza '{item.name}' not found in menu.")

        size = item.size or "Medium"
        if size not in pizza["prices"]:
            size = "Medium"

        base_price = pizza["prices"][size]
        requested_crust = item.crust or "Pan"
        crust_prices = pizza.get("crust_prices", {})
        if size in crust_prices and requested_crust in crust_prices[size]:
            crust_name = requested_crust
            unit_price = crust_prices[size][requested_crust]
        else:
            crust = crust_lookup.get(requested_crust.lower())
            crust_name = crust["name"] if crust else "Pan"
            crust_price = crust["extra_price"] if crust else 0
            unit_price = base_price + crust_price

        addon_total = 0
        addon_names = []
        for addon_name in (item.add_ons or []):
            addon = addon_lookup.get(addon_name.lower())
            if addon:
                addon_total += addon["price"]
                addon_names.append(addon["name"])

        item_total = (unit_price + addon_total) * item.quantity
        subtotal += item_total

        order_lines.append({
            "pizza": pizza["name"],
            "size": size,
            "crust": crust_name,
            "add_ons": addon_names,
            "quantity": item.quantity,
            "unit_price": unit_price + addon_total,
            "total": item_total
        })

    delivery_fee = 149 if subtotal < 1500 else 0
    tax = round(subtotal * 0.13)
    grand_total = subtotal + delivery_fee + tax

    order_id = f"PHT-{uuid.uuid4().hex[:6].upper()}"

    result = {
        "status": "success",
        "order_id": order_id,
        "customer_name": order.customer_name or "Valued Customer",
        "items": order_lines,
        "summary": {
            "subtotal": subtotal,
            "delivery_fee": delivery_fee,
            "tax": tax,
            "grand_total": grand_total,
            "currency": "PKR",
            "free_delivery_note": "Free delivery on orders above PKR 1500" if delivery_fee > 0 else "✅ Free Delivery Applied!"
        },
        "estimated_time": "30-45 minutes",
        "timestamp": datetime.now().isoformat()
    }

    # Store in session if provided
    if order.session_id and order.session_id in sessions:
        sessions[order.session_id]["order"] = result

    return result

@app.post("/session")
def create_or_get_session(req: SessionRequest):
    sid = req.session_id or str(uuid.uuid4())
    if sid not in sessions:
        sessions[sid] = {
            "session_id": sid,
            "created_at": datetime.now().isoformat(),
            "order": None
        }
    return {"status": "success", "session": sessions[sid]}

@app.get("/session/{session_id}")
def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "success", "session": sessions[session_id]}
