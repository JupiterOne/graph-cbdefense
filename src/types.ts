export interface CarbonBlackIntegrationConfig {
  site: string;
  orgKey: string;
  connectorId: string;
  apiKey: string;
}

export enum FindingSeverityNormal {
  Unknown = -1,
  Informational = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

export enum FindingSeverityNormalName {
  Unknown = 'Unknown',
  Informational = 'Informational',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export const FindingSeverityNormalNames = {
  [FindingSeverityNormal.Unknown]: FindingSeverityNormalName.Unknown,
  [FindingSeverityNormal.Informational]:
    FindingSeverityNormalName.Informational,
  [FindingSeverityNormal.Low]: FindingSeverityNormalName.Low,
  [FindingSeverityNormal.Medium]: FindingSeverityNormalName.Medium,
  [FindingSeverityNormal.High]: FindingSeverityNormalName.High,
  [FindingSeverityNormal.Critical]: FindingSeverityNormalName.Critical,
};
