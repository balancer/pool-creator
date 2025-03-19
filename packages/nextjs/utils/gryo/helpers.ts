import { Big } from "big.js";

// Configure precision for elliptic curve calculations
Big.DP = 100;
Big.RM = Big.roundHalfUp;

/**
 * Calculates rotation components (c, s) for E-CLP parameters
 * @param rotationAngleTangent - tan(θ) where θ is the rotation angle (s/c)
 * @returns Object containing normalized components where c² + s² = 1
 *          with 18 decimal precision for on-chain compatibility
 */
export function calculateRotationComponents(rotationAngleTangent: string): { c: string; s: string } {
  // Convert input to precise decimal representation of tan(θ)
  const tanθ = new Big(rotationAngleTangent);

  // Calculate hypotenuse of right triangle with legs (1, tanθ)
  // This represents √(1 + tan²θ) from Pythagorean theorem
  const tanSquared = tanθ.times(tanθ);
  const hypotenuse = tanSquared.plus(1).sqrt();

  // Calculate normalized components maintaining c² + s² = 1 identity
  // c = cosθ = 1/√(1 + tan²θ)
  // s = sinθ = tanθ/√(1 + tan²θ)
  const cosθ = new Big(1).div(hypotenuse);
  const sinθ = tanθ.div(hypotenuse);

  return {
    c: cosθ.toFixed(18), // 18 decimals matches EVM fixed-point standards
    s: sinθ.toFixed(18), // Required for elliptic curve stability
  };
}
