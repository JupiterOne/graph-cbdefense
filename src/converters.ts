import camelCase from 'lodash/camelCase';

import {
  convertProperties,
  createDirectRelationship,
  createIntegrationEntity,
  Entity,
  ExplicitRelationship,
  parseTimePropertyValue,
  RelationshipDirection,
  RelationshipMapping,
} from '@jupiterone/integration-sdk-core';

import {
  CarbonBlackAccount,
  CarbonBlackAlert,
  CarbonBlackDeviceSensor,
} from './CbDefenseClient';
import {
  Entities,
  MappedRelationships,
  Relationships,
  TargetEntities,
} from './constants';
import {
  FindingSeverityNormal,
  FindingSeverityNormalName,
  FindingSeverityNormalNames,
} from './types';
import { normalizeHostname } from './util/normalizeHostname';
import { URL } from 'url';

/**
 * An extension of `Entity` used to build mapped relationships to
 * the actual user endpoint device entities.
 */
export type DeviceSensorEntity = Entity & {
  hostname: string;
  macAddress?: string;
  email: string;
  lastExternalIpAddress: string;
  lastInternalIpAddress: string;
  os: string;
  osVersion: string;
};

/**
 * An extensions of `Entity` used to build a relationship between
 * the sensor of a device and the alerts associated with the device.
 */
export type AlertFindingEntity = Entity & {
  deviceId: number;
};

function siteWeblink(site?: string): string {
  const sitePath = site && site.trim() ? `-${site}` : '';

  return `https://defense${sitePath}.conferdeploy.net`;
}

export function createAccountEntity(data: CarbonBlackAccount): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: `carbonblack-account-${data.organization_id}`,
        _class: Entities.ACCOUNT._class,
        _type: Entities.ACCOUNT._type,
        accountId: data.organization_id,
        name: data.organization_name,
        organization: data.organization_name.replace(/\.[a-z]{2,3}$/, ''),
        webLink: siteWeblink(data.site),
      },
    },
  });
}

export function createServiceEntity(
  site: string,
  organizationId: number,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _key: `${Entities.SERVICE._type}-${organizationId}`,
        _class: Entities.SERVICE._class,
        _type: Entities.SERVICE._type,
        name: 'CB Endpoint Protection Service',
        category: ['software', 'other'],
        function: ['monitoring'],
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
      timeProperties[camelCase(key)] = parseTimePropertyValue(data[key]);
    }
  }
  return timeProperties;
}

const REDACTED = 'REDACTED';

export function createDeviceSensorEntity(
  data: CarbonBlackDeviceSensor,
  site?: string,
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
        _class: Entities.DEVICE_SENSOR._class,
        _type: Entities.DEVICE_SENSOR._type,
        id: String(source.id),
        name: source.name || 'cbdefense-sensor',
        hostname: normalizeHostname(source.name),
        active:
          source.status !== 'INACTIVE' &&
          source.sensor_states != null &&
          source.sensor_states.indexOf('ACTIVE') >= 0,
        function: ['anti-malware', 'activity-monitor'],
        macAddress: formatMacAddress(source.mac_address),
        lastSeenOn: parseTimePropertyValue(source.last_contact_time),
        webLink: deviceSensorWebLink(source.id, site),
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

/**
 * Constructs a device sensor web link.
 * Ex. https://defense-prod05.conferdeploy.net/cb/investigate/events/events?searchWindow=ONE_MONTH&query=device_id%3A6923993
 * @param site
 * @param deviceId
 */
function deviceSensorWebLink(deviceId: number, site?: string): string {
  const url = new URL(`${siteWeblink(site)}/inventory/endpoints`);
  url.searchParams.append('s[query]', `${deviceId}`);
  return url.toString();
}

export function createAlertFindingEntity(
  data: CarbonBlackAlert,
  site?: string,
): AlertFindingEntity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        ...convertTimeProperties(data),
        _key: `cb-alert-${data.id}`,
        _type: Entities.ALERT._type,
        _class: Entities.ALERT._class,
        name: data.id,
        displayName: alertFindingDisplayName(data),
        createdOn: parseTimePropertyValue(data.create_time),
        updatedOn: parseTimePropertyValue(data.last_update_time),
        severity: normalizeSeverity(data.severity)[1],
        numericSeverity: data.severity,
        alertSeverity: severityString(data.severity),
        description: data.reason,
        webLink: alertFindingWebLink(
          {
            alertId: data.id,
            deviceId: data.device_id,
          },
          site,
        ),
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
  ].filter((e) => !!e);
  if (components.length !== 3) {
    return data.id;
  }
  return components.join(' : ');
}

