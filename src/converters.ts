import camelCase from "lodash/camelCase";

import {
  convertProperties,
  createIntegrationEntity,
  EntityFromIntegration,
  getTime,
  MappedRelationshipFromIntegration,
  RelationshipDirection,
  RelationshipFromIntegration,
  RelationshipMapping,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { CarbonBlackAccount, CarbonBlackDeviceSensor } from "./CbDefenseClient";
import {
  ACCOUNT_DEVICE_SENSOR_RELATIONSHIP_TYPE,
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
  DEVICE_ENTITY_CLASS,
  DEVICE_ENTITY_TYPE,
  DEVICE_SENSOR_ENTITY_CLASS,
  DEVICE_SENSOR_ENTITY_TYPE,
  SENSOR_DEVICE_RELATIONSHIP_TYPE,
  SERVICE_ENTITY_CLASS,
  SERVICE_ENTITY_TYPE,
} from "./types";
import { normalizeHostname } from "./util/normalizeHostname";

/**
 * An extension of `EntityFromIntegration` used to build mapped relationships to
 * the actual user endpoint device entities.
 */
type DeviceSensorEntity = EntityFromIntegration & {
  hostname: string;
  macAddress?: string;
  email: string;
  lastExternalIpAddress: string;
  lastInternalIpAddress: string;
  os: string;
  osVersion: string;
};

function siteWeblink(site: string): string {
  return `https://defense-${site}.conferdeploy.net`;
}

export function createAccountEntity(
  data: CarbonBlackAccount,
): EntityFromIntegration {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: `carbonblack-account-${data.organization_id}`,
        _class: ACCOUNT_ENTITY_CLASS,
        _type: ACCOUNT_ENTITY_TYPE,
        accountId: data.organization_id,
        name: data.organization_name,
        organization: data.organization_name.replace(/\.[a-z]{2,3}$/, ""),
        webLink: siteWeblink(data.site),
      },
    },
  });
}

export function createServiceEntity(
  site: string,
  organizationId: number,
): EntityFromIntegration {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _key: `${SERVICE_ENTITY_TYPE}-${organizationId}`,
        _class: SERVICE_ENTITY_CLASS,
        _type: SERVICE_ENTITY_TYPE,
        name: "CB Endpoint Protection Service",
        category: ["software", "other"],
        endpoints: [siteWeblink(site)],
      },
    },
  });
}

const TIME_PROPERTY_NAME_REGEX = /^\w+_time$/;
function convertTimeProperties(data: any): object {
  const timeProperties: any = {};
  for (const key in data) {
    if (TIME_PROPERTY_NAME_REGEX.test(key)) {
      timeProperties[camelCase(key)] = getTime(data[key]);
    }
  }
  return timeProperties;
}

export function createDeviceSensorEntity(
  data: CarbonBlackDeviceSensor,
): DeviceSensorEntity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        ...convertTimeProperties(data),
        _key: `cbdefense-sensor-${data.id}`,
        _class: DEVICE_SENSOR_ENTITY_CLASS,
        _type: DEVICE_SENSOR_ENTITY_TYPE,
        id: String(data.id),
        name: data.name || "cbdefense-sensor",
        hostname: normalizeHostname(data.name),
        active:
          data.status !== "INACTIVE" &&
          data.sensor_states != null &&
          data.sensor_states.indexOf("ACTIVE") >= 0,
        function: ["anti-malware", "activity-monitor"],
        macAddress: formatMacAddress(data.mac_address),
        lastSeenOn: getTime(data.last_contact_time),
      },
    },
  }) as DeviceSensorEntity;
}

export function createAccountServiceRelationship(
  account: EntityFromIntegration,
  service: EntityFromIntegration,
): RelationshipFromIntegration {
  return {
    _class: "HAS",
    _fromEntityKey: account._key,
    _key: `${account._key}_has_${service._key}`,
    _toEntityKey: service._key,
    _type: ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
  };
}

export function createAccountDeviceSensorRelationship(
  account: EntityFromIntegration,
  device: EntityFromIntegration,
): RelationshipFromIntegration {
  return {
    _class: "HAS",
    _fromEntityKey: account._key,
    _key: `${account._key}_has_${device._key}`,
    _toEntityKey: device._key,
    _type: ACCOUNT_DEVICE_SENSOR_RELATIONSHIP_TYPE,
  };
}

export function mapSensorToDeviceRelationship(
  sensor: DeviceSensorEntity,
): MappedRelationshipFromIntegration {
  const hostname = sensor.hostname;
  const targetFilterKeys = sensor.macAddress
    ? [["_type", "macAddress"]]
    : [["_type", "hostname", "owner"]];

  const platform =
    sensor.os && sensor.os.match(/mac/i)
      ? "darwin"
      : sensor.os.toLowerCase();
  const osDetails = sensor.osVersion;

  const osPatternRegex = /^(mac os x|\w+)\s([0-9.]+)\s?(\w+)?$/i;
  const osPatternMatch = osDetails && osDetails.match(osPatternRegex);

  const osName =
    osPatternMatch &&
    (osPatternMatch[1].match(/mac/i) ? "macOS" : osPatternMatch[1]);
  const osVersion = osPatternMatch && osPatternMatch[2];

  // define target device properties via relationship mapping
  const mapping: RelationshipMapping = {
    relationshipDirection: RelationshipDirection.FORWARD,
    sourceEntityKey: sensor._key,
    targetFilterKeys,
    targetEntity: {
      _type: DEVICE_ENTITY_TYPE,
      _class: DEVICE_ENTITY_CLASS,
      owner: sensor.email,
      displayName: hostname,
      hostname,
      macAddress: sensor.macAddress,
      publicIp: sensor.lastExternalIpAddress,
      publicIpAddress: sensor.lastExternalIpAddress,
      privateIp: sensor.lastInternalIpAddress,
      privateIpAddress: sensor.lastInternalIpAddress,
      platform,
      osDetails,
      osName,
      osVersion,
    },
  };

  return {
    _key: `${sensor._key}|protects|device-${hostname}`,
    _type: SENSOR_DEVICE_RELATIONSHIP_TYPE,
    _class: "PROTECTS",
    _mapping: mapping,
  };
}

function formatMacAddress(macAddress: string): string | undefined {
  if (macAddress) {
    return macAddress.includes(":")
      ? macAddress.toLowerCase()
      : macAddress.toLowerCase().replace(/(.{2})(?!$)/g, "$1:");
  }
}
