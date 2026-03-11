import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PriceValueCell } from "@/components/PriceValueCell";

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
}));

describe("PriceValueCell", () => {
  it("renders mobile value with trend icon when value is positive", () => {
    const { container } = render(
      <PriceValueCell
        value={120}
        displayValue="120"
        colorClass="text-red-400"
        isHighlighted={true}
        trend={1}
        quota={0.9}
        showPercent={false}
        isMobile={true}
      />
    );

    expect(screen.getByText("120")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-green-600");
  });

  it("does not render mobile trend icon when value is zero", () => {
    const { container } = render(
      <PriceValueCell
        value={0}
        displayValue="-"
        colorClass="text-red-400"
        isHighlighted={false}
        trend={0}
        quota={0.7}
        showPercent={false}
        isMobile={true}
      />
    );

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("renders desktop tooltip content with money when showPercent is true", () => {
    render(
      <PriceValueCell
        value={12345}
        displayValue="110%"
        colorClass="text-green-400"
        isHighlighted={true}
        trend={1}
        quota={1.1}
        showPercent={true}
        isMobile={false}
      />
    );

    expect(screen.getByText("110%")).toBeInTheDocument();
    expect(screen.getByText("💰12,345")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-content")).toBeInTheDocument();
  });

  it("renders desktop tooltip content with percent when showPercent is false", () => {
    render(
      <PriceValueCell
        value={999}
        displayValue="999"
        colorClass="text-red-400"
        isHighlighted={false}
        trend={0}
        quota={0.83}
        showPercent={false}
        isMobile={false}
      />
    );

    expect(screen.getByText("999")).toBeInTheDocument();
    expect(screen.getByText("83%")).toBeInTheDocument();
  });
});