/**
 * Constructs a web link to an alert finding.
 * ex: https://defense.conferdeploy.net/alerts?s[searchWindow]=ALL&s[c][query_string]=alert_id:234 AND device_id:432
 * @param site
 * @param data
 */
function alertFindingWebLink(
  data: {
    alertId: string;
    deviceId: number;
  },
  site?: string,
): string {
  const url = new URL(`${siteWeblink(site)}/alerts`);
  url.searchParams.append(
    's[c][query_string]',
    `alert_id:${data.alertId} AND device_id:${data.deviceId}`,
  );
  url.searchParams.append('s[searchWindow]', 'ALL');
  return url.toString();
}

/**
 * Converts an Carbon Black alert numeric severity to a Carbon Black severity string. This is
 * not a normalized value, but one described in their product guide. Providing
 * this value allows users to search for terms documented by Carbon Black.
 *
 * @see https://www.vmware.com/content/dam/digitalmarketing/vmware/en/pdf/products/vmware-cb-defense-integration-confgiurtion-guide-v2.pdf
 * @param numericSeverity the alert severity numeric value
 */
function severityString(numericSeverity: number): string {
  if (numericSeverity < 4) {
    return 'Minor';
  } else if (numericSeverity < 8) {
    return 'Severe';
  } else if (numericSeverity < 11) {
    return 'Critical';
  } else {
    return 'Unknown';
  }
}

/**
 * Converts a Carbon Black alert numeric severity to J1 normalized
 * numeric values.
 *
 * @see https://www.vmware.com/content/dam/digitalmarketing/vmware/en/pdf/products/vmware-cb-defense-integration-confgiurtion-guide-v2.pdf
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
  account: Entity,
  service: Entity,
): ExplicitRelationship {
  return createDirectRelationship({
    _class: Relationships.ACCOUNT_HAS_SERVICE._class,
    from: account,
    to: service,
    properties: {
      _key: `${account._key}_has_${service._key}`,
      _type: Relationships.ACCOUNT_HAS_SERVICE._type,
    },
  });
}

export function createAccountDeviceSensorRelationship(
  account: Entity,
  device: Entity,
): ExplicitRelationship {
  return createDirectRelationship({
    _class: Relationships.ACCOUNT_HAS_SENSOR._class,
    from: account,
    to: device,
    properties: {
      _key: `${account._key}_has_${device._key}`,
      _type: Relationships.ACCOUNT_HAS_SENSOR._type,
    },
  });
}

export function mapSensorToDeviceRelationship(sensor: DeviceSensorEntity) {
  const hostname = sensor.hostname;
  const targetFilterKeys = sensor.macAddress
    ? [['_type', 'macAddress']]
    : [['_type', 'hostname', 'owner']];

  const platform =
    sensor.os && sensor.os.match(/mac/i) ? 'darwin' : sensor.os.toLowerCase();
  const osDetails = sensor.osVersion;

  const osPatternRegex = /^(mac os x|\w+)\s([0-9.]+)\s?(\w+)?$/i;
  const osPatternMatch = osDetails && osDetails.match(osPatternRegex);

  const osName =
    osPatternMatch &&
    (osPatternMatch[1].match(/mac/i) ? 'macOS' : osPatternMatch[1]);
  const osVersion = osPatternMatch && osPatternMatch[2];

  // define target device properties via relationship mapping
  const mapping: RelationshipMapping = {
    relationshipDirection: RelationshipDirection.FORWARD,
    sourceEntityKey: sensor._key,
    targetFilterKeys,
    targetEntity: {
      _type: TargetEntities.DEVICE._type,
      _class: TargetEntities.DEVICE._class,
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
    _type: MappedRelationships.DEVICE_SENSOR_PROTECTS_DEVICE._type,
    _class: MappedRelationships.DEVICE_SENSOR_PROTECTS_DEVICE._class,
    _mapping: mapping,
  };
}

export function createDeviceSensorAlertFindingRelationship(
  alertFinding: AlertFindingEntity,
): ExplicitRelationship {
  return createDirectRelationship({
    _class: Relationships.SENSOR_IDENTIFIED_ALERT._class,
    fromKey: deviceSensorKey(alertFinding.deviceId),
    fromType: Entities.DEVICE_SENSOR._type,
    toKey: alertFinding._key,
    toType: alertFinding._type,
  });
}

function formatMacAddress(macAddress: string): string | undefined {
  if (macAddress) {
    return macAddress.includes(':')
      ? macAddress.toLowerCase()
      : macAddress.toLowerCase().replace(/(.{2})(?!$)/g, '$1:');
  }
}
