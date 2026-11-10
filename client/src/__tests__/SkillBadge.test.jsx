import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillBadge } from "../components/SkillBadge";

describe("SkillBadge", () => {
  it("renders the skill label", () => {
    render(<SkillBadge label="React" matched />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders unmatched skills distinctly", () => {
    render(<SkillBadge label="Kubernetes" matched={false} />);
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
  });
});
