import { create, all, ConfigOptions } from "mathjs";

const config: ConfigOptions = {
  number: "number",
};

const math = create(all, config);

export type AngleMode = "deg" | "rad";

function preprocess(expr: string, angleMode: AngleMode): string {
  let processed = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/π/g, "(pi)")
    .replace(/√/g, "sqrt");

  if (angleMode === "deg") {
    processed = processed.replace(
      /\b(sin|cos|tan)\(/g,
      (_m, fn) => `${fn}((pi/180)*(`,
    );
    let depth = 0;
    let result = "";
    let inFnArg = 0;
    const stack: number[] = [];
    for (let i = 0; i < processed.length; i++) {
      const ch = processed[i];
      if (ch === "(") {
        depth++;
        if (inFnArg > 0) stack.push(depth);
      }
      if (ch === ")") {
        if (stack.length && stack[stack.length - 1] === depth) {
          stack.pop();
          result += "))";
          inFnArg--;
          depth--;
          continue;
        }
        depth--;
      }
      result += ch;
    }
    processed = result;

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
