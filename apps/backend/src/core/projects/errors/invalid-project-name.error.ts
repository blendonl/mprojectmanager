export class InvalidProjectNameError extends Error {
  constructor() {
    super('Project name is required.');
    this.name = 'InvalidProjectNameError';
  }
}
