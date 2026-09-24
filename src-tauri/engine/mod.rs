// Component Engine — résolution et transformation canvas ↔ code.
//
// Cette première tranche ne fait que générer un nouveau fichier propre à
// partir de l'état du canvas (pas de réécriture AST d'un fichier existant —
// ce sera une itération suivante, voir docs/architecture.md).

use crate::{CanvasElementState, CanvasState};

fn format_num(value: f64) -> String {
    if (value - value.round()).abs() < 0.001 {
        format!("{}", value.round() as i64)
    } else {
        format!("{:.2}", value)
    }
}

fn escape_js_string(value: &str) -> String {
    value
        .replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
}

// Components de la librairie pris en charge par l'export, voir docs/components.md.
const SUPPORTED_COMPONENTS: [&str; 4] = ["Card", "Button", "Section", "Text"];

fn render_element(el: &CanvasElementState) -> String {
    let mut out = String::new();

    out.push_str("      <div style={{ position: \"absolute\", left: ");
    out.push_str(&format_num(el.x));
    out.push_str(", top: ");
    out.push_str(&format_num(el.y));
    out.push_str(", width: ");
    out.push_str(&format_num(el.width));
    out.push_str(", height: ");
    out.push_str(&format_num(el.height));
    out.push_str(" }}>\n");

    match el.component_ref.as_str() {
        "Button" => {
            out.push_str("        <Button\n");
            out.push_str(&format!(
                "          label=\"{}\"\n",
                escape_js_string(&el.label)
            ));
            out.push_str(&format!(
                "          backgroundColor=\"{}\"\n",
                escape_js_string(&el.background_color)
            ));
            out.push_str(&format!(
                "          textColor=\"{}\"\n",
                escape_js_string(&el.text_color)
            ));
            out.push_str(&format!(
                "          borderRadius={{{}}}\n",
                format_num(el.border_radius)
            ));
            out.push_str("        />\n");
        }
        "Section" => {
            out.push_str("        <Section\n");
            out.push_str(&format!(
                "          backgroundColor=\"{}\"\n",
                escape_js_string(&el.background_color)
            ));
            out.push_str(&format!(
                "          padding={{{}}}\n",
                format_num(el.padding)
            ));
            out.push_str("        />\n");
        }
        "Text" => {
            out.push_str("        <Text\n");
            out.push_str(&format!(
                "          content=\"{}\"\n",
                escape_js_string(&el.content)
            ));
            out.push_str(&format!(
                "          textColor=\"{}\"\n",
                escape_js_string(&el.text_color)
            ));
            out.push_str("        />\n");
        }
        _ => {
            out.push_str("        <Card\n");
            out.push_str(&format!(
                "          title=\"{}\"\n",
                escape_js_string(&el.title)
            ));
            out.push_str(&format!(
                "          content=\"{}\"\n",
                escape_js_string(&el.content)
            ));
            out.push_str(&format!(
                "          backgroundColor=\"{}\"\n",
                escape_js_string(&el.background_color)
            ));
            out.push_str(&format!(
                "          borderColor=\"{}\"\n",
                escape_js_string(&el.border_color)
            ));
            out.push_str(&format!(
                "          borderWidth={{{}}}\n",
                format_num(el.border_width)
            ));
            out.push_str(&format!(
                "          borderRadius={{{}}}\n",
                format_num(el.border_radius)
            ));
            out.push_str("        />\n");
        }
    }

    out.push_str("      </div>");

    out
}

// Même défaut que `designTokens.colors.bgCard` côté frontend
// (src/theme/design_tokens.ts), utilisé quand aucune couleur n'a encore été
// choisie dans le style-panel.
const DEFAULT_CANVAS_BACKGROUND_COLOR: &str = "#141830";

// Même défaut que `CANVAS_DEFAULT_HEIGHT` côté frontend
// (src/screens/Editor/Editor.tsx), utilisé quand aucune hauteur n'a encore
// été choisie via la poignée de redimensionnement du canvas.
const DEFAULT_CANVAS_HEIGHT: f64 = 600.0;

/// Génère le code source d'une page React à partir de l'état du canvas.
/// Les éléments dont le `componentRef` n'est pas dans `SUPPORTED_COMPONENTS`
/// sont ignorés.
pub fn generate_page(state: &CanvasState) -> String {
    let mut elements_jsx = String::new();
    for el in state
        .elements
        .iter()
        .filter(|el| SUPPORTED_COMPONENTS.contains(&el.component_ref.as_str()))
    {
        elements_jsx.push_str(&render_element(el));
        elements_jsx.push('\n');
    }

    let uses = |name: &str| {
        state
            .elements
            .iter()
            .any(|el| el.component_ref == name)
    };

    let mut imports = String::new();
    if uses("Card") {
        imports.push_str("import Card from \"../../components/library/Card/Card\";\n");
    }
    if uses("Button") {
        imports.push_str("import Button from \"../../components/library/Button/Button\";\n");
    }
    if uses("Section") {
        imports.push_str("import Section from \"../../components/library/Section/Section\";\n");
    }
    if uses("Text") {
        imports.push_str("import Text from \"../../components/library/Text/Text\";\n");
    }

    let background_color = state
        .canvas_background_color
        .as_deref()
        .unwrap_or(DEFAULT_CANVAS_BACKGROUND_COLOR);

    let canvas_height = state.canvas_height.unwrap_or(DEFAULT_CANVAS_HEIGHT);

    let mut out = String::new();
    out.push_str(&imports);
    out.push('\n');
    out.push_str("function GeneratedPage() {\n");
    out.push_str("  return (\n");
    out.push_str("    <div style={{ position: \"relative\", minHeight: ");
    out.push_str(&format_num(canvas_height));
    out.push_str(", backgroundColor: \"");
    out.push_str(&escape_js_string(background_color));
    out.push_str("\" }}>\n");
    out.push_str(&elements_jsx);
    out.push_str("    </div>\n");
    out.push_str("  );\n");
    out.push_str("}\n\n");
    out.push_str("export default GeneratedPage;\n");
    out
}
