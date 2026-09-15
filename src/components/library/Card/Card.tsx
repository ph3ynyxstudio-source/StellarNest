import type { CardProps } from "./Card.schema";
import "./Card.css";

type CardComponentProps = CardProps & {
  active?: boolean;
};

function Card({
  title,
  content,
  backgroundColor,
  borderColor,
  borderWidth,
  borderRadius,
  active,
}: CardComponentProps) {
  return (
    <div
      className={`card${active ? " active" : ""}`}
      style={{
        backgroundColor,
        borderColor,
        borderWidth: `${borderWidth}px`,
        borderRadius: `${borderRadius}px`,
      }}
    >
      <p className="card-title">{title}</p>
      <p className="card-content">{content}</p>
    </div>
  );
}

export default Card;
