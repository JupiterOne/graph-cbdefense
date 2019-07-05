import {
  EntityFromIntegration,
  RelationshipDirection,
  RelationshipFromIntegration,
  RelationshipMapping,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  CbDefenseAccount,
  CbDefensePolicy,
  CbDefenseSensor,
} from "./CbDefenseClient";
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  AgentDeviceRelationship,
  CbDefenseAccountEntity,
  CbDefensePolicyEntity,
  CbDefenseSensorEntity,
  CbDefenseServiceEntity,
  DEVICE_ENTITY_CLASS,
  DEVICE_ENTITY_TYPE,
  POLICY_ENTITY_CLASS,
  POLICY_ENTITY_TYPE,
  SENSOR_DEVICE_RELATIONSHIP_TYPE,
  SENSOR_ENTITY_CLASS,
  SENSOR_ENTITY_TYPE,
  SENSOR_POLICY_RELATIONSHIP_TYPE,
  SERVICE_ENTITY_CLASS,
  SERVICE_ENTITY_TYPE,
} from "./types";
import { normalizeHostname } from "./util/normalizeHostname";

export function createAccountEntity(
  data: CbDefenseAccount,
): CbDefenseAccountEntity {
  return {
    _class: ACCOUNT_ENTITY_CLASS,
    _key: `carbonblack-account-${data.organizationId}`,
    _type: ACCOUNT_ENTITY_TYPE,
    accountId: data.organizationId,
    displayName: data.organizationName,
    name: data.organizationName,
    organization: data.organizationName.replace(/\.[a-z]{2,3}$/, ""),
    webLink: `https://defense-${data.site}.conferdeploy.net`,
  };
}

export function createServiceEntity(accountId: number): CbDefenseServiceEntity {
  return {
    _class: SERVICE_ENTITY_CLASS,
    _key: `${SERVICE_ENTITY_TYPE}-${accountId}`,
    _type: SERVICE_ENTITY_TYPE,
    displayName: "CB Endpoint Protection Service",
  };
}

export function createSensorEntities(
  data: CbDefenseSensor[],
): CbDefenseSensorEntity[] {
  return data.map(d => ({
    _class: SENSOR_ENTITY_CLASS,
    _key: `cbdefense-sensor-${d.deviceId}`,
    _type: SENSOR_ENTITY_TYPE,
    displayName: d.name || "cbdefense-sensor",
    hostname: normalizeHostname(d.name),
    active: d.sensorStates !== null && d.sensorStates.indexOf("ACTIVE") >= 0,
    function: ["anti-malware", "activity-monitor"],
    ...d,
  }));
}

export function createPolicyEntities(
  data: CbDefensePolicy[],
): CbDefensePolicyEntity[] {
  return data.map(d => ({
    _class: POLICY_ENTITY_CLASS,
    _key: getPolicyKey(d.id),
    _type: POLICY_ENTITY_TYPE,
    _rawData: [
      {
        name: "default",
        rawData: d,
      },
    ],
    displayName: d.name,
    name: d.name,
    description: d.description,
    id: d.id,
    version: d.version,
    priorityLevel: d.priorityLevel,
    systemPolicy: d.systemPolicy,
    latestRevision: d.latestRevision,
  }));
}

export function createAccountRelationships(
  account: CbDefenseAccountEntity,
  entities: EntityFromIntegration[],
  type: string,
) {
  const relationships = [];
  for (const entity of entities) {
    relationships.push(createAccountRelationship(account, entity, type));
  }
  return relationships;
}

export function createAccountRelationship(
  account: CbDefenseAccountEntity,
  entity: EntityFromIntegration,
  type: string,
): RelationshipFromIntegration {
  return {
    _class: "HAS",
    _fromEntityKey: account._key,
    _key: `${account._key}_has_${entity._key}`,
    _toEntityKey: entity._key,
    _type: type,
  };
}

export function createServicePolicyRelationships(
  service: CbDefenseServiceEntity,
  policies: CbDefensePolicyEntity[],
) {
  const relationships = [];
  for (const p of policies) {
    relationships.push({
      _class: "ENFORCES",
      _fromEntityKey: p._key,
      _key: `${p._key}_enforces_${service._key}`,
      _toEntityKey: service._key,
      _type: SENSOR_POLICY_RELATIONSHIP_TYPE,
    });
  }
  return relationships;
}

export function createSensorPolicyRelationships(
  sensors: CbDefenseSensorEntity[],
) {
  const relationships = [];
  for (const s of sensors) {
    if (!!s.policyId) {
      const policyKey = getPolicyKey(s.policyId);
      relationships.push({
        _class: "ASSIGNED",
        _fromEntityKey: s._key,
        _key: `${s._key}_assigned_${policyKey}`,
        _toEntityKey: policyKey,
        _type: SENSOR_POLICY_RELATIONSHIP_TYPE,
      });
    }
  }
  return relationships;
}

export function mapSensorToDeviceRelationship(
  agent: CbDefenseSensorEntity,
): AgentDeviceRelationship {
  const hostname = agent.hostname;

  // define target device properties via relationship mapping
  const mapping: RelationshipMapping = {
    relationshipDirection: RelationshipDirection.FORWARD,
    sourceEntityKey: agent._key,
    targetFilterKeys: [["_type", "hostname", "owner"]],
    targetEntity: {
      _type: DEVICE_ENTITY_TYPE,
      _class: DEVICE_ENTITY_CLASS,
      owner: agent.email,
      displayName: hostname,
      hostname,
    },
  };

  return {
    _key: `${agent._key}|protects|device-${hostname}`,
    _type: SENSOR_DEVICE_RELATIONSHIP_TYPE,
    _class: "PROTECTS",
    _mapping: mapping,
  };
}

function getPolicyKey(policyId: number) {
  return `cb-sensor-policy-${policyId}`;
}
