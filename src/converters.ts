import camelCase from "lodash/camelCase";

import {
  convertProperties,
  createIntegrationEntity,
  createIntegrationRelationship,
  EntityFromIntegration,
  getTime,
  IntegrationRelationship,
  MappedRelationshipFromIntegration,
  RelationshipDirection,
  RelationshipMapping,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  CarbonBlackAccount,
  CarbonBlackAlert,
  CarbonBlackDeviceSensor,
} from "./CbDefenseClient";
import {
  ACCOUNT_DEVICE_SENSOR_RELATIONSHIP_TYPE,
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
  ALERT_ENTITY_CLASS,
  ALERT_ENTITY_TYPE,
  DEVICE_ENTITY_CLASS,
  DEVICE_ENTITY_TYPE,
  DEVICE_SENSOR_ENTITY_CLASS,
  DEVICE_SENSOR_ENTITY_TYPE,
  FindingSeverityNormal,
  FindingSeverityNormalName,
  FindingSeverityNormalNames,
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

/**
 * An extensions of `EntityFromIntegration` used to build a relationship between
 * the sensor of a device and the alerts associated with the device.
 */
type AlertFindingEntity = EntityFromIntegration & {
  deviceId: number;
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

const REDACTED = "REDACTED";

export function createDeviceSensorEntity(
  data: CarbonBlackDeviceSensor,
): DeviceSensorEntity {
  const source = {
    ...data,
    activation_code: REDACTED,
    encoded_activation_code: REDACTED,
    uninstall_code: REDACTED,
  };

  return createIntegrationEntity({
    entityData: {
      source,
      assign: {
        ...convertProperties(source),
        ...convertTimeProperties(source),
        _key: deviceSensorKey(source.id),
        _class: DEVICE_SENSOR_ENTITY_CLASS,
        _type: DEVICE_SENSOR_ENTITY_TYPE,
        id: String(source.id),
        name: source.name || "cbdefense-sensor",
        hostname: normalizeHostname(source.name),
        active:
          source.status !== "INACTIVE" &&
          source.sensor_states != null &&
          source.sensor_states.indexOf("ACTIVE") >= 0,
        function: ["anti-malware", "activity-monitor"],
        macAddress: formatMacAddress(source.mac_address),
        lastSeenOn: getTime(source.last_contact_time),

        // Remove codes
        activationCode: null,
        encodedActivationCode: null,
        uninstallCode: null,
      },
    },
  }) as DeviceSensorEntity;
}

function deviceSensorKey(deviceId: number): string {
  return `cbdefense-sensor-${deviceId}`;
}

export function createAlertFindingEntity(
  data: CarbonBlackAlert,
): AlertFindingEntity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        ...convertTimeProperties(data),
        _key: `cb-alert-${data.id}`,
        _type: ALERT_ENTITY_TYPE,
        _class: ALERT_ENTITY_CLASS,
        name: data.id,
        displayName: alertFindingDisplayName(data),
        createdOn: getTime(data.create_time),
        updatedOn: getTime(data.last_update_time),
        severity: normalizeSeverity(data.severity)[1],
        numericSeverity: data.severity,
        alertSeverity: severityString(data.severity),
        description: data.reason,

        // When the alert exists, it is considered open
        open: true,
      },
    },
  }) as AlertFindingEntity;
}

function alertFindingDisplayName(data: CarbonBlackAlert): string {
  const components = [
    data.process_name,
    data.reason_code,
    data.threat_cause_vector,
  ].filter(e => !!e);
  if (components.length !== 3) {
    return data.id;
  }
  return components.join(" : ");
}

/**
 * Converts an Carbon Black alert numeric severity to a Carbon Black severity string. This is
 * not a normalized value, but one described in their product guide. Providing
 * this value allows users to search for terms documented by Carbon Black.
 *
 * @see
 * https://www.vmware.com/content/dam/digitalmarketing/vmware/en/pdf/products/vmware-cb-defense-integration-confgiurtion-guide-v2.pdf
 * @param numericSeverity the alert severity numeric value
 */
function severityString(numericSeverity: number): string {
  if (numericSeverity < 4) {
    return "Minor";
  } else if (numericSeverity < 8) {
    return "Severe";
  } else if (numericSeverity < 11) {
    return "Critical";
  } else {
    return "Unknown";
  }
}

/**
 * Converts a Carbon Black alert numeric severity to J1 normalized
 * numeric values.
 *
 * @see
 * https://www.vmware.com/content/dam/digitalmarketing/vmware/en/pdf/products/vmware-cb-defense-integration-confgiurtion-guide-v2.pdf
 * @param numericSeverity the alert severity numeric value
 */
export function normalizeSeverity(
  numericSeverity: number,
): [FindingSeverityNormal, FindingSeverityNormalName] {
  const n = (
    severity: FindingSeverityNormal,
  ): [FindingSeverityNormal, FindingSeverityNormalName] => {
    return [severity, FindingSeverityNormalNames[severity]];
  };

  if (numericSeverity === 0) {
    return n(FindingSeverityNormal.Informational);
  } else if (numericSeverity < 4) {
    return n(FindingSeverityNormal.Low);
  } else if (numericSeverity < 6) {
    return n(FindingSeverityNormal.Medium);
  } else if (numericSeverity < 8) {
    return n(FindingSeverityNormal.High);
  } else if (numericSeverity <= 10) {
    return n(FindingSeverityNormal.Critical);
  } else {
    return n(FindingSeverityNormal.Unknown);
  }
}

export function createAccountServiceRelationship(
  account: EntityFromIntegration,
  service: EntityFromIntegration,
): IntegrationRelationship {
  return createIntegrationRelationship({
    _class: "HAS",
    from: account,
    to: service,
    properties: {
      _key: `${account._key}_has_${service._key}`,
      _type: ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
    },
  });
}

export function createAccountDeviceSensorRelationship(
  account: EntityFromIntegration,
  device: EntityFromIntegration,
): IntegrationRelationship {
  return createIntegrationRelationship({
    _class: "HAS",
    from: account,
    to: device,
    properties: {
      _key: `${account._key}_has_${device._key}`,
      _type: ACCOUNT_DEVICE_SENSOR_RELATIONSHIP_TYPE,
    },
  });
}

export function mapSensorToDeviceRelationship(
  sensor: DeviceSensorEntity,
): MappedRelationshipFromIntegration {
  const hostname = sensor.hostname;
  const targetFilterKeys = sensor.macAddress
    ? [["_type", "macAddress"]]
    : [["_type", "hostname", "owner"]];

  const platform =
    sensor.os && sensor.os.match(/mac/i) ? "darwin" : sensor.os.toLowerCase();
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

export function createDeviceSensorAlertFindingRelationship(
  alertFinding: AlertFindingEntity,
): IntegrationRelationship {
  return createIntegrationRelationship({
    _class: "IDENTIFIED",
    fromKey: deviceSensorKey(alertFinding.deviceId),
    fromType: DEVICE_SENSOR_ENTITY_TYPE,
    toKey: alertFinding._key,
    toType: alertFinding._type,
  });
}

function formatMacAddress(macAddress: string): string | undefined {
  if (macAddress) {
    return macAddress.includes(":")
      ? macAddress.toLowerCase()
      : macAddress.toLowerCase().replace(/(.{2})(?!$)/g, "$1:");
  }
}
