import logger from "../../naoko/Logger.naoko";

export class D2Polynom {
  a: number;
  b: number;
  c: number;
  delta?: number;
  roots?: number[];

  constructor(a: number, b: number, c: number) {
    (this.a = a), (this.b = b), (this.c = c);
  }

  /**
   * if a = 1 or b = 1 they don't need to be shown. same thing for c = 0.
   * @returns list of factors that are printable
   * @author Qexat
   */
  protected beautifyFactors = (): string[] => {
    let beautifiedFactors: string[] = [];
    const factors = [this.a, this.b, this.c];

    let i = 0;
    factors.forEach((factor) => {
      if (factor !== +(factors.slice(i).indexOf(factor) !== factors.slice(i).length - 1)) {
        beautifiedFactors.push(
          `${["-", "+", ""][+(factor === Math.abs(factor)) + +(factor === this.a)]} ${Math.abs(factor)}`.trim()
        );
      } else {
        beautifiedFactors.push("");
      }
      i++; // we do a bit of trolling
    });

    return beautifiedFactors;
  };

  public toString(): string {
    const [stra, strb, strc] = this.beautifyFactors();
    return `${stra}x² ${strb}x ${strc}`;
  }

  protected calcDelta = (): number => {
    return this.b ** 2 - 4 * this.a * this.c;
  };

  /**
   * Calculates the roots of the polynom
   * @returns an array of the eventual roots if they exist
   * @author Qexat
   */
  protected calcRoots() {
    if (!this.delta) this.delta = this.calcDelta();

    let roots: number[] = [];

    if (this.delta > 0) {
      roots = [(-this.b + Math.sqrt(this.delta)) / (2 * this.a), (-this.b - Math.sqrt(this.delta)) / (2 * this.a)];
    } else if (this.delta === 0) {
      roots = [-this.b / (2 * this.a)];
    }

    return roots;
  }

  public solve() {
    if (!this.roots) this.roots = this.calcRoots();

    let answer = `The equation ${this.toString()} has ${this.roots.length} solution${["", "s"][+(this.roots.length > 1)]
      } in R`;

    switch (this.roots.length) {
      case 0:
        answer += ".";
        break;
      case 1:
        answer += `: ${this.roots.join("")}`;
        break;
      default:
        answer += `: ${this.roots.join(", ")}`;
    }

    return answer;
  }
}

const cleanFactor = (eqMember: string, expToRemove: RegExp, defaultValue?: number): number => {
  const stringFactor = eqMember.replace(expToRemove, "").trim();

  if (defaultValue && stringFactor.length === 0) return defaultValue;
  try {
    return Number(stringFactor);
  } catch (err) {
    logger.error(err as string);
    return 0;
  }
};

export const extractFactors = (polynom: string): number[] => {
  let cleanPolynom: string[] = polynom
    .replace(" ", "")
    .split(/(?=(\+|\-))/g)
    .filter((value) => !["+", "-"].includes(value));

  for (let i = 0; i < cleanPolynom.length; i++) cleanPolynom[i] = cleanPolynom[i].replace(/\+|\ /g, "").trim();

  if (cleanPolynom.length <= 1) return [];
  let a = 0,
    b = 0,
    c = 0;
  cleanPolynom.forEach((eqMember) => {
    if (eqMember.replace(/x²|x\^2/g, "") !== eqMember) a = cleanFactor(eqMember, /x²|x\^2/g, 1);
    else if (eqMember.replace("x", "") !== eqMember) b = cleanFactor(eqMember, /x/g, 1);
    else c = cleanFactor(eqMember, / /g, 0);
  });

  if (a === 0 || b == 0) return [];

  return [a, b, c];
};
