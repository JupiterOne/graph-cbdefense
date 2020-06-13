import {
  CbDefenseAccount,
  CbDefensePolicy,
  CbDefenseSensor,
} from "./CbDefenseClient";
import {
  createAccountEntity,
  createAccountRelationships,
  createPolicyEntities,
  createSensorEntities,
  createSensorPolicyRelationships,
  createServiceEntity,
  createServicePolicyRelationships,
  mapSensorToDeviceRelationship,
} from "./converters";
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_SENSOR_RELATIONSHIP_TYPE,
  POLICY_ENTITY_CLASS,
  POLICY_ENTITY_TYPE,
  SENSOR_ENTITY_CLASS,
  SENSOR_ENTITY_TYPE,
  SENSOR_POLICY_RELATIONSHIP_TYPE,
  SERVICE_ENTITY_CLASS,
  SERVICE_ENTITY_TYPE,
} from "./types";

export const account: CbDefenseAccount = {
  organizationId: 1758,
  organizationName: "lifeomic.com",
  site: "prod05",
};

export const sensor: CbDefenseSensor = {
  adGroupId: 0,
  policyOverride: false,
  currentSensorPolicyName: null,
  deviceMetaDataItemList: null,
  lastDevicePolicyRequestedTime: null,
  lastDevicePolicyChangedTime: null,
  lastPolicyUpdatedTime: null,
  loginUserName: null,
  activationCode: "8F9XYZ",
  firstName: "David",
  lastName: "Smith",
  email: "david.smith@lifeomic.com",
  middleName: null,
  deviceId: 3759918,
  deviceType: "MAC",
  deviceOwnerId: 998867,
  deviceGuid: null,
  deviceSessionId: null,
  assignedToId: null,
  assignedToName: null,
  targetPriorityType: "MEDIUM",
  organizationName: "lifeomic.com",
  organizationId: 1758,
  uninstallCode: null,
  createTime: null,
  lastReportedTime: 1552947617435,
  osVersion: "MAC OS X 10.13.6",
  activationCodeExpiryTime: 1535374603279,
  sensorVersion: "3.2.1.10",
  registeredTime: 1534775244219,
  lastContact: 1552947617829,
  windowsPlatform: null,
  vdiBaseDevice: null,
  avStatus: null,
  deregisteredTime: null,
  sensorStates: [
    "ACTIVE",
    "LIVE_RESPONSE_NOT_RUNNING",
    "LIVE_RESPONSE_NOT_KILLED",
    "LIVE_RESPONSE_DISABLED",
    "SECURITY_CENTER_OPTLN_DISABLED",
  ],
  messages: null,
  rootedBySensor: false,
  rootedBySensorTime: null,
  quarantined: false,
  lastInternalIpAddress: "192.168.1.11",
  macAddress: "a1b2c3d4e5f6",
  lastExternalIpAddress: "68.45.7.169",
  lastLocation: "OFFSITE",
  sensorOutOfDate: false,
  avUpdateServers: null,
  passiveMode: false,
  lastResetTime: 0,
  lastShutdownTime: 1552947477533,
  scanStatus: null,
  scanLastActionTime: 0,
  scanLastCompleteTime: 0,
  linuxKernelVersion: null,
  avEngine: "",
  avProductVersion: null,
  avAveVersion: null,
  avPackVersion: null,
  avVdfVersion: null,
  avLastScanTime: 0,
  virtualMachine: false,
  virtualizationProvider: null,
  firstVirusActivityTime: 0,
  lastVirusActivityTime: 0,
  rootedByAnalytics: false,
  rootedByAnalyticsTime: null,
  testId: -1,
  avMaster: false,
  encodedActivationCode: null,
  originEventHash: null,
  uninstalledTime: null,
  name: "Davids-MacBook-Pro.local",
  status: "REGISTERED",
  policyId: 12345,
  policyName: "default",
};

export const sensorNoName: CbDefenseSensor = {
  ...sensor,
  deviceId: 3759919,
  name: null,
  macAddress: "A1:B2:C3:D4:E5:F6",
  avLastScanTime: 1552947617829,
  lastResetTime: 1552947617829,
  firstVirusActivityTime: 1552947617829,
  lastVirusActivityTime: 1552947617829,
  lastContact: 0,
};

export const sensors: CbDefenseSensor[] = [sensor, sensorNoName];

