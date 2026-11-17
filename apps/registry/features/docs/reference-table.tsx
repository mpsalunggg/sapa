import { cn } from "@/lib/utils";

export interface PropRow {
  name: string;
  type: string;
  desc: string;
}

export interface TokenRow {
  name: string;
  desc: string;
}

interface Column<R> {
  header: string;
  cell: (row: R) => React.ReactNode;
  className?: string;
}

function DocsTable<R>({
  columns,
  rows,
  rowKey,
}: {
  columns: Column<R>[];
  rows: R[];
  rowKey: (row: R) => string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-muted/40 text-muted-foreground border-b text-xs uppercase tracking-wide">
            {columns.map((c) => (
              <th key={c.header} className="px-3 py-2 font-semibold">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="align-top">
              {columns.map((c) => (
                <td key={c.header} className={cn("px-3 py-2", c.className)}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReferenceTable({ rows }: { rows: PropRow[] }) {
  return (
    <DocsTable
      rows={rows}
      rowKey={(r) => r.name}
      columns={[
        {
          header: "Prop",
          cell: (r) => r.name,
          className:
            "text-foreground whitespace-nowrap font-mono text-xs font-medium",
        },
        {
          header: "Type",
          cell: (r) => r.type,
          className: "text-sapa-info whitespace-nowrap font-mono text-xs",
        },
        {
          header: "Description",
          cell: (r) => r.desc,
          className: "text-muted-foreground",
        },
      ]}
    />
  );
}

export function TokenTable({ rows }: { rows: TokenRow[] }) {
  return (
    <DocsTable
      rows={rows}
      rowKey={(r) => r.name}
      columns={[
        {
          header: "Token",
          cell: (r) => r.name,
          className:
            "text-sapa-info whitespace-nowrap font-mono text-xs font-medium",
        },
        {
          header: "What it colors",
          cell: (r) => r.desc,
          className: "text-muted-foreground",
        },
      ]}
    />
  );
}
