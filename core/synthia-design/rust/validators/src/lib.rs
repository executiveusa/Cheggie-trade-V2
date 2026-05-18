use regex::Regex;
use serde::Deserialize;
use std::path::Path;

#[derive(Debug, Deserialize)]
pub struct AntiPatternRegistry {
    pub anti_patterns: Vec<AntiPattern>,
}

#[derive(Debug, Deserialize)]
pub struct AntiPattern {
    pub id: String,
    pub name: String,
    pub severity: Severity,
    pub description: String,
    pub detection: Option<String>,
    pub fix: String,
    #[serde(default)]
    pub manual_review: bool,
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Blocker,
    Major,
    Minor,
}

#[derive(Debug)]
pub struct Violation {
    pub pattern_id: String,
    pub pattern_name: String,
    pub severity: String,
    pub message: String,
    pub line: usize,
    pub column: usize,
}

pub struct Validator {
    patterns: Vec<CompiledPattern>,
}

struct CompiledPattern {
    id: String,
    name: String,
    severity: String,
    regex: Regex,
    fix: String,
}

impl Validator {
    /// Load anti-patterns from the registry YAML file
    pub fn from_registry(registry_path: &Path) -> anyhow::Result<Self> {
        let content = std::fs::read_to_string(registry_path)?;
        let registry: AntiPatternRegistry = serde_yaml::from_str(&content)?;

        let mut patterns = Vec::new();
        for ap in registry.anti_patterns {
            if ap.manual_review {
                continue; // Skip manual-review-only patterns
            }
            if let Some(detection) = &ap.detection {
                if detection == "manual_review" {
                    continue;
                }
                if let Ok(regex) = Regex::new(detection) {
                    patterns.push(CompiledPattern {
                        id: ap.id.clone(),
                        name: ap.name.clone(),
                        severity: format!("{:?}", ap.severity).to_lowercase(),
                        regex,
                        fix: ap.fix.clone(),
                    });
                }
            }
        }

        Ok(Self { patterns })
    }

    /// Validate a file's content against all compiled anti-patterns
    pub fn validate(&self, content: &str) -> Vec<Violation> {
        let mut violations = Vec::new();
        let lines: Vec<&str> = content.lines().collect();

        for pattern in &self.patterns {
            for mat in pattern.regex.find_iter(content) {
                let byte_offset = mat.start();
                let (line, column) = byte_to_line_col(content, byte_offset);

                violations.push(Violation {
                    pattern_id: pattern.id.clone(),
                    pattern_name: pattern.name.clone(),
                    severity: pattern.severity.clone(),
                    message: format!("{}: {} — Fix: {}", pattern.id, pattern.name, pattern.fix),
                    line,
                    column,
                });
            }
        }

        violations
    }

    /// Validate a file at the given path
    pub fn validate_file(&self, path: &Path) -> anyhow::Result<Vec<Violation>> {
        let content = std::fs::read_to_string(path)?;
        Ok(self.validate(&content))
    }
}

fn byte_to_line_col(content: &str, byte_offset: usize) -> (usize, usize) {
    let mut line = 1;
    let mut col = 1;
    for (i, ch) in content.char_indices() {
        if i >= byte_offset {
            break;
        }
        if ch == '\n' {
            line += 1;
            col = 1;
        } else {
            col += 1;
        }
    }
    (line, col)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detects_banned_font() {
        let content = r#"body { font-family: Inter, sans-serif; }"#;
        let pattern = CompiledPattern {
            id: "AP-TYP-001".to_string(),
            name: "Banned Font Usage".to_string(),
            severity: "blocker".to_string(),
            regex: Regex::new(r"(?i)font-family[^;]*(?:Inter|Roboto|Arial|Helvetica|Open Sans)").unwrap(),
            fix: "Use approved typefaces".to_string(),
        };
        let validator = Validator { patterns: vec![pattern] };
        let violations = validator.validate(content);
        assert_eq!(violations.len(), 1);
        assert_eq!(violations[0].pattern_id, "AP-TYP-001");
    }

    #[test]
    fn test_detects_scroll_listener() {
        let content = r#"window.addEventListener('scroll', handler)"#;
        let pattern = CompiledPattern {
            id: "AP-MOT-001".to_string(),
            name: "Scroll Event Listener".to_string(),
            severity: "blocker".to_string(),
            regex: Regex::new(r#"addEventListener\s*\(\s*['"]scroll['"]\s*"#).unwrap(),
            fix: "Use IntersectionObserver".to_string(),
        };
        let validator = Validator { patterns: vec![pattern] };
        let violations = validator.validate(content);
        assert_eq!(violations.len(), 1);
    }

    #[test]
    fn test_clean_file_passes() {
        let content = r#"
            <main class="py-24">
                <h1 class="text-6xl font-display">Welcome</h1>
            </main>
        "#;
        let validator = Validator { patterns: vec![] };
        let violations = validator.validate(content);
        assert_eq!(violations.len(), 0);
    }
}
