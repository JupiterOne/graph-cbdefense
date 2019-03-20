import {
  EntityFromIntegration,
  GraphClient,
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
  MappedRelationship,
  PersisterClient,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

import CbDefenseClient, { CbDefenseSensor } from "./CbDefenseClient";

export const PROVIDER_NAME = "cbdefense";

export const ACCOUNT_ENTITY_TYPE = PROVIDER_NAME + "_account";
export const ACCOUNT_ENTITY_CLASS = "Account";

export const SENSOR_ENTITY_TYPE = PROVIDER_NAME + "_sensor";
export const SENSOR_ENTITY_CLASS = "HostAgent";
export const ACCOUNT_SENSOR_RELATIONSHIP_TYPE =
  PROVIDER_NAME + "_account_has_sensor";

export const DEVICE_ENTITY_TYPE = "user_endpoint";
export const DEVICE_ENTITY_CLASS = ["Device", "Host"];
export const SENSOR_DEVICE_RELATIONSHIP_TYPE =
  SENSOR_ENTITY_TYPE + "_protects_device";

export interface CbDefenseIntegrationConfig {
  site: string;
  connectorId: string;
  apiKey: string;
}

export interface CbDefenseExecutionContext
  extends IntegrationExecutionContext<IntegrationInvocationEvent> {
  graph: GraphClient;
  persister: PersisterClient;
  provider: CbDefenseClient;
}

export interface CbDefenseAccountEntity extends EntityFromIntegration {
  accountId: number;
  name: string;
}

export interface CbDefenseSensorEntity
  extends EntityFromIntegration,
    CbDefenseSensor {
  displayName: string;
  hostname: string | undefined;
  active: boolean;
}

export interface AgentDeviceRelationship
  extends RelationshipFromIntegration,
    MappedRelationship {}
