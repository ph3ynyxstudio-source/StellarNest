export type SectionProps = {
  backgroundColor: string;
  padding: number;
};

export const SectionSchema = {
  name: "Section",
  props: {
    backgroundColor: {
      type: "color",
      label: "Couleur de fond",
      default: "#1b2040",
    },
    padding: {
      type: "number",
      label: "Padding interne",
      default: 16,
    },
  },
};
