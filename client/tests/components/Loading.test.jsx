import { render, screen } from "@testing-library/react";
import Loading from "@/components/Loading";

vi.mock("@/assets/images/tube-spinner.svg", () => ({ default: "tube-spinner.svg" }));

describe("Loading", () => {
  it("displays the loading animation", () => {
    render(<Loading />);

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", "tube-spinner.svg");
    expect(image).toHaveAttribute("width", "100");
  });
});
