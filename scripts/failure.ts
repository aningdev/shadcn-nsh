/**
 * A failure that names the step it happened in, for the scripts that run several commands
 * (`bun run test:install` prints the step, then the reason). Plain `Error`s keep their message and
 * are reported as the run's own failure.
 */
export class StepFailure extends Error {
  /** The step's label, as the caller names it (`"registry build"`). */
  readonly step: string;

  constructor(step: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "StepFailure";
    this.step = step;
  }
}
