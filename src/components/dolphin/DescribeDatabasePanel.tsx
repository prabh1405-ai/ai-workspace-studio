import { useState } from "react";
import { Lightbulb, Sparkles, ChevronDown, Database } from "lucide-react";

export function DescribeDatabasePanel() {
  const [text, setText] = useState(
    "Create an e-commerce database with customers, sellers, products, categories, inventory, cart, orders, order items, payments, coupons, reviews, shipping addresses and support for multiple warehouses.",
  );

  return (
    <section className="panel-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Describe your database</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Provide your requirements in natural language.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[15px] font-medium text-accent transition-colors hover:bg-secondary/60"
        >
          <Lightbulb className="h-[17px] w-[17px]" strokeWidth={1.8} />
          Sample Prompts
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        aria-label="Database requirements"
        className="mt-4 w-full resize-none rounded-xl border border-border bg-secondary/25 p-4 text-[15.5px] leading-relaxed focus:border-ring focus:outline-none"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-[15px] font-medium transition-colors hover:bg-secondary"
        >
          <Database className="h-[17px] w-[17px] text-muted-foreground" strokeWidth={1.8} />
          MySQL
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Sparkles className="h-[17px] w-[17px]" strokeWidth={2} />
          Generate Schema
        </button>
        <button
          type="button"
          onClick={() => setText("")}
          className="rounded-lg border border-border px-6 py-2.5 text-[15px] font-medium transition-colors hover:bg-secondary"
        >
          Clear
        </button>
      </div>
    </section>
  );
}
