import os
import datetime
import json


def write_readme(
        out_dir    : os.path, 
        weeks      : int, 
        beta       : float, 
        peaks      : int, 
        end_date   : datetime.datetime, 
        start_date : datetime.datetime) -> None:
    """
    Writes the given assumptions to the readme file. 
    """

    # Construct the README file content
    readme_content = f"""
    Cafe Sales Seed and Queries

    Assumptions
    - α weeks: {weeks}
    - β million in sales: ~{beta:.2f}M targeted
    - φ peak days: {peaks}
    - δ menu items: 20 placeholder items
    - θ special queries: 5 included
    - Time window: {start_date.date().isoformat()} through {end_date.date().isoformat()}

    Files
    - schema.sql
    - seed_data.sql
    - queries.sql
    - assumptions.json
    """.strip()

    # Write out the README
    with open(out_dir, "w") as file:
        file.write(readme_content)

def write_assumptions(
        out_dir    : os.path, 
        weeks      : int, 
        beta       : float, 
        peaks      : int, 
        start_date : datetime.datetime, 
        end_date   : datetime.datetime) -> None:

    """
    Write the given assumptions to a JSON file
    """

    # Construct a JSON-able dict
    assumptions_content = {
        "alpha_weeks": weeks,
        "beta_millions": beta,
        "phi_peaks": peaks,
        "delta_menu_items": 20,
        "theta_special": 5,
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
    }

    # Write to the given destination
    with open(out_dir, "w") as file:
        json.dump(assumptions_content, file, indent=2)