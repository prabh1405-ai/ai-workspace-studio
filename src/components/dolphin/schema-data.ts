export type EntityColumn = { name: string; key?: "PK" | "FK" };
export type Entity = {
  id: string;
  x: number;
  y: number;
  accent: "primary" | "accent" | "success" | "number" | "keyword";
  columns: EntityColumn[];
};

export const ENTITIES: Entity[] = [
  {
    id: "customers", x: 24, y: 8, accent: "accent",
    columns: [
      { name: "customer_id", key: "PK" }, { name: "name" }, { name: "email" },
      { name: "phone" }, { name: "created_at" },
    ],
  },
  {
    id: "orders", x: 196, y: 8, accent: "accent",
    columns: [
      { name: "order_id", key: "PK" }, { name: "customer_id", key: "FK" },
      { name: "order_date" }, { name: "status" }, { name: "total_amount" },
    ],
  },
  {
    id: "order_items", x: 368, y: 8, accent: "accent",
    columns: [
      { name: "order_item_id", key: "PK" }, { name: "order_id", key: "FK" },
      { name: "product_id", key: "FK" }, { name: "quantity" }, { name: "price" },
    ],
  },
  {
    id: "products", x: 540, y: 8, accent: "keyword",
    columns: [
      { name: "product_id", key: "PK" }, { name: "seller_id", key: "FK" },
      { name: "category_id", key: "FK" }, { name: "name" }, { name: "price" },
      { name: "stock" },
    ],
  },
  {
    id: "sellers", x: 712, y: 68, accent: "accent",
    columns: [
      { name: "seller_id", key: "PK" }, { name: "name" }, { name: "email" }, { name: "phone" },
    ],
  },
  {
    id: "payments", x: 196, y: 200, accent: "primary",
    columns: [
      { name: "payment_id", key: "PK" }, { name: "order_id", key: "FK" },
      { name: "payment_method" }, { name: "amount" }, { name: "payment_status" },
    ],
  },
  {
    id: "categories", x: 368, y: 200, accent: "success",
    columns: [
      { name: "category_id", key: "PK" }, { name: "name" }, { name: "description" },
    ],
  },
  {
    id: "inventory", x: 540, y: 228, accent: "number",
    columns: [
      { name: "inventory_id", key: "PK" }, { name: "product_id", key: "FK" },
      { name: "warehouse_id", key: "FK" }, { name: "stock_quantity" },
    ],
  },
  {
    id: "cart", x: 24, y: 368, accent: "primary",
    columns: [
      { name: "cart_id", key: "PK" }, { name: "customer_id", key: "FK" }, { name: "created_at" },
    ],
  },
  {
    id: "cart_items", x: 172, y: 368, accent: "primary",
    columns: [
      { name: "cart_item_id", key: "PK" }, { name: "cart_id", key: "FK" },
      { name: "product_id", key: "FK" }, { name: "quantity" },
    ],
  },
  {
    id: "reviews", x: 344, y: 368, accent: "success",
    columns: [
      { name: "review_id", key: "PK" }, { name: "product_id", key: "FK" },
      { name: "customer_id", key: "FK" }, { name: "rating" }, { name: "comment" },
    ],
  },
  {
    id: "shipping_addresses", x: 508, y: 368, accent: "accent",
    columns: [
      { name: "address_id", key: "PK" }, { name: "customer_id", key: "FK" },
      { name: "address1" }, { name: "city" }, { name: "state" }, { name: "pincode" },
      { name: "country" },
    ],
  },
  {
    id: "coupons", x: 700, y: 368, accent: "keyword",
    columns: [
      { name: "coupon_id", key: "PK" }, { name: "code" }, { name: "discount_type" },
      { name: "discount_value" }, { name: "min_order_amount" }, { name: "valid_from" },
      { name: "valid_to" }, { name: "is_active" },
    ],
  },
];

/** Relationship edges: [from, to, side pair] */
export const RELATIONS: Array<{ from: string; to: string; kind: "h" | "v" }> = [
  { from: "customers", to: "orders", kind: "h" },
  { from: "orders", to: "order_items", kind: "h" },
  { from: "order_items", to: "products", kind: "h" },
  { from: "products", to: "sellers", kind: "h" },
  { from: "orders", to: "payments", kind: "v" },
  { from: "categories", to: "products", kind: "v" },
  { from: "products", to: "inventory", kind: "v" },
  { from: "customers", to: "cart", kind: "v" },
  { from: "cart", to: "cart_items", kind: "h" },
  { from: "categories", to: "reviews", kind: "v" },
  { from: "customers", to: "shipping_addresses", kind: "v" },
  { from: "sellers", to: "coupons", kind: "v" },
];

export const DDL_LINES = [
  "-- Generated SQL (Preview)",
  "CREATE DATABASE ecommerce_db;",
  "USE ecommerce_db;",
  "",
  "CREATE TABLE customers (",
  "  customer_id INT AUTO_INCREMENT PRIMARY KEY,",
  "  name VARCHAR(100) NOT NULL,",
  "  email VARCHAR(100) UNIQUE,",
  "  phone VARCHAR(15),",
  "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
  ");",
  "",
  "CREATE TABLE orders (",
  "  order_id INT AUTO_INCREMENT PRIMARY KEY,",
  "  customer_id INT NOT NULL,",
  "  order_date DATETIME NOT NULL,",
  "  status VARCHAR(20) NOT NULL,",
  "  total_amount DECIMAL(10,2) NOT NULL,",
  "  FOREIGN KEY (customer_id)",
  "    REFERENCES customers(customer_id)",
  "      ON DELETE CASCADE",
  ");",
  "",
  "CREATE TABLE order_items (",
  "  order_item_id INT AUTO_INCREMENT PRIMARY KEY,",
  "  order_id INT NOT NULL,",
  "  product_id INT NOT NULL,",
  "  quantity INT NOT NULL,",
  "  price DECIMAL(10,2) NOT NULL,",
  "  FOREIGN KEY (order_id)",
  "    REFERENCES orders(order_id) ON DELETE CASCADE,",
  "  FOREIGN KEY (product_id)",
  "    REFERENCES products(product_id) ON DELETE CASCADE",
  ");",
  "",
  "-- More tables...",
];

export const DESIGN_SUMMARY = [
  ["Total Tables", "12"],
  ["Relationships", "16"],
  ["Indexes", "18"],
] as const;

export const GENERATED_SUMMARY = [
  ["Database Name", "ecommerce_db"],
  ["Total Tables", "12"],
  ["Total Relationships", "16"],
  ["Total Indexes", "18"],
  ["Normalization", "3NF Compliant"],
] as const;

export const VALIDATION = ["12 Tables", "18 Indexes", "16 Relationships", "No issues found"];
