export type ButtonProps = {
  label: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
};

export const ButtonSchema = {
  name: "Button",
  props: {
    label: { type: "string", label: "Texte du bouton", default: "Bouton" },
    backgroundColor: {
      type: "color",
      label: "Couleur de fond",
      default: "#7c5cff",
    },
    textColor: {
      type: "color",
      label: "Couleur du texte",
      default: "#ffffff",
    },
    borderRadius: {
      type: "number",
      label: "Rondeur des bords",
      default: 8,
    },
  },
};
