import { create, all, ConfigOptions } from "mathjs";

const config: ConfigOptions = {
  number: "number",
};

const math = create(all, config);

export type AngleMode = "deg" | "rad";

const TRIG_FUNCS = ["sin", "cos", "tan"];

function wrapTrigForDegrees(expr: string): string {
  let out = "";
  let i = 0;
  while (i < expr.length) {
    let matched = false;
    for (const fn of TRIG_FUNCS) {
      if (expr.startsWith(fn + "(", i)) {
        const start = i + fn.length + 1;
        let depth = 1;
        let j = start;
        while (j < expr.length && depth > 0) {
          const ch = expr[j];
          if (ch === "(") depth++;
          else if (ch === ")") depth--;
          if (depth === 0) break;
          j++;
        }
        const arg = expr.slice(start, j);
        const wrappedArg = wrapTrigForDegrees(arg);
        out += `${fn}(((${wrappedArg}) * pi / 180))`;
        i = j + 1;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += expr[i];
      i++;
    }
  }
  return out;
}

function preprocess(expr: string, angleMode: AngleMode): string {
  let processed = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/π/g, "(pi)")
    .replace(/√/g, "sqrt");

  if (angleMode === "deg") {
    processed = wrapTrigForDegrees(processed);
    processed = processed.replace(
      /\b(asin|acos|atan)\(/g,
      (_m, fn) => `(180/pi)*${fn}(`,
    );
  }

  return processed;
}

export function evaluateExpression(
  expr: string,
  angleMode: AngleMode = "deg",
): string {
  if (!expr.trim()) return "";
  try {
    const processed = preprocess(expr, angleMode);
    const result = math.evaluate(processed);
    if (typeof result === "number") {
      if (!isFinite(result)) return "Error";
      const rounded = Math.round(result * 1e12) / 1e12;
      const str = rounded.toString();
      if (str.length > 14) {
        return rounded.toPrecision(10).replace(/\.?0+(e|$)/, "$1");
      }
      return str;
    }
    if (typeof result === "object" && result !== null && "toString" in result) {
      return String(result);
    }
    return String(result);
  } catch {
    return "Error";
  }
}

export function formatDisplay(value: string): string {
  return value
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/sqrt/g, "√")
    .replace(/pi/g, "π");
}
