import {
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

export const SetDataKeys = {
  ACCOUNT: 'ACCOUNT_ENTITY',
};

export const StepIds = {
  ACCOUNT: 'get-account',
  DEVICE_SENSORS: 'fetch-device-sensors',
  ALERT_FINDINGS: 'fetch-alert-findings',
};

export const Entities = {
  ACCOUNT: {
    resourceName: 'Account',
    _type: 'carbonblack_psc_account',
    _class: ['Account'],
  },
  SERVICE: {
    resourceName: 'Service',
    _type: 'cb_endpoint_protection',
    _class: 'Service',
  },
  DEVICE_SENSOR: {
    resourceName: 'Device Sensor Agent',
    _type: 'cbdefense_sensor',
    _class: ['HostAgent'],
  },
  ALERT: {
    resourceName: 'Alert',
    _type: 'cbdefense_alert',
    _class: ['Finding'],
  },
};

export const Relationships = {
  ACCOUNT_HAS_SENSOR: {
    _type: 'carbonblack_psc_account_has_cbdefense_sensor',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.DEVICE_SENSOR._type,
  },
  ACCOUNT_HAS_SERVICE: {
    _type: 'carbonblack_psc_account_has_cb_endpoint_protection_service',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SERVICE._type,
  },
  // sensor assigned policy???
  SENSOR_IDENTIFIED_ALERT: {
    _type: 'cbdefense_sensor_identified_alert',
    sourceType: Entities.DEVICE_SENSOR._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: Entities.ALERT._type,
  },
};

export const TargetEntities = {
  DEVICE: {
    resourceName: 'Device',
    _type: 'user_endpoint',
    _class: ['Device', 'Host'],
  },
};

export const MappedRelationships = {
  DEVICE_SENSOR_PROTECTS_DEVICE: {
    _type: 'cbdefense_sensor_protects_device',
    sourceType: Entities.DEVICE_SENSOR._type,
    _class: RelationshipClass.PROTECTS,
    targetType: TargetEntities.DEVICE._type,
    direction: RelationshipDirection.FORWARD,
  },
};
