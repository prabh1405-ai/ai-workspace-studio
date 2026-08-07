import type { ReactNode } from "react";

const KEYWORDS = new Set([
  "SELECT","FROM","JOIN","ON","WHERE","GROUP","BY","ORDER","LIMIT","AS","DESC","ASC",
  "INTERVAL","MONTH","AND","OR","CREATE","DATABASE","USE","TABLE","VIEW","INSERT","INTO",
  "VALUES","UPDATE","SET","DELETE","NOT","NULL","PRIMARY","KEY","FOREIGN","REFERENCES",
  "UNIQUE","DEFAULT","AUTO_INCREMENT","CASCADE","CHECK","INDEX","CONSTRAINT",
]);

const TYPES = new Set([
  "INT","BIGINT","VARCHAR","TEXT","DECIMAL","DATETIME","TIMESTAMP","DATE","BOOLEAN",
  "FLOAT","DOUBLE","CHAR","JSON","ENUM","CURRENT_TIMESTAMP",
]);

const FUNCS = new Set(["DATE_SUB", "CURDATE", "SUM", "COUNT", "AVG", "MIN", "MAX"]);

/** Lightweight SQL tokenizer for displaying generated queries and DDL. */
export function highlightSql(sql: string): ReactNode[] {
  if (sql.trimStart().startsWith("--")) {
    return [
      <span key="c" className="text-muted-foreground italic">
        {sql}
      </span>,
    ];
  }

  const parts = sql.split(/(\s+|[(),;=])/).filter((p) => p !== "");

  return parts.map((token, i) => {
    const upper = token.toUpperCase();
    let className = "text-code-ident";

    if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
    else if (FUNCS.has(upper)) className = "text-code-func";
    else if (KEYWORDS.has(upper)) className = "text-code-keyword font-semibold";
    else if (TYPES.has(upper)) className = "text-code-string";
    else if (/^\d+(\.\d+)?$/.test(token)) className = "text-code-number";
    else if (/^'.*'$/.test(token)) className = "text-code-string";
    else if (/^[(),;=]$/.test(token)) className = "text-muted-foreground";

    return (
      <span key={i} className={className}>
        {token}
      </span>
    );
  });
}
