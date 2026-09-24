export type TextProps = {
  content: string;
  textColor: string;
};

export const TextSchema = {
  name: "Text",
  props: {
    content: { type: "string", label: "Texte", default: "Texte" },
    textColor: {
      type: "color",
      label: "Couleur du texte",
      default: "#f2f1f8",
    },
  },
};
