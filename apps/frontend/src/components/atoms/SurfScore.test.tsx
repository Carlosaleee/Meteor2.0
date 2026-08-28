import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SurfScore } from "@/components/atoms/SurfScore";

describe("SurfScore", () => {
  it("renders the numeric score", () => {
    render(<SurfScore score={74} />);
    expect(screen.getByText("74")).toBeInTheDocument();
    expect(screen.getByText(/Surf Score/i)).toBeInTheDocument();
  });
});
