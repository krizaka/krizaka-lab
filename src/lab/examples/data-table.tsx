import { DataTable } from "@krizaka/ui/data-table";

type Row = { id: string; name: string; status: string; plays: number };
const rows: Row[] = [
  { id: "a", name: "Golden hour", status: "Live", plays: 1284 },
  { id: "b", name: "Canal walk", status: "Encoding", plays: 312 },
  { id: "c", name: "Night market", status: "Live", plays: 4120 },
];

export function Example() {
  return (
    <DataTable
      caption="Recent clips"
      rows={rows}
      getRowId={(r) => r.id}
      columns={[
        { id: "name", header: "Name", value: (r: Row) => r.name },
        { id: "status", header: "Status", value: (r: Row) => r.status },
        { id: "plays", header: "Plays", value: (r: Row) => r.plays, align: "end" },
      ]}
      selectable
      defaultSelected={["b"]}
      labels={{ selectRow: () => "Select the row", selectAll: "Select all" }}
      density="compact"
    />
  );
}
