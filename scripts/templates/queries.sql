-- Special Query #1: Weekly Sales History
-- Purpose: Count how many orders occur in each ISO calendar week.
SELECT
  TO_CHAR(created_at, 'IYYY-IW') AS year_week,
  COUNT(*) AS orders_count
FROM orders
GROUP BY year_week
ORDER BY year_week;


-- Special Query #2: Realistic Sales History by Hour
-- Purpose: For each hour of the day, report the number of orders and the sum of totals.
SELECT
  EXTRACT(HOUR FROM created_at)::INT AS hour_of_day,
  COUNT(*) AS orders_count,
  SUM(total_cents)::NUMERIC / 100.0 AS total_dollars
FROM orders
GROUP BY hour_of_day
ORDER BY hour_of_day;


-- Special Query #3: Peak Sales Day
-- Purpose: Find the top 10 days by total sales.
SELECT
  created_at::DATE AS day,
  ROUND(SUM(total_cents)::NUMERIC / 100.0, 2) AS total_dollars
FROM orders
GROUP BY day
ORDER BY total_dollars DESC
LIMIT 10;


-- Special Query #4: Menu Item Inventory
-- Purpose: For each menu item, count how many inventory items (ingredients) it uses.
SELECT
  mi.id AS menu_item_id,
  mi.name AS menu_item,
  COUNT(imi.ingredient_id) AS ingredient_count
FROM menu_items mi
LEFT JOIN ingredient_menu_item imi
  ON imi.menu_item_id = mi.id
GROUP BY mi.id, mi.name
ORDER BY ingredient_count DESC, mi.id;


-- Special Query #5: Best of the Worst
-- Purpose: For each ISO week, find the lowest sales day and report that day's sales
--          and the top-selling menu item by quantity for that lowest day.
WITH sales_by_day AS (
  SELECT
    DATE_TRUNC('week', created_at)::DATE AS week_start,
    created_at::DATE AS day,
    SUM(total_cents) AS day_total_cents
  FROM orders
  GROUP BY week_start, day
),
lowest_by_week AS (
  SELECT week_start, day, day_total_cents
  FROM (
    SELECT
      week_start,
      day,
      day_total_cents,
      ROW_NUMBER() OVER (
        PARTITION BY week_start
        ORDER BY day_total_cents ASC, day ASC
      ) AS rn
    FROM sales_by_day
  ) x
  WHERE rn = 1
),
top_seller_that_day AS (
  SELECT
    o.created_at::DATE AS day,
    t.menu_item_id,
    SUM(t.qty) AS qty_sold
  FROM tickets t
  JOIN orders o ON o.id = t.order_id
  GROUP BY day, t.menu_item_id
)
SELECT
  TO_CHAR(l.week_start, 'IYYY-IW') AS year_week,
  l.day,
  ROUND(l.day_total_cents::NUMERIC / 100.0, 2) AS lowest_sales_dollars,
  mi.name AS top_seller
FROM lowest_by_week l
JOIN top_seller_that_day ts
  ON ts.day = l.day
JOIN menu_items mi
  ON mi.id = ts.menu_item_id
WHERE ts.qty_sold = (
  SELECT MAX(ts2.qty_sold)
  FROM top_seller_that_day ts2
  WHERE ts2.day = l.day
)
ORDER BY year_week;

-- 1) Orders summary
SELECT COUNT(*) AS orders_count,
        ROUND(SUM(subtotal_cents)/100.0, 2) AS subtotal_dollars,
        ROUND(SUM(tax_cents)/100.0, 2) AS tax_dollars,
        ROUND(SUM(total_cents)/100.0, 2) AS total_dollars
FROM orders
LIMIT 10;

-- 2. List all orders with customer and employee info
SELECT o.id AS order_id, c.name AS customer, e.name AS employee,
       o.subtotal_cents, o.tax_cents, o.total_cents
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN employees e ON o.employee_id = e.id
LIMIT 10;

-- 3. Show all menu items with their ingredients
SELECT m.name AS menu_item, i.name AS ingredient
FROM menu_items m
JOIN ingredient_menu_item im ON m.id = im.menu_item_id
JOIN ingredients i ON im.ingredient_id = i.id
ORDER BY m.name, i.name;

-- 4. Show inventory for each ingredient
SELECT i.name AS ingredient, inv.stock
FROM inventory inv
JOIN ingredients i ON inv.ingredient_id = i.id
ORDER BY i.name;

--5. Find all tickets with their order and menu item names
SELECT t.id AS ticket_id, t.qty, t.line_total_cents,
       m.name AS menu_item, o.id AS order_id
FROM tickets t
JOIN menu_items m ON t.menu_item_id = m.id
JOIN orders o ON t.order_id = o.id
LIMIT 10;

-- 6. Total revenue per employee
SELECT e.name AS employee, SUM(o.total_cents) AS total_revenue
FROM orders o
JOIN employees e ON o.employee_id = e.id
GROUP BY e.name
ORDER BY total_revenue DESC;

-- 7. Total spending per customer
SELECT c.name AS customer, SUM(o.total_cents) AS total_spent
FROM orders o
JOIN customers c ON o.customer_id = c.id
GROUP BY c.name
ORDER BY total_spent DESC;

-- 8. Top-selling menu items by quantity
SELECT m.name AS menu_item, SUM(t.qty) AS total_qty_sold
FROM tickets t
JOIN menu_items m ON t.menu_item_id = m.id
GROUP BY m.name
ORDER BY total_qty_sold DESC;

-- 9. Orders that are closed (completed)
SELECT o.id AS order_id, c.name AS customer, o.status
FROM orders o
JOIN customers c ON o.customer_id = c.id
LIMIT 10;

-- 10. Ingredients running low (stock < 5000 units)
SELECT i.name AS ingredient, inv.stock
FROM inventory inv
JOIN ingredients i ON inv.ingredient_id = i.id
WHERE inv.stock < 5000;

-- 11. Average order value
SELECT AVG(total_cents) AS avg_order_value
FROM orders;
