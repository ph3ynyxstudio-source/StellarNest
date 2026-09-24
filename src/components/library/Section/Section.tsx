import type { SectionProps } from "./Section.schema";
import "./Section.css";

type SectionComponentProps = SectionProps & {
  active?: boolean;
};

function Section({ backgroundColor, padding, active }: SectionComponentProps) {
  return (
    <div
      className={`section-el${active ? " active" : ""}`}
      style={{ backgroundColor, padding: `${padding}px` }}
    />
  );
}

export default Section;
