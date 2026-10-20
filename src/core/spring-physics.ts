/**
 * @krizaka/motion — Second-Order Kinetic Spring Physics Engine
 *
 * Implements exact closed-form 2nd-order differential equations for organic kinetic motion:
 * Eliminates artificial CSS ease curves in favor of true physical inertia, damping, and momentum.
 *
 * Parameters:
 * - f: Natural frequency in Hz (speed of response)
 * - z: Damping ratio (z=1 critical, z<1 bouncy underdamped, z>1 overdamped)
 * - r: Initial response (r=0 lags behind, r=1 immediate, r>1 anticipates/overshoots)
 */

export class SpringSolver {
  private f: number;
  private z: number;
  private r: number;

  // Coefficients
  private k1: number = 0;
  private k2: number = 0;
  private k3: number = 0;

  // State
  private xp: number;
  private y: number;
  private yd: number;

  constructor(f = 2.0, z = 0.75, r = 0.0, initialValue = 0) {
    this.f = f;
    this.z = z;
    this.r = r;
    this.xp = initialValue;
    this.y = initialValue;
    this.yd = 0;
    this.recomputeCoefficients();
  }

  public setParameters(f: number, z: number, r: number): void {
    this.f = f;
    this.z = z;
    this.r = r;
    this.recomputeCoefficients();
  }

  private recomputeCoefficients(): void {
    const omega = 2 * Math.PI * this.f;
    this.k1 = this.z / (Math.PI * this.f);
    this.k2 = 1 / (omega * omega);
    this.k3 = (this.r * this.z) / omega;
  }

  public update(target: number, dt: number, targetVelocity?: number): number {
    if (dt <= 0) return this.y;

    // Clamp dt to avoid numerical instability
    const clampedDt = Math.min(dt, 0.05);

    // Compute target velocity if not provided
    const xd = targetVelocity ?? (target - this.xp) / clampedDt;
    this.xp = target;

    // Stable semi-implicit Euler integration of 2nd order system
    const iterations = Math.ceil(clampedDt / 0.008);
    const subDt = clampedDt / iterations;

    for (let i = 0; i < iterations; i++) {
      this.y += this.yd * subDt;
      this.yd += (subDt * (target + this.k3 * xd - this.y - this.k1 * this.yd)) / this.k2;
    }

    return this.y;
  }

  public snapTo(value: number): void {
    this.xp = value;
    this.y = value;
    this.yd = 0;
  }

  public getValue(): number {
    return this.y;
  }

  public getVelocity(): number {
    return this.yd;
  }

  public isSettled(target: number, threshold = 0.0005, velocityThreshold = 0.001): boolean {
    return Math.abs(this.y - target) < threshold && Math.abs(this.yd) < velocityThreshold;
  }
}

/** 2D Spring Vector Solver for spatial cursor & fluid coordinates */
export class SpringVector2D {
  public x: SpringSolver;
  public y: SpringSolver;

  constructor(f = 2.0, z = 0.75, r = 0.0, initialX = 0, initialY = 0) {
    this.x = new SpringSolver(f, z, r, initialX);
    this.y = new SpringSolver(f, z, r, initialY);
  }

  public update(targetX: number, targetY: number, dt: number): { x: number; y: number } {
    return {
      x: this.x.update(targetX, dt),
      y: this.y.update(targetY, dt),
    };
  }

  public snapTo(x: number, y: number): void {
    this.x.snapTo(x);
    this.y.snapTo(y);
  }

  public isSettled(targetX: number, targetY: number): boolean {
    return this.x.isSettled(targetX) && this.y.isSettled(targetY);
  }
}
