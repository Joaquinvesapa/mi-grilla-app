import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { DemoSearchInput } from "@/app/demo/social/_components/demo-search-input";

// ── Tests ────────────────────────────────────────────────────

describe("DemoSearchInput", () => {
  it("renders a search input with aria-label Buscar", () => {
    render(<DemoSearchInput value="" onChange={vi.fn()} />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-label", "Buscar");
  });

  it("renders the search SVG icon with aria-hidden", () => {
    const { container } = render(<DemoSearchInput value="" onChange={vi.fn()} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("displays the provided value in the input", () => {
    render(<DemoSearchInput value="tyler" onChange={vi.fn()} />);
    expect(screen.getByRole("searchbox")).toHaveValue("tyler");
  });

  it("calls onChange with the new value when input changes", () => {
    const handleChange = vi.fn();
    render(<DemoSearchInput value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "lewis" } });
    expect(handleChange).toHaveBeenCalledWith("lewis");
  });

  it("renders with custom placeholder when provided", () => {
    render(<DemoSearchInput value="" onChange={vi.fn()} placeholder="Buscar usuario..." />);
    expect(screen.getByPlaceholderText("Buscar usuario...")).toBeInTheDocument();
  });

  it("renders with default placeholder when none provided", () => {
    render(<DemoSearchInput value="" onChange={vi.fn()} />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("placeholder");
  });

  it("calls onChange with empty string when input is cleared", () => {
    const handleChange = vi.fn();
    render(<DemoSearchInput value="lorde" onChange={handleChange} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
    expect(handleChange).toHaveBeenCalledWith("");
  });
});
