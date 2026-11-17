import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";

type Row = { goodsJp: string; s1: number };

const columns: ColumnDef<Row>[] = [
  { accessorKey: "goodsJp", header: "商品" },
  { accessorKey: "s1", header: "駅1" },
];

describe("DataTable column widths", () => {
  it("uses narrow station columns and a compact item column", () => {
    render(<DataTable columns={columns} data={[{ goodsJp: "A", s1: 1 }]} />);

    const stationHeader = screen.getByText("駅1").closest("th")!;
    expect(stationHeader).toHaveClass("w-20");
    expect(stationHeader).not.toHaveClass("w-32");

    const itemHeader = screen.getByText("商品").closest("th")!;
    expect(itemHeader).not.toHaveClass("min-w-[150px]");
  });
});
