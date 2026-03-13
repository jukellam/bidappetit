from datetime import date, time, datetime, timezone

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.restaurant import RestaurantProfile
from app.models.event import Event
from app.models.bid import Bid
from app.models.booking import Booking


def seed_database(db: Session) -> None:
    # --- Users ---
    planners = [
        User(id=1, email="sarah@example.com", name="Sarah Chen", user_type="planner"),
        User(id=2, email="marcus@example.com", name="Marcus Johnson", user_type="planner"),
        User(id=3, email="elena@example.com", name="Elena Rodriguez", user_type="planner"),
    ]
    restaurant_users = [
        User(id=4, email="bellanotte@example.com", name="Bella Notte", user_type="restaurant"),
        User(id=5, email="sakura@example.com", name="Sakura House", user_type="restaurant"),
        User(id=6, email="eljardin@example.com", name="El Jardin", user_type="restaurant"),
        User(id=7, email="primecut@example.com", name="The Prime Cut", user_type="restaurant"),
        User(id=8, email="petitbistro@example.com", name="Le Petit Bistro", user_type="restaurant"),
    ]
    db.add_all(planners + restaurant_users)
    db.flush()

    # --- Restaurant Profiles ---
    profiles = [
        RestaurantProfile(
            user_id=4, name="Bella Notte", city="San Francisco",
            cuisine_type="Italian", price_range="$$$$",
            description="Upscale Italian dining with handmade pasta and an award-winning wine cellar. Perfect for elegant corporate events and celebrations.",
            photo_urls=[], total_capacity=120, private_dining_capacity=40,
            hours="11:00 AM - 11:00 PM",
        ),
        RestaurantProfile(
            user_id=5, name="Sakura House", city="San Francisco",
            cuisine_type="Japanese", price_range="$$$",
            description="Authentic Japanese cuisine featuring omakase, robata grill, and a stunning sake collection. Intimate private rooms available.",
            photo_urls=[], total_capacity=80, private_dining_capacity=20,
            hours="5:00 PM - 10:00 PM",
        ),
        RestaurantProfile(
            user_id=6, name="El Jardin", city="Chicago",
            cuisine_type="Mexican", price_range="$$",
            description="Vibrant modern Mexican restaurant with a beautiful garden patio. Known for craft cocktails and creative small plates.",
            photo_urls=[], total_capacity=150, private_dining_capacity=50,
            hours="11:00 AM - 12:00 AM",
        ),
        RestaurantProfile(
            user_id=7, name="The Prime Cut", city="Chicago",
            cuisine_type="Steakhouse", price_range="$$$$",
            description="Premier Chicago steakhouse featuring dry-aged cuts, an extensive bourbon collection, and private dining rooms with skyline views.",
            photo_urls=[], total_capacity=100, private_dining_capacity=30,
            hours="4:00 PM - 11:00 PM",
        ),
        RestaurantProfile(
            user_id=8, name="Le Petit Bistro", city="San Francisco",
            cuisine_type="French", price_range="$$$",
            description="Charming French bistro offering classic dishes with a modern twist. Cozy atmosphere perfect for intimate gatherings.",
            photo_urls=[], total_capacity=60, private_dining_capacity=15,
            hours="6:00 PM - 10:00 PM",
        ),
    ]
    db.add_all(profiles)
    db.flush()

    # --- Events ---
    events = [
        # 1: Open, no bids (SF)
        Event(
            id=1, planner_id=1, title="Annual Tech Summit Dinner",
            description="End-of-conference networking dinner for 80 tech industry professionals. Looking for a venue that can accommodate presentations and mingling.",
            city="San Francisco", date=date(2026, 4, 15), time=time(18, 30),
            guest_count=80, budget_min=5000, budget_max=8000,
            bid_deadline=datetime(2026, 4, 8, 23, 59, tzinfo=timezone.utc),
            status="open", event_type="corporate",
            cuisine_preferences="Open to all cuisines", vibe="Professional yet relaxed",
        ),
        # 2: Open, no bids (Chicago)
        Event(
            id=2, planner_id=2, title="Spring Garden Wedding Reception",
            description="Elegant wedding reception following a garden ceremony. Need a venue that offers both indoor and outdoor space with a dance floor.",
            city="Chicago", date=date(2026, 5, 20), time=time(17, 0),
            duration_hours=5.0, guest_count=120, budget_min=8000, budget_max=15000,
            bid_deadline=datetime(2026, 5, 6, 23, 59, tzinfo=timezone.utc),
            status="open", event_type="wedding",
            cuisine_preferences="American or Italian", dietary_restrictions="Vegetarian options required",
            vibe="Romantic and elegant",
        ),
        # 3: Open, has 2 bids (SF)
        Event(
            id=3, planner_id=1, title="Corporate Holiday Party",
            description="Annual holiday celebration for a growing startup. Fun, festive atmosphere with great food and drinks. Looking for a semi-private space.",
            city="San Francisco", date=date(2026, 4, 25), time=time(19, 0),
            guest_count=50, budget_min=3000, budget_max=6000,
            bid_deadline=datetime(2026, 4, 18, 23, 59, tzinfo=timezone.utc),
            status="open", event_type="holiday",
            vibe="Festive and fun", special_requests="Photo booth area if possible",
        ),
        # 4: Open, has 3 bids (Chicago)
        Event(
            id=4, planner_id=3, title="Charity Fundraiser Gala",
            description="Black-tie fundraiser gala supporting local arts education. Premium dining experience with auction and entertainment.",
            city="Chicago", date=date(2026, 5, 10), time=time(18, 0),
            duration_hours=4.0, guest_count=100, budget_min=6000, budget_max=12000,
            bid_deadline=datetime(2026, 4, 26, 23, 59, tzinfo=timezone.utc),
            status="open", event_type="fundraiser",
            cuisine_preferences="Fine dining", dietary_restrictions="Gluten-free options needed",
            vibe="Sophisticated and glamorous",
        ),
        # 5: Booked (SF)
        Event(
            id=5, planner_id=2, title="Executive Team Building Dinner",
            description="Intimate dinner for the executive team. Looking for a quiet, private setting with excellent food and personalized service.",
            city="San Francisco", date=date(2026, 4, 5), time=time(19, 30),
            guest_count=25, budget_min=2000, budget_max=4000,
            bid_deadline=datetime(2026, 3, 29, 23, 59, tzinfo=timezone.utc),
            status="booked", event_type="corporate",
            cuisine_preferences="French or Japanese", vibe="Intimate and upscale",
        ),
        # 6: Cancelled (SF)
        Event(
            id=6, planner_id=1, title="Product Launch Celebration",
            description="Celebration for a major product launch. Cocktail-style event with appetizers and drinks.",
            city="San Francisco", date=date(2026, 4, 20), time=time(17, 30),
            guest_count=60, budget_min=4000, budget_max=7000,
            bid_deadline=datetime(2026, 4, 13, 23, 59, tzinfo=timezone.utc),
            status="cancelled", event_type="cocktail",
            vibe="Modern and celebratory",
        ),
    ]
    db.add_all(events)
    db.flush()

    # --- Bids ---
    bids = [
        # Bids on event 3 (Holiday Party) — from restaurants 4 and 5
        Bid(
            id=1, event_id=3, restaurant_id=4, price_total=5200, price_per_person=104,
            proposal_text="We'd love to host your holiday party at Bella Notte! Our semi-private mezzanine seats 50 comfortably with a festive ambiance.",
            menu_details="4-course Italian holiday menu: bruschetta trio, winter salad, choice of osso buco or sea bass, panettone dessert",
            space_details="Mezzanine level with dedicated bar and DJ area",
            inclusions="Complimentary sparkling wine toast, holiday decorations, coat check",
            status="pending",
        ),
        Bid(
            id=2, event_id=3, restaurant_id=5, price_total=4500, price_per_person=90,
            proposal_text="Sakura House offers a unique holiday experience with Japanese-inspired festivities. Our private tatami room can be transformed for your celebration.",
            menu_details="Premium shared plates: sashimi platter, wagyu sliders, tempura selection, matcha dessert bar",
            space_details="Private room with traditional and modern seating options",
            inclusions="Sake tasting flight for each guest, custom menu cards",
            status="pending",
        ),
        # Bids on event 4 (Fundraiser Gala) — from restaurants 6, 7, and 4
        Bid(
            id=3, event_id=4, restaurant_id=6, price_total=8500, price_per_person=85,
            proposal_text="El Jardin's garden courtyard is the perfect setting for your gala. We'll create an unforgettable evening under the stars.",
            menu_details="5-course Mexican fine dining: ceviche trio, mole negro, herb-crusted lamb, tres leches cake",
            space_details="Full garden courtyard with stage area for auction, indoor backup space",
            inclusions="Mariachi band, custom cocktail menu, valet parking coordination",
            status="pending",
        ),
        Bid(
            id=4, event_id=4, restaurant_id=7, price_total=11000, price_per_person=110,
            proposal_text="The Prime Cut will deliver a world-class gala experience. Our grand dining room with skyline views sets the perfect backdrop.",
            menu_details="Premium 5-course: oysters, lobster bisque, dry-aged ribeye, chocolate soufflé",
            space_details="Grand dining room (100 cap) with dedicated auction stage and reception area",
            inclusions="Premium open bar, valet parking, professional event coordinator on-site",
            status="pending",
        ),
        Bid(
            id=5, event_id=4, restaurant_id=4, price_total=9800, price_per_person=98,
            proposal_text="Bella Notte brings Italian elegance to your fundraiser. We specialize in creating memorable gala experiences.",
            menu_details="Italian gala menu: antipasto display, risotto course, branzino, tiramisu station",
            space_details="Full restaurant buyout with cocktail reception in lounge area",
            inclusions="Italian wine pairing, live music, custom printed menus",
            status="pending",
        ),
        # Bids on event 5 (Team Building) — restaurant 8 accepted, restaurant 4 rejected
        Bid(
            id=6, event_id=5, restaurant_id=8, price_total=3200, price_per_person=128,
            proposal_text="Le Petit Bistro is ideal for intimate executive dinners. Our private dining room offers exclusivity and personalized service.",
            menu_details="Chef's tasting menu: French onion soup, duck confit, beef bourguignon, crème brûlée",
            space_details="Private dining room seating 25 with fireplace",
            inclusions="Sommelier-curated wine pairing, personalized place cards, amuse-bouche",
            status="accepted",
        ),
        Bid(
            id=7, event_id=5, restaurant_id=4, price_total=3500, price_per_person=140,
            proposal_text="Bella Notte's private cellar room provides an intimate setting for your executive team dinner.",
            menu_details="5-course Italian tasting: carpaccio, handmade ravioli, veal piccata, panna cotta",
            space_details="Wine cellar private dining room",
            inclusions="Wine pairing, private sommelier, custom menu design",
            status="rejected",
        ),
    ]
    db.add_all(bids)
    db.flush()

    # --- Booking for event 5 ---
    booking = Booking(
        id=1, event_id=5, bid_id=6, planner_id=2, restaurant_id=8,
        status="confirmed",
    )
    db.add(booking)
    db.commit()
