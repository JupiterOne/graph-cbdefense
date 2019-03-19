import { CbDefenseAccount, CbDefenseSensor } from "./CbDefenseClient";
import {
  createAccountEntity,
  createAccountRelationships,
  createSensorEntities,
} from "./converters";
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_SENSOR_RELATIONSHIP_TYPE,
  SENSOR_ENTITY_CLASS,
  SENSOR_ENTITY_TYPE,
} from "./types";

const account: CbDefenseAccount = {
  organizationId: 1758,
  organizationName: "lifeomic.com",
  site: "prod05",
};

const sensor: CbDefenseSensor = {
  adGroupId: 0,
  policyOverride: false,
  currentSensorPolicyName: null,
  deviceMetaDataItemList: null,
  lastDevicePolicyRequestedTime: null,
  lastDevicePolicyChangedTime: null,
  lastPolicyUpdatedTime: null,
  loginUserName: null,
  activationCode: "8F9GZP",
  firstName: "David",
  lastName: "Fifer",
  email: "david.fifer@lifeomic.com",
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
  macAddress: null,
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
  policyId: 12353,
  policyName: "Standard_Mac_Workstation",
};

const sensors: CbDefenseSensor[] = [sensor];

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
  ]);
});

test("createAccount", () => {
  expect(createAccountEntity(account)).toEqual({
    _class: ACCOUNT_ENTITY_CLASS,
    _key: `cbdefense-account-${account.organizationId}`,
    _type: ACCOUNT_ENTITY_TYPE,
    accountId: account.organizationId,
    displayName: account.organizationName,
    name: account.organizationName,
    webLink: `https://defense-${account.site}.conferdeploy.net`,
  });
});

test("createSensorEntities", () => {
  expect(createSensorEntities(sensors)).toEqual([
    {
      _class: SENSOR_ENTITY_CLASS,
      _key: `cbdefense-sensor-${sensor.deviceId}`,
      _type: SENSOR_ENTITY_TYPE,
      displayName: sensor.name as string,
      hostname: sensor.name ? sensor.name.toLowerCase() : undefined,
      ...sensor,
    },
  ]);
});
