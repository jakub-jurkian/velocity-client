export const WizardStep = {
  Dates: 1,
  Loading: 2,
  BikeSelection: 3,
  Summary: 4,
} as const;

export type WizardStep = (typeof WizardStep)[keyof typeof WizardStep];
