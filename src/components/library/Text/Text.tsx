import type { TextProps } from "./Text.schema";
import "./Text.css";

type TextComponentProps = TextProps & {
  active?: boolean;
};

function Text({ content, textColor, active }: TextComponentProps) {
  return (
    <p className={`text-el${active ? " active" : ""}`} style={{ color: textColor }}>
      {content}
    </p>
  );
}

export default Text;
