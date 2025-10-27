-- Load CSV data in correct order to avoid foreign key constraints
BEGIN;

-- Load employees first
\copy employees FROM 'data/employees.csv' CSV HEADER;

-- Load customers
\copy customers FROM 'data/customers.csv' CSV HEADER;

-- Load menu items
\copy menu_items FROM 'data/menu_items.csv' CSV HEADER;

-- Load ingredients
\copy ingredients FROM 'data/ingredients.csv' CSV HEADER;

-- Load inventory
\copy inventory FROM 'data/inventory.csv' CSV HEADER;

-- Load ingredient-menu item relationships
\copy ingredient_menu_item FROM 'data/ingredients_menu_items.csv' CSV HEADER;

-- Load orders (now that employees and customers exist)
\copy orders FROM 'data/orders.csv' CSV HEADER;

-- Load tickets (now that orders exist)
\copy tickets FROM 'data/tickets.csv' CSV HEADER;

COMMIT;