import argparse
import os
import random
from datetime import datetime, timedelta
from documentation import write_assumptions, write_readme
from csv_handler import write_csv, read_csv
from cafe_data_generators import *

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def build_arg_parser():
    p = argparse.ArgumentParser(description="Generates seed SQL")
    p.add_argument("--weeks", type=int, default=56, help="Number of weeks to generate")
    p.add_argument("--beta", type=float, default=1.0, help="Target sales in millions of dollars")
    p.add_argument("--peaks", type=int, default=12, help="Number of peak sales days")
    p.add_argument("--out", type=str, default=os.path.join(ROOT_DIR), help="Output directory")
    p.add_argument("--today", type=str, default=datetime(2025, 9, 24).strftime("%Y-%m-%d"), help="YYYY-MM-DD")
    p.add_argument("--seed", type=int, default=69, help="Random seed")
    return p

def main():
    args = build_arg_parser().parse_args()
    random.seed(args.seed)

    today = datetime.strptime(args.today, "%Y-%m-%d")
    start_date = today - timedelta(weeks=args.weeks)
    start_date = datetime(start_date.year, start_date.month, start_date.day)

    out_dir = args.out
    os.makedirs(out_dir, exist_ok=True)

    menu = read_csv(os.path.join(ROOT_DIR, "data/menu_items.csv"))[1:]
    orders, tickets, peak_days = make_orders_and_tickets(menu, start_date, today, args.beta, args.peaks)
    inventory = get_inventory()

    # Write CSVs
    orders_path = os.path.join(ROOT_DIR, "data/orders.csv")
    write_csv(orders_path, orders, ['id','employee_id','customer_id','status','subtotal_cents','tax_cents','total_cents','created_at'])
    tickets_path = os.path.join(ROOT_DIR, "data/tickets.csv")
    write_csv(tickets_path, tickets, ['id','order_id','menu_item_id','qty','line_total_cents'])
    inventory_path = os.path.join(ROOT_DIR, "data/inventory.csv")
    write_csv(inventory_path, inventory, ['id', 'ingredient_id', 'stock'])

    # Docs
    docs_dir = os.path.join(ROOT_DIR, "docs")
    os.makedirs(docs_dir, exist_ok=True)
    
    readme_path = os.path.join(docs_dir, "README.md")
    write_readme(readme_path, args.weeks, args.beta, args.peaks, today, start_date)
    
    assumptions_path = os.path.join(docs_dir, "assumptions.json")
    write_assumptions(assumptions_path, args.weeks, args.beta, args.peaks, start_date, today)

    print("Wrote files to", os.path.abspath(out_dir))
    print("Peak days used:", ", ".join(sorted({d.strftime('%Y-%m-%d') for d in peak_days})))

if __name__ == "__main__":
    main()