export const policy: CbDefensePolicy = {
  priorityLevel: "MEDIUM",
  systemPolicy: true,
  latestRevision: 1505412168158,
  id: 12345,
  version: 2,
  policy: {
    avSettings: {
      features: [
        {
          nabled: true,
          name: "SIGNATURE_UPDATE",
        },
        {
          enabled: true,
          name: "ONACCESS_SCAN",
        },
        {
          enabled: false,
          name: "ONDEMAND_SCAN",
        },
      ],
      updateServers: {
        servers: [
          {
            flags: 0,
            regId: null,
            server: ["http://updates.cdc.carbonblack.io/update"],
          },
        ],
        serversForOffSiteDevices: ["http://updates.cdc.carbonblack.io/update"],
      },
      apc: {
        maxFileSize: 4,
        maxExeDelay: 45,
        riskLevel: 4,
        enabled: false,
      },
      onAccessScan: {
        profile: "NORMAL",
      },
      onDemandScan: {
        profile: "NORMAL",
        scanCdDvd: "AUTOSCAN",
        scanUsb: "AUTOSCAN",
        schedule: {
          days: null,
          rangeHours: 8,
          startHour: 20,
          recoveryScanIfMissed: true,
        },
      },
      signatureUpdate: {
        schedule: {
          initialRandomDelayHours: 4,
          intervalHours: 4,
          fullIntervalHours: 0,
        },
      },
    },
    sensorSettings: [
      {
        name: "ALLOW_UNINSTALL",
        value: "true",
      },
      {
        name: "ALLOW_UPLOADS",
        value: "true",
      },
      {
        name: "SHOW_UI",
        value: "true",
      },
      {
        name: "ENABLE_THREAT_SHARING",
        value: "true",
      },
      {
        name: "QUARANTINE_DEVICE",
        value: "false",
      },
      {
        name: "LOGGING_LEVEL",
        value: "false",
      },
      {
        name: "QUARANTINE_DEVICE_MESSAGE",
        value:
          "Your device has been quarantined. Please contact your administrator.",
      },
      {
        name: "SET_SENSOR_MODE",
        value: "0",
      },
      {
        name: "SENSOR_RESET",
        value: "0",
      },
      {
        name: "BACKGROUND_SCAN",
        value: "true",
      },
      {
        name: "POLICY_ACTION_OVERRIDE",
        value: "true",
      },
      {
        name: "HELP_MESSAGE",
        value: "",
      },
      {
        name: "PRESERVE_SYSTEM_MEMORY_SCAN",
        value: "false",
      },
      {
        name: "HASH_MD5",
        value: "false",
      },
      {
        name: "SCAN_LARGE_FILE_READ",
        value: "false",
      },
      {
        name: "SCAN_EXECUTE_ON_NETWORK_DRIVE",
        value: "true",
      },
      {
        name: "DELAY_EXECUTE",
        value: "true",
      },
      {
        name: "SCAN_NETWORK_DRIVE",
        value: "false",
      },
      {
        name: "BYPASS_AFTER_LOGIN_MINS",
        value: "0",
      },
      {
        name: "BYPASS_AFTER_RESTART_MINS",
        value: "0",
      },
      {
        name: "SECURITY_CENTER_OPT",
        value: "false",
      },
      {
        name: "CB_LIVE_RESPONSE",
        value: "false",
      },
      {
        name: "UNINSTALL_CODE",
        value: "false",
      },
    ],
    knownBadHashAutoDeleteDelayMs: null,
    directoryActionRules: null,
    rules: [
      {
        application: {
          value: "KNOWN_MALWARE",
          type: "REPUTATION",
        },
        id: 1,
        required: false,
        operation: "RUN",
        action: "DENY",
      },
      {
        application: {
          value: "COMPANY_BLACK_LIST",
          type: "REPUTATION",
        },
        id: 2,
        required: false,
        operation: "RUN",
        action: "DENY",
      },
    ],
    id: -1,
  },
  name: "default",
  description: null,
};

export const policies: CbDefensePolicy[] = [policy];

test("createAccountRelationships", () => {
  const accountEntity = createAccountEntity(account);
  const sensorEntities = createSensorEntities(sensors);

  expect(
    createAccountRelationships(
      accountEntity,
      sensorEntities,
      ACCOUNT_SENSOR_RELATIONSHIP_TYPE,
    ),
  ).toEqual([
    {
      _class: "HAS",
      _fromEntityKey: accountEntity._key,
      _key: `${accountEntity._key}_has_${sensorEntities[0]._key}`,
      _toEntityKey: sensorEntities[0]._key,
      _type: ACCOUNT_SENSOR_RELATIONSHIP_TYPE,
    },
    {
      _class: "HAS",
      _fromEntityKey: accountEntity._key,
      _key: `${accountEntity._key}_has_${sensorEntities[1]._key}`,
      _toEntityKey: sensorEntities[1]._key,
      _type: ACCOUNT_SENSOR_RELATIONSHIP_TYPE,
    },
  ]);
});

test("createAccount", () => {
  expect(createAccountEntity(account)).toEqual({
    _class: ACCOUNT_ENTITY_CLASS,
    _key: `carbonblack-account-${account.organizationId}`,
    _type: ACCOUNT_ENTITY_TYPE,
    accountId: account.organizationId,
    displayName: account.organizationName,
    name: account.organizationName,
    organization: "lifeomic",
    webLink: `https://defense-${account.site}.conferdeploy.net`,
  });
});

test("createServiceEntity", () => {
  expect(createServiceEntity(account.organizationId)).toEqual({
    _class: SERVICE_ENTITY_CLASS,
    _key: `${SERVICE_ENTITY_TYPE}-1758`,
    _type: SERVICE_ENTITY_TYPE,
    displayName: "CB Endpoint Protection Service",
  });
});

