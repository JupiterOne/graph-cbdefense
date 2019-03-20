import {
  EntityFromIntegration,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { CbDefenseAccount, CbDefenseSensor } from "./CbDefenseClient";
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  CbDefenseAccountEntity,
  CbDefenseSensorEntity,
  SENSOR_ENTITY_CLASS,
  SENSOR_ENTITY_TYPE,
} from "./types";
import { normalizeHostname } from "./util/normalizeHostname";

export function createAccountEntity(
  data: CbDefenseAccount,
): CbDefenseAccountEntity {
  return {
    _class: ACCOUNT_ENTITY_CLASS,
    _key: `cbdefense-account-${data.organizationId}`,
    _type: ACCOUNT_ENTITY_TYPE,
    accountId: data.organizationId,
    displayName: data.organizationName,
    name: data.organizationName,
    webLink: `https://defense-${data.site}.conferdeploy.net`,
  };
}

export function createSensorEntities(
  data: CbDefenseSensor[],
): CbDefenseSensorEntity[] {
  return data.map(d => ({
    _class: SENSOR_ENTITY_CLASS,
    _key: `cbdefense-sensor-${d.deviceId}`,
    _type: SENSOR_ENTITY_TYPE,
    displayName: d.name,
    hostname: normalizeHostname(d.name),
    active: d.sensorStates !== null && d.sensorStates.indexOf("ACTIVE") >= 0,
    ...d,
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
