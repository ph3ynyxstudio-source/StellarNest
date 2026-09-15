export type CardProps = {
  title: string;
  content: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
};

export const CardSchema = {
  name: "Card",
  props: {
    title: { type: "string", label: "Titre", default: "Titre" },
    content: { type: "string", label: "Contenu", default: "Contenu" },
    backgroundColor: {
      type: "color",
      label: "Couleur de fond",
      default: "#141830",
    },
    borderColor: {
      type: "color",
      label: "Couleur du contour",
      default: "#2a2f52",
    },
    borderWidth: {
      type: "number",
      label: "Épaisseur du contour",
      default: 1,
    },
    borderRadius: {
      type: "number",
      label: "Rondeur des bords",
      default: 12,
    },
  },
};
