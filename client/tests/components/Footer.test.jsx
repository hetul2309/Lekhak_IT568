import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  it("renders the copyright notice", () => {
    render(<Footer />);

    expect(
      screen.getByText("© 2026 Lekhak. All rights reserved.")
    ).toBeInTheDocument();
  });
});
