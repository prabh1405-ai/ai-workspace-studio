CREATE SCHEMA IF NOT EXISTS demo;

CREATE TABLE demo.customers (
  customer_id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  signup_date date NOT NULL
);

CREATE TABLE demo.categories (
  category_id serial PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE demo.products (
  product_id serial PRIMARY KEY,
  name text NOT NULL,
  category_id int NOT NULL REFERENCES demo.categories(category_id),
  price numeric(10,2) NOT NULL,
  stock int NOT NULL DEFAULT 0
);

CREATE TABLE demo.orders (
  order_id serial PRIMARY KEY,
  customer_id text NOT NULL REFERENCES demo.customers(customer_id),
  order_date date NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  status text NOT NULL
);

CREATE TABLE demo.order_items (
  order_item_id serial PRIMARY KEY,
  order_id int NOT NULL REFERENCES demo.orders(order_id),
  product_id int NOT NULL REFERENCES demo.products(product_id),
  quantity int NOT NULL,
  price numeric(10,2) NOT NULL
);

CREATE TABLE demo.payments (
  payment_id serial PRIMARY KEY,
  order_id int NOT NULL REFERENCES demo.orders(order_id),
  method text NOT NULL,
  amount numeric(10,2) NOT NULL,
  paid_at date NOT NULL
);

CREATE TABLE demo.reviews (
  review_id serial PRIMARY KEY,
  product_id int NOT NULL REFERENCES demo.products(product_id),
  customer_id text NOT NULL REFERENCES demo.customers(customer_id),
  rating int NOT NULL,
  comment text
);

INSERT INTO demo.customers (customer_id, name, email, city, country, signup_date) VALUES
('CUST1001','Arjun Mehta','arjun@example.com','Mumbai','India','2023-02-11'),
('CUST1002','Rahul Sharma','rahul@example.com','Delhi','India','2023-04-02'),
('CUST1003','Sneha Iyer','sneha@example.com','Bengaluru','India','2023-05-19'),
('CUST1004','Karan Verma','karan@example.com','Pune','India','2023-07-08'),
('CUST1005','Priya Nair','priya@example.com','Kochi','India','2023-08-23'),
('CUST1006','Ananya Rao','ananya@example.com','Hyderabad','India','2024-01-14'),
('CUST1007','Vikram Singh','vikram@example.com','Jaipur','India','2024-02-27'),
('CUST1008','Meera Joshi','meera@example.com','Ahmedabad','India','2024-03-30');

INSERT INTO demo.categories (name) VALUES ('Electronics'),('Home'),('Books'),('Fashion');

INSERT INTO demo.products (name, category_id, price, stock) VALUES
('Wireless Headphones',1,2499.00,120),
('Mechanical Keyboard',1,5499.00,45),
('4K Monitor',1,18999.00,20),
('Coffee Maker',2,3299.00,60),
('Table Lamp',2,899.00,150),
('SQL Fundamentals',3,749.00,200),
('Data Modeling Guide',3,1099.00,80),
('Cotton T-Shirt',4,599.00,300),
('Running Shoes',4,3199.00,90),
('Smart Watch',1,7999.00,35);

INSERT INTO demo.orders (customer_id, order_date, total_amount, status) VALUES
('CUST1001', CURRENT_DATE - 5, 7998.00, 'delivered'),
('CUST1001', CURRENT_DATE - 40, 18999.00, 'delivered'),
('CUST1002', CURRENT_DATE - 12, 5499.00, 'shipped'),
('CUST1002', CURRENT_DATE - 22, 3299.00, 'delivered'),
('CUST1002', CURRENT_DATE - 70, 1348.00, 'delivered'),
('CUST1003', CURRENT_DATE - 3, 749.00, 'pending'),
('CUST1003', CURRENT_DATE - 33, 3199.00, 'delivered'),
('CUST1004', CURRENT_DATE - 8, 899.00, 'delivered'),
('CUST1005', CURRENT_DATE - 15, 7999.00, 'delivered'),
('CUST1005', CURRENT_DATE - 60, 2499.00, 'cancelled'),
('CUST1006', CURRENT_DATE - 2, 1099.00, 'pending'),
('CUST1007', CURRENT_DATE - 19, 3798.00, 'shipped'),
('CUST1007', CURRENT_DATE - 90, 5499.00, 'delivered'),
('CUST1008', CURRENT_DATE - 27, 18999.00, 'delivered');

INSERT INTO demo.order_items (order_id, product_id, quantity, price) VALUES
(1,1,2,2499.00),(1,5,1,899.00),
(2,3,1,18999.00),
(3,2,1,5499.00),
(4,4,1,3299.00),
(5,6,1,749.00),(5,5,1,899.00),
(6,6,1,749.00),
(7,9,1,3199.00),
(8,5,1,899.00),
(9,10,1,7999.00),
(10,1,1,2499.00),
(11,7,1,1099.00),
(12,8,2,599.00),(12,4,1,3299.00),
(13,2,1,5499.00),
(14,3,1,18999.00);

INSERT INTO demo.payments (order_id, method, amount, paid_at) VALUES
(1,'upi',7998.00, CURRENT_DATE - 5),
(2,'card',18999.00, CURRENT_DATE - 40),
(3,'card',5499.00, CURRENT_DATE - 12),
(4,'netbanking',3299.00, CURRENT_DATE - 22),
(5,'upi',1348.00, CURRENT_DATE - 70),
(7,'card',3199.00, CURRENT_DATE - 33),
(8,'upi',899.00, CURRENT_DATE - 8),
(9,'card',7999.00, CURRENT_DATE - 15),
(12,'upi',3798.00, CURRENT_DATE - 19),
(13,'card',5499.00, CURRENT_DATE - 90),
(14,'netbanking',18999.00, CURRENT_DATE - 27);

INSERT INTO demo.reviews (product_id, customer_id, rating, comment) VALUES
(1,'CUST1001',5,'Great sound quality'),
(3,'CUST1001',4,'Sharp display'),
(2,'CUST1002',5,'Lovely typing feel'),
(4,'CUST1002',3,'Works fine'),
(6,'CUST1003',5,'Best SQL intro'),
(9,'CUST1003',4,'Comfortable'),
(10,'CUST1005',4,'Good battery'),
(7,'CUST1006',5,'Very practical'),
(8,'CUST1007',3,'Fabric is thin'),
(3,'CUST1008',5,'Worth the price');

CREATE TABLE public.query_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt text NOT NULL,
  sql text NOT NULL,
  row_count int NOT NULL DEFAULT 0,
  duration_ms int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.query_history TO anon, authenticated;
GRANT ALL ON public.query_history TO service_role;
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Query history is readable" ON public.query_history FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.practice_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number int NOT NULL,
  difficulty text NOT NULL,
  topic text NOT NULL,
  question text NOT NULL,
  tables text[] NOT NULL DEFAULT '{}',
  hint text NOT NULL,
  pro_tip text NOT NULL,
  solution_sql text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.practice_problems TO anon, authenticated;
GRANT ALL ON public.practice_problems TO service_role;
ALTER TABLE public.practice_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Practice problems are readable" ON public.practice_problems FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.practice_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid NOT NULL REFERENCES public.practice_problems(id) ON DELETE CASCADE,
  submitted_sql text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  row_count int NOT NULL DEFAULT 0,
  duration_ms int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.practice_attempts TO anon, authenticated;
GRANT ALL ON public.practice_attempts TO service_role;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Practice attempts are readable" ON public.practice_attempts FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.practice_problems (number, difficulty, topic, question, tables, hint, pro_tip, solution_sql) VALUES
(1,'Easy','SELECT','List the name and city of every customer.', ARRAY['customers'], 'You only need a simple SELECT with two columns.', 'Selecting only the columns you need keeps queries fast.', 'SELECT name, city FROM customers'),
(2,'Medium','GROUP BY','Show the total number of orders placed by each customer.', ARRAY['customers','orders'], 'Join customers to orders and use COUNT with GROUP BY.', 'Use COUNT(column) to count non-null values. To include customers with no orders, use LEFT JOIN.', 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name ORDER BY total_orders DESC'),
(3,'Easy','WHERE','Find all products that cost more than 3000.', ARRAY['products'], 'Filter rows with a WHERE clause on price.', 'Numeric comparisons do not need quotes.', 'SELECT name, price FROM products WHERE price > 3000 ORDER BY price DESC'),
(4,'Medium','JOIN','Show each order id with the customer name who placed it.', ARRAY['orders','customers'], 'Join orders to customers on customer_id.', 'Alias your tables to keep joins readable.', 'SELECT o.order_id, c.name FROM orders o JOIN customers c ON c.customer_id = o.customer_id ORDER BY o.order_id'),
(5,'Medium','AGGREGATE','Show the average product price per category name.', ARRAY['products','categories'], 'Join categories and use AVG with GROUP BY.', 'ROUND(AVG(price), 2) gives cleaner output.', 'SELECT ct.name AS category, ROUND(AVG(p.price),2) AS avg_price FROM products p JOIN categories ct ON ct.category_id = p.category_id GROUP BY ct.name ORDER BY avg_price DESC'),
(6,'Hard','HAVING','List customers who placed more than 2 orders.', ARRAY['customers','orders'], 'Use GROUP BY with a HAVING filter on COUNT.', 'HAVING filters groups, WHERE filters rows.', 'SELECT c.name, COUNT(o.order_id) AS total_orders FROM customers c JOIN orders o ON o.customer_id = c.customer_id GROUP BY c.name HAVING COUNT(o.order_id) > 2 ORDER BY total_orders DESC'),
(7,'Hard','SUBQUERY','Find products whose price is above the overall average price.', ARRAY['products'], 'Use a scalar subquery with AVG in the WHERE clause.', 'Scalar subqueries return a single value you can compare against.', 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products) ORDER BY price DESC'),
(8,'Medium','ORDER BY','Show the 5 highest value orders with their status.', ARRAY['orders'], 'Sort by total_amount descending and limit the result.', 'ORDER BY ... DESC LIMIT n is the classic top-N pattern.', 'SELECT order_id, total_amount, status FROM orders ORDER BY total_amount DESC LIMIT 5'),
(9,'Hard','JOIN','Show total revenue per product name from order items.', ARRAY['order_items','products'], 'Multiply quantity by price and aggregate per product.', 'SUM(quantity * price) computes line-level revenue.', 'SELECT p.name, SUM(oi.quantity * oi.price) AS revenue FROM order_items oi JOIN products p ON p.product_id = oi.product_id GROUP BY p.name ORDER BY revenue DESC'),
(10,'Easy','SELECT','Show the average rating for each product id.', ARRAY['reviews'], 'Group reviews by product_id and use AVG on rating.', 'AVG ignores NULL ratings.', 'SELECT product_id, ROUND(AVG(rating),2) AS avg_rating FROM reviews GROUP BY product_id ORDER BY avg_rating DESC');

CREATE OR REPLACE FUNCTION public.exec_demo_readonly(query_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = demo, pg_temp
AS $$
DECLARE
  cleaned text;
  result jsonb;
BEGIN
  cleaned := btrim(regexp_replace(query_text, ';\s*$', ''));

  IF cleaned = '' THEN
    RAISE EXCEPTION 'Empty query';
  END IF;
  IF position(';' in cleaned) > 0 THEN
    RAISE EXCEPTION 'Only a single statement is allowed';
  END IF;
  IF lower(cleaned) !~ '^(select|with)\s' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;
  IF lower(cleaned) ~ '\m(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|vacuum|call|do|merge|comment|reindex|listen|notify|set|reset)\M' THEN
    RAISE EXCEPTION 'Only read-only SELECT queries are allowed';
  END IF;

  EXECUTE format('SELECT coalesce(jsonb_agg(t), ''[]''::jsonb) FROM (%s) t LIMIT 500', cleaned) INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.exec_demo_readonly(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.exec_demo_readonly(text) TO service_role;