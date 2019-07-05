import {
  EntityFromIntegration,
  GraphClient,
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
  MappedRelationship,
  PersisterClient,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

import CbDefenseClient, {
  CbDefensePolicyProperties,
  CbDefenseSensor,
} from "./CbDefenseClient";

export const PROVIDER_NAME = "carbonblack_psc";

export const ACCOUNT_ENTITY_TYPE = PROVIDER_NAME + "_account";
export const ACCOUNT_ENTITY_CLASS = "Account";

export const SENSOR_ENTITY_TYPE = "cbdefense_sensor";
export const SENSOR_ENTITY_CLASS = "HostAgent";
export const ACCOUNT_SENSOR_RELATIONSHIP_TYPE =
  ACCOUNT_ENTITY_TYPE + "_has_sensor";

export const DEVICE_ENTITY_TYPE = "user_endpoint";
export const DEVICE_ENTITY_CLASS = ["Device", "Host"];
export const SENSOR_DEVICE_RELATIONSHIP_TYPE =
  SENSOR_ENTITY_TYPE + "_protects_device";

export const SERVICE_ENTITY_TYPE = "cb_endpoint_protection";
export const SERVICE_ENTITY_CLASS = "Service";
export const ACCOUNT_SERVICE_RELATIONSHIP_TYPE =
  ACCOUNT_ENTITY_TYPE + "_has_endpoint_protection_service";

export const POLICY_ENTITY_TYPE = "cb_sensor_policy";
export const POLICY_ENTITY_CLASS = ["ControlPolicy", "Ruleset"];
export const SERVICE_POLICY_RELATIONSHIP_TYPE =
  POLICY_ENTITY_TYPE + "_enforces_endpoint_protection_service";
export const SENSOR_POLICY_RELATIONSHIP_TYPE =
  SENSOR_ENTITY_TYPE + "_assigned_policy";

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
  organization: string;
}

export interface CbDefenseServiceEntity extends EntityFromIntegration {
  displayName: string;
}

export interface CbDefenseSensorEntity
  extends EntityFromIntegration,
    CbDefenseSensor {
  hostname: string | undefined;
  active: boolean;
  function: string[];
}

export interface CbDefensePolicyEntity
  extends EntityFromIntegration,
    CbDefensePolicyProperties {}

export interface AgentDeviceRelationship
  extends RelationshipFromIntegration,
    MappedRelationship {}