test("createSensorEntities", () => {
  expect(createSensorEntities(sensors)).toEqual([
    {
      ...sensor,
      _class: SENSOR_ENTITY_CLASS,
      _key: `cbdefense-sensor-${sensor.deviceId}`,
      _type: SENSOR_ENTITY_TYPE,
      _rawData: [{ name: "default", rawData: sensor }],
      displayName: sensor.name as string,
      hostname: "davids-macbook-pro",
      active: true,
      function: ["anti-malware", "activity-monitor"],
      macAddress: "a1:b2:c3:d4:e5:f6",
      avLastScanTime: null,
      lastResetTime: null,
      firstVirusActivityTime: null,
      lastVirusActivityTime: null,
      lastSeenOn: 1552947617829,
    },
    {
      ...sensorNoName,
      _class: SENSOR_ENTITY_CLASS,
      _key: `cbdefense-sensor-${sensorNoName.deviceId}`,
      _type: SENSOR_ENTITY_TYPE,
      _rawData: [{ name: "default", rawData: sensorNoName }],
      displayName: "cbdefense-sensor",
      hostname: "",
      active: true,
      function: ["anti-malware", "activity-monitor"],
      macAddress: "a1:b2:c3:d4:e5:f6",
      avLastScanTime: 1552947617829,
      lastResetTime: 1552947617829,
      firstVirusActivityTime: 1552947617829,
      lastVirusActivityTime: 1552947617829,
      lastSeenOn: null,
    },
  ]);
});

test("createPolicyEntities", () => {
  expect(createPolicyEntities(policies)).toEqual([
    {
      _class: POLICY_ENTITY_CLASS,
      _key: "cb-sensor-policy-12345",
      _type: POLICY_ENTITY_TYPE,
      _rawData: [
        {
          name: "default",
          rawData: policy,
        },
      ],
      displayName: "default",
      name: "default",
      description: null,
      id: 12345,
      version: 2,
      priorityLevel: "MEDIUM",
      systemPolicy: true,
      latestRevision: 1505412168158,
    },
  ]);
});

test("createSensorPolicyRelationships", () => {
  expect(
    createSensorPolicyRelationships(createSensorEntities(sensors)),
  ).toEqual([
    {
      _class: "ASSIGNED",
      _fromEntityKey: "cbdefense-sensor-3759918",
      _key: `cbdefense-sensor-3759918_assigned_cb-sensor-policy-12345`,
      _toEntityKey: "cb-sensor-policy-12345",
      _type: SENSOR_POLICY_RELATIONSHIP_TYPE,
    },
    {
      _class: "ASSIGNED",
      _fromEntityKey: "cbdefense-sensor-3759919",
      _key: `cbdefense-sensor-3759919_assigned_cb-sensor-policy-12345`,
      _toEntityKey: "cb-sensor-policy-12345",
      _type: SENSOR_POLICY_RELATIONSHIP_TYPE,
    },
  ]);
});

test("createServicePolicyRelationships", () => {
  expect(
    createServicePolicyRelationships(
      createServiceEntity(account.organizationId),
      createPolicyEntities(policies),
    ),
  ).toEqual([
    {
      _class: "ENFORCES",
      _fromEntityKey: "cb-sensor-policy-12345",
      _key: `cb-sensor-policy-12345_enforces_${SERVICE_ENTITY_TYPE}-1758`,
      _toEntityKey: `${SERVICE_ENTITY_TYPE}-1758`,
      _type: SENSOR_POLICY_RELATIONSHIP_TYPE,
    },
  ]);
});

test("mapSensorToDeviceRelationship", () => {
  const agent = createSensorEntities([sensor])[0];
  const mapping = {
    relationshipDirection: "FORWARD",
    sourceEntityKey: agent._key,
    targetFilterKeys: [["_type", "macAddress"]],
    targetEntity: {
      _type: "user_endpoint",
      _class: ["Device", "Host"],
      owner: agent.email,
      displayName: agent.hostname,
      hostname: agent.hostname,
      macAddress: agent.macAddress,
      publicIp: agent.lastExternalIpAddress,
      publicIpAddress: agent.lastExternalIpAddress,
      privateIp: agent.lastInternalIpAddress,
      privateIpAddress: agent.lastInternalIpAddress,
      platform: "darwin",
      osDetails: "MAC OS X 10.13.6",
      osName: "macOS",
      osVersion: "10.13.6",
    },
  };

  expect(
    mapSensorToDeviceRelationship(createSensorEntities([sensor])[0]),
  ).toEqual({
    _key: `${agent._key}|protects|device-${agent.hostname}`,
    _type: "cbdefense_sensor_protects_device",
    _class: "PROTECTS",
    _mapping: mapping,
  });

  sensor.macAddress = null;
  mapping.targetFilterKeys = [["_type", "hostname", "owner"]];
  mapping.targetEntity.macAddress = null;

  expect(
    mapSensorToDeviceRelationship(createSensorEntities([sensor])[0]),
  ).toEqual({
    _key: `${agent._key}|protects|device-${agent.hostname}`,
    _type: "cbdefense_sensor_protects_device",
    _class: "PROTECTS",
    _mapping: mapping,
  });
});
