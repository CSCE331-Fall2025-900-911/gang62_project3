
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS ingredient_menu_item CASCADE;

CREATE TABLE employees (
    id                  INT PRIMARY KEY,
    name                TEXT NOT NULL,
    status              TEXT
);

CREATE TABLE customers (
    id                  INT PRIMARY KEY,
    name                TEXT NOT NULL,
    phone               TEXT,
    email               TEXT
);

CREATE TABLE menu_items (
    id                  INT PRIMARY KEY,
    name                TEXT NOT NULL,
    base_price_cents    INT NOT NULL
);

CREATE TABLE ingredients (
    id                  INT PRIMARY KEY,
    name                TEXT NOT NULL,
    qty_per_unit        NUMERIC(10,3) NOT NULL -- 1.250 liters of milk is typically enough preciscion
);

CREATE TABLE inventory (
    id                  INT PRIMARY KEY,
    ingredient_id       INT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    stock               INT NOT NULL
);

CREATE TABLE orders (
    id                  INT PRIMARY KEY,
    employee_id         INT REFERENCES employees(id),
    customer_id         INT REFERENCES customers(id),
    status              INT,
    subtotal_cents      INT NOT NULL,
    tax_cents           INT NOT NULL,
    total_cents         INT NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE tickets (
    id                  INT PRIMARY KEY,
    order_id            INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id        INT NOT NULL REFERENCES menu_items(id),
    qty                 INT NOT NULL CHECK (qty > 0),
    line_total_cents    INT NOT NULL
);

CREATE TABLE ingredient_menu_item (
    id                  INT PRIMARY KEY,
    menu_item_id        INT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id       INT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE
);
