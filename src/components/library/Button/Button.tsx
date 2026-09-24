import type { ButtonProps } from "./Button.schema";
import "./Button.css";

type ButtonComponentProps = ButtonProps & {
  active?: boolean;
};

function Button({
  label,
  backgroundColor,
  textColor,
  borderRadius,
  active,
}: ButtonComponentProps) {
  return (
    <button
      type="button"
      className={`button-el${active ? " active" : ""}`}
      style={{
        backgroundColor,
        color: textColor,
        borderRadius: `${borderRadius}px`,
      }}
    >
      {label}
    </button>
  );
}

export default Button;
