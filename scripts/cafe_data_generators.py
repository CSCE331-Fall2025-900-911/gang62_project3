import random
from datetime import datetime, timedelta
from csv_handler import read_csv

TAX_RATE = 0.0625

def get_inventory():
    """
    Load the menu from file
    """

    ingredients = read_csv("data/ingredients.csv")[1:]

    inventory = []

    for inventory_id, item in enumerate(ingredients):
        ingredient_id = item[0]
        stock = random.randrange(1000, 10000)
        inventory.append([inventory_id, ingredient_id, stock])

    return inventory

def daterange(start, end):
    dates = []
    d = start
    while d <= end:
        dates.append(d)
        d += timedelta(days=1)
    return dates

def _hourly_weight(hour):
    # simple cafe pattern: morning ramp, lunch spike, afternoon steady, evening taper
    if 7 <= hour <= 9:
        return 0.9
    if 10 <= hour <= 13:
        return 1.4
    if 14 <= hour <= 17:
        return 1.1
    if 18 <= hour <= 20:
        return 0.7
    return 0.3

def _semester_peak_multiplier(day):
    # Boost around late August and mid January for semester starts
    month, daynum = day.month, day.day
    boost = 1.0
    if (month == 8 and 15 <= daynum <= 31) or (month == 1 and 10 <= daynum <= 24):
        boost = 1.8
    return boost

def make_orders_and_tickets(menu, start_date, end_date, beta, peaks=12):
    base_daily_orders = 140
    daily_orders = max(40, int(base_daily_orders * beta))

    # choose peak days
    all_days = list(daterange(start_date, end_date))
    peak_days = set(random.sample(all_days, k=min(peaks, len(all_days))))

    orders = []
    tickets = []
    oid = 1
    tid = 1
    employee_ids = list(range(1, 11))
    customer_ids = list(range(1, 51))

    for day in all_days:
        # modifier stack
        day_multiplier = 1.5
        if day in peak_days:
            day_multiplier *= 3.0
        day_multiplier *= _semester_peak_multiplier(day)

        n_orders = int(daily_orders * day_multiplier)

        # distribute across hours
        weights = [max(_hourly_weight(h), 0.01) for h in range(24)]
        total_w = sum(weights)
        per_hour = [int(n_orders * w / total_w) for w in weights]

        # adjust rounding
        while sum(per_hour) < n_orders:
            idx = random.randrange(24)
            per_hour[idx] += 1

        for hour, count in enumerate(per_hour):
            for _ in range(count):
                line_count = random.randint(1, 3)
                lines = []
                subtotal = 0
                for __ in range(line_count):
                    mid, _name, price = random.choice(menu)
                    price = int(price)
                    qty = 1 if random.random() < 0.85 else 2
                    line_total = price * qty
                    subtotal += line_total
                    lines.append((mid, qty, line_total))
                tax = int(round(subtotal * TAX_RATE))
                total = subtotal + tax
                emp = random.choice(employee_ids)
                cust = random.choice(customer_ids)
                status = 1
                minute = random.randint(0, 59)
                second = random.randint(0, 59)
                created_at = datetime(day.year, day.month, day.day, hour, minute, second)
                orders.append((oid, emp, cust, status, subtotal, tax, total, created_at.isoformat()))
                for m_id, qty, line_total in lines:
                    tickets.append((tid, oid, m_id, qty, line_total))
                    tid += 1
                oid += 1

    return orders, tickets, peak_days
