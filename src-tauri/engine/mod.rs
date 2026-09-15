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
    out.push_str("      </div>");

    out
}

// Même défaut que `designTokens.colors.bgCard` côté frontend
// (src/theme/design_tokens.ts), utilisé quand aucune couleur n'a encore été
// choisie dans le style-panel.
const DEFAULT_CANVAS_BACKGROUND_COLOR: &str = "#141830";

/// Génère le code source d'une page React à partir de l'état du canvas.
/// Seuls les éléments avec `componentRef: "Card"` sont pris en charge à ce stade.
pub fn generate_page(state: &CanvasState) -> String {
    let mut elements_jsx = String::new();
    for el in state.elements.iter().filter(|el| el.component_ref == "Card") {
        elements_jsx.push_str(&render_element(el));
        elements_jsx.push('\n');
    }

    let background_color = state
        .canvas_background_color
        .as_deref()
        .unwrap_or(DEFAULT_CANVAS_BACKGROUND_COLOR);

    let mut out = String::new();
    out.push_str("import Card from \"../../components/library/Card/Card\";\n\n");
    out.push_str("function GeneratedPage() {\n");
    out.push_str("  return (\n");
    out.push_str(
        "    <div style={{ position: \"relative\", minHeight: 600, backgroundColor: \"",
    );
    out.push_str(&escape_js_string(background_color));
    out.push_str("\" }}>\n");
    out.push_str(&elements_jsx);
    out.push_str("    </div>\n");
    out.push_str("  );\n");
    out.push_str("}\n\n");
    out.push_str("export default GeneratedPage;\n");
    out
}
