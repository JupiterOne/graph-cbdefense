import {
  GraphClient,
  IntegrationExecutionContext,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import CbDefenseClient from "./CbDefenseClient";

export const PROVIDER_NAME = "carbonblack_psc";

export const ACCOUNT_ENTITY_TYPE = PROVIDER_NAME + "_account";
export const ACCOUNT_ENTITY_CLASS = "Account";

export const DEVICE_SENSOR_ENTITY_TYPE = "cbdefense_sensor";
export const DEVICE_SENSOR_ENTITY_CLASS = "HostAgent";
export const ACCOUNT_DEVICE_SENSOR_RELATIONSHIP_TYPE =
  ACCOUNT_ENTITY_TYPE + "_has_sensor";

export const DEVICE_ENTITY_TYPE = "user_endpoint";
export const DEVICE_ENTITY_CLASS = ["Device", "Host"];
export const SENSOR_DEVICE_RELATIONSHIP_TYPE =
  DEVICE_SENSOR_ENTITY_TYPE + "_protects_device";

export const SERVICE_ENTITY_TYPE = "cb_endpoint_protection";
export const SERVICE_ENTITY_CLASS = "Service";
export const ACCOUNT_SERVICE_RELATIONSHIP_TYPE =
  ACCOUNT_ENTITY_TYPE + "_has_endpoint_protection_service";

export const ALERT_ENTITY_TYPE = "cbdefense_alert";
export const ALERT_ENTITY_CLASS = ["Finding"];

export interface CarbonBlackIntegrationConfig {
  site: string;
  orgKey: string;
  connectorId: string;
  apiKey: string;
}

export interface CbDefenseExecutionContext extends IntegrationExecutionContext {
  graph: GraphClient;
  persister: PersisterClient;
  provider: CbDefenseClient;
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
  Unknown = "Unknown",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
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
