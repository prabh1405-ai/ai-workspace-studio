export const SQL_LINES = [
  "SELECT  c.customer_id, c.name, SUM(o.total_amount) AS total_spent",
  "FROM    customers c",
  "JOIN    orders o ON c.customer_id = o.customer_id",
  "WHERE   o.order_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)",
  "GROUP BY c.customer_id, c.name",
  "ORDER BY total_spent DESC",
  "LIMIT 10;",
];

export const EXPLANATION = [
  {
    code: "SELECT c.customer_id, c.name, SUM(o.total_amount) AS total_spent",
    text: "Selects customer id, customer name and the total amount spent.",
  },
  { code: "FROM customers c", text: "Reads data from customers table and aliases it as c." },
  {
    code: "JOIN orders o ON c.customer_id = o.customer_id",
    text: "Joins orders table (alias o) with customers table (alias c) using customer id.",
  },
  {
    code: "WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)",
    text: "Filters orders from the last 3 months.",
  },
  {
    code: "GROUP BY c.customer_id, c.name",
    text: "Groups the results by customer to calculate total spending.",
  },
  { code: "ORDER BY total_spent DESC", text: "Sorts customers by total spending in descending order." },
  { code: "LIMIT 10;", text: "Returns only the top 10 customers." },
];

export const RESULT_ROWS = [
  { n: 1, customer_id: "CUST1002", name: "Rahul Sharma", total_spent: "125000.75" },
  { n: 2, customer_id: "CUST1005", name: "Priya Nair", total_spent: "98050.40" },
  { n: 3, customer_id: "CUST1001", name: "Arjun Mehta", total_spent: "87540.30" },
];

export const QUERY_INFO = [
  ["Execution Time", "0.023 sec"],
  ["Rows Returned", "10"],
  ["Columns", "3"],
  ["Query Type", "SELECT"],
] as const;
