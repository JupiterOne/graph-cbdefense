import { CarbonBlackAccount, CarbonBlackDeviceSensor } from "./CbDefenseClient";
import { Entities, Relationships } from "./constants";
import {
  createAccountDeviceSensorRelationship,
  createAccountEntity,
  createAccountServiceRelationship,
  createAlertFindingEntity,
  createDeviceSensorAlertFindingRelationship,
  createDeviceSensorEntity,
  createServiceEntity,
  mapSensorToDeviceRelationship,
} from "./converters";

test("createAccountDeviceSensorRelationship", () => {
  const accountEntity = createAccountEntity({
    organization_id: 123,
    organization_name: "lifeomic.com",
  });
  const deviceEntity = createDeviceSensorEntity({ id: 891 });

  expect(
    createAccountDeviceSensorRelationship(accountEntity, deviceEntity),
  ).toEqual({
    _class: "HAS",
    _fromEntityKey: accountEntity._key,
    _key: `${accountEntity._key}_has_${deviceEntity._key}`,
    _toEntityKey: deviceEntity._key,
    _type: Relationships.ACCOUNT_HAS_SENSOR._type,
    displayName: "HAS",
  });
});

test("createAccountServiceRelationship", () => {
  const accountEntity = createAccountEntity({
    organization_id: 123,
    organization_name: "lifeomic.com",
  });
  const serviceEntity = createServiceEntity("prod05", 123);

  expect(
    createAccountServiceRelationship(accountEntity, serviceEntity),
  ).toEqual({
    _class: "HAS",
    _fromEntityKey: accountEntity._key,
    _key: `${accountEntity._key}_has_${serviceEntity._key}`,
    _toEntityKey: serviceEntity._key,
    _type: Relationships.ACCOUNT_HAS_SERVICE._type,
    displayName: "HAS",
  });
});

test("createAccountEntity", () => {
  const account: CarbonBlackAccount = {
    site: "prod05",
    organization_id: 1758,
    organization_name: "lifeomic.com",
  };

  expect(createAccountEntity(account)).toEqual({
    _rawData: [{ name: "default", rawData: account }],
    _class: Entities.ACCOUNT._class,
    _key: `carbonblack-account-1758`,
    _type: Entities.ACCOUNT._type,
    accountId: 1758,
    displayName: "lifeomic.com",
    name: "lifeomic.com",
    organization: "lifeomic",
    webLink: "https://defense-prod05.conferdeploy.net",
  });
});

test("createServiceEntity", () => {
  expect(createServiceEntity("prod05", 1758)).toEqual({
    _rawData: [],
    _class: [Entities.SERVICE._class],
    _key: `${Entities.SERVICE._type}-1758`,
    _type: Entities.SERVICE._type,
    name: "CB Endpoint Protection Service",
    displayName: "CB Endpoint Protection Service",
    category: ["software", "other"],
    function: ["monitoring"],
    endpoints: ["https://defense-prod05.conferdeploy.net"],
  });
});

describe("createDeviceEntity", () => {
  const data: CarbonBlackDeviceSensor = {
    activation_code: "6Z9M6V",
    activation_code_expiry_time: "2019-03-27T20:57:06.089Z",
    ad_group_id: 0,
    av_ave_version: null,
    av_engine: "",
    av_last_scan_time: "2020-06-13T15:30:15.355Z",
    av_master: false,
    av_pack_version: null,
    av_product_version: null,
    av_status: null,
    av_update_servers: null,
    av_vdf_version: null,
    current_sensor_policy_name: "Standard_Mac_Workstation",
    deregistered_time: "2020-06-13T15:30:15.355Z",
    device_meta_data_item_list: [
      {
        key_name: "OS_MAJOR_VERSION",
        key_value: "MAC OS X",
        position: 0,
      },
      {
        key_name: "SUBNET",
        key_value: "192.168.0",
        position: 0,
      },
    ],
    device_owner_id: 1749071,
    email: "david.smith@lifeomic.com",
    encoded_activation_code: "AQ3ZALWO@RUWZAO5!",
    first_name: "david",
    id: 7891906,
    last_contact_time: "2020-06-13T22:01:40.367Z",
    last_device_policy_changed_time: "2019-05-15T13:57:50.593Z",
    last_device_policy_requested_time: "2020-06-03T02:00:30.348Z",
    last_external_ip_address: "172.73.179.50",
    last_internal_ip_address: "192.168.0.131",
    last_location: "OFFSITE",
    last_name: "smith",
    last_policy_updated_time: "2017-09-21T14:40:44.343Z",
    last_reported_time: "2020-06-13T15:30:15.355Z",
    last_reset_time: "2020-06-13T15:30:15.355Z",
    last_shutdown_time: "2020-06-13T15:30:15.498Z",
    linux_kernel_version: null,
    login_user_name: "davidsmith",
    mac_address: "88e9fe4c693b",
    middle_name: null,
    name: "Davids-MacBook-Pro.local",
    organization_id: 1758,
    organization_name: "lifeomic.com",
    os: "MAC",
    os_version: "MAC OS X 10.15.5",
    passive_mode: false,
    policy_id: 12353,
    policy_name: "Standard_Mac_Workstation",
    policy_override: true,
    quarantined: false,
    registered_time: "2019-03-20T21:42:16.761Z",
    scan_last_action_time: "2020-06-13T15:30:15.355Z",
    scan_last_complete_time: "2020-06-13T15:30:15.355Z",
    scan_status: null,
    sensor_kit_type: "MAC",
    sensor_out_of_date: false,
    sensor_pending_update: false,
    sensor_states: [
      "ACTIVE",
      "SENSOR_SHUTDOWN",
      "LIVE_RESPONSE_NOT_RUNNING",
      "LIVE_RESPONSE_NOT_KILLED",
      "LIVE_RESPONSE_DISABLED",
      "SECURITY_CENTER_OPTLN_DISABLED",
    ],
    sensor_version: "3.4.2.23",
    status: "REGISTERED",
    target_priority: "MEDIUM",
    uninstall_code: "A8GZ1WVV",
    vdi_base_device: null,
    virtual_machine: false,
    virtualization_provider: "",
    windows_platform: null,
  };

  test("properties transferred", () => {
    const entity = createDeviceSensorEntity(data);
    expect(entity).toMatchObject({
      _rawData: [
        {
          name: "default",
          rawData: {
            ...data,
            activation_code: "REDACTED",
            encoded_activation_code: "REDACTED",
            uninstall_code: "REDACTED",
          },
        },
      ],
      _class: Entities.DEVICE_SENSOR._class,
      _key: "cbdefense-sensor-7891906",
      _type: Entities.DEVICE_SENSOR._type,
      displayName: data.name as string,
      hostname: "davids-macbook-pro",
      active: true,
      function: ["anti-malware", "activity-monitor"],
      macAddress: "88:e9:fe:4c:69:3b",

      activationCodeExpiryTime: 1553720226089,
      avLastScanTime: 1592062215355,
      deregisteredTime: 1592062215355,
      lastContactTime: 1592085700367,
      lastDevicePolicyChangedTime: 1557928670593,
      lastDevicePolicyRequestedTime: 1591149630348,
      lastPolicyUpdatedTime: 1506004844343,
      lastReportedTime: 1592062215355,
      lastResetTime: 1592062215355,
      lastShutdownTime: 1592062215498,
      registeredTime: 1553118136761,
      scanLastActionTime: 1592062215355,
      scanLastCompleteTime: 1592062215355,

      lastSeenOn: 1592085700367,

      activationCode: null,
      encodedActivationCode: null,
      uninstallCode: null,
    });
  });

  test("no time value", () => {
    expect(
      createDeviceSensorEntity({
        ...data,
        activation_code_expiry_time: null,
        av_last_scan_time: null,
        deregistered_time: null,
        last_contact_time: null,
        last_device_policy_changed_time: null,
        last_device_policy_requested_time: null,
        last_policy_updated_time: null,
        last_reported_time: null,
        last_reset_time: null,
        last_shutdown_time: null,
        registered_time: null,
        scan_last_action_time: null,
        scan_last_complete_time: null,
      }),
    ).toMatchObject({
      activationCodeExpiryTime: undefined,
      avLastScanTime: undefined,
      deregisteredTime: undefined,
      lastContactTime: undefined,
      lastDevicePolicyChangedTime: undefined,
      lastDevicePolicyRequestedTime: undefined,
      lastPolicyUpdatedTime: undefined,
      lastReportedTime: undefined,
      lastResetTime: undefined,
      lastShutdownTime: undefined,
      registeredTime: undefined,
      scanLastActionTime: undefined,
      scanLastCompleteTime: undefined,
      lastSeenOn: undefined,
    });
  });

  test("no device name", () => {
    expect(
      createDeviceSensorEntity({
        ...data,
        name: null,
      }),
    ).toMatchObject({
      displayName: "cbdefense-sensor",
    });
  });
});

test("mapSensorToDeviceRelationship", () => {
  const sensor = createDeviceSensorEntity({
    id: 123,
    email: "test@example.com",
    name: "Davids-MacBook-Pro.local",
    mac_address: "88e9fe4c693b",
    last_external_ip_address: "172.73.179.50",
    last_internal_ip_address: "192.168.0.131",
    os: "MAC",
    os_version: "MAC OS X 10.15.5",
  });

  const mapping = {
    relationshipDirection: "FORWARD",
    sourceEntityKey: sensor._key,
    targetFilterKeys: [["_type", "macAddress"]],
    targetEntity: {
      _type: "user_endpoint",
      _class: ["Device", "Host"],
      owner: "test@example.com",
      displayName: "davids-macbook-pro",
      hostname: "davids-macbook-pro",
      macAddress: "88:e9:fe:4c:69:3b",
      publicIp: "172.73.179.50",
      publicIpAddress: "172.73.179.50",
      privateIp: "192.168.0.131",
      privateIpAddress: "192.168.0.131",
      platform: "darwin",
      osDetails: "MAC OS X 10.15.5",
      osName: "macOS",
      osVersion: "10.15.5",
    },
  };

  expect(mapSensorToDeviceRelationship(sensor)).toEqual({
    _key: `${sensor._key}|protects|device-davids-macbook-pro`,
    _type: "cbdefense_sensor_protects_device",
    _class: "PROTECTS",
    _mapping: mapping,
  });

  expect(
    mapSensorToDeviceRelationship({ ...sensor, macAddress: undefined }),
  ).toEqual({
    _key: `${sensor._key}|protects|device-davids-macbook-pro`,
    _type: "cbdefense_sensor_protects_device",
    _class: "PROTECTS",
    _mapping: {
      ...mapping,
      targetFilterKeys: [["_type", "hostname", "owner"]],
      targetEntity: { ...mapping.targetEntity, macAddress: undefined },
    },
  });
});

describe("createAlertFindingEntity", () => {
  const data = {
    id: "038894832709076d63111e99466f73575fcf3ca",
    legacy_alert_id: "1DDU8H9N",
    org_key: "ASDF1234",
    create_time: "2019-09-13T14:17:21.668Z",
    last_update_time: "2019-09-13T14:17:21.668Z",
    first_event_time: "2019-09-13T14:16:55.878Z",
    last_event_time: "2019-09-13T14:16:55.878Z",
    threat_id: "b7ce4f79e8903c09d2cd6b615c965c9f",
    severity: 3,
    category: "MONITORED",
    Device_id: 123,
    device_os: "MAC",
    device_os_version: "<OS Version>",
    device_name: "<System-Name>",
    device_username: "support@carbonblack.com",
    policy_id: 1,
    policy_name: "default",
    target_value: "MISSION_CRITICAL",
    process_name: "79d521e0e9c776f6e0b43b9cd2adea3c-down.sh",
    reason:
      "The application Google Chrome invoked another application (Google Chrome Helper (Renderer)).",
    reason_code: "R_BOX_WEB_RUN",
    threat_cause_vector: "UNKNOWN",
  };

  test("properties transferred", () => {
    expect(createAlertFindingEntity(data)).toEqual({
      _rawData: [
        {
          name: "default",
          rawData: data,
        },
      ],

      _key: "cb-alert-038894832709076d63111e99466f73575fcf3ca",
      _type: Entities.ALERT._type,
      _class: Entities.ALERT._class,

      name: "038894832709076d63111e99466f73575fcf3ca",
      displayName:
        "79d521e0e9c776f6e0b43b9cd2adea3c-down.sh : R_BOX_WEB_RUN : UNKNOWN",
      createTime: 1568384241668,
      lastUpdateTime: 1568384241668,
      createdOn: 1568384241668,
      updatedOn: 1568384241668,
      firstEventTime: 1568384215878,
      lastEventTime: 1568384215878,

      id: "038894832709076d63111e99466f73575fcf3ca",
      legacyAlertId: "1DDU8H9N",
      orgKey: "ASDF1234",
      threatId: "b7ce4f79e8903c09d2cd6b615c965c9f",
      category: "MONITORED",
      deviceId: 123,
      deviceOs: "MAC",
      deviceOsVersion: "<OS Version>",
      deviceName: "<System-Name>",
      deviceUsername: "support@carbonblack.com",
      policyId: 1,
      policyName: "default",
      targetValue: "MISSION_CRITICAL",
      processName: "79d521e0e9c776f6e0b43b9cd2adea3c-down.sh",
      reason:
        "The application Google Chrome invoked another application (Google Chrome Helper (Renderer)).",
      reasonCode: "R_BOX_WEB_RUN",
      threatCauseVector: "UNKNOWN",

      description:
        "The application Google Chrome invoked another application (Google Chrome Helper (Renderer)).",

      severity: "Low",
      numericSeverity: 3,
      alertSeverity: "Minor",

      open: true,
    });
  });

  test("displayName when missing any component property", () => {
    expect(
      createAlertFindingEntity({ ...data, process_name: undefined }),
    ).toMatchObject({
      displayName: "038894832709076d63111e99466f73575fcf3ca",
    });
  });
});

test("createDeviceSensorAlertFindingRelationship", () => {
  expect(
    createDeviceSensorAlertFindingRelationship({
      _key: "cb-alert-123",
      _type: Entities.ALERT._type,
      _class: Entities.ALERT._class,
      deviceId: 9387,
    }),
  ).toEqual({
    _key: "cbdefense-sensor-9387|identified|cb-alert-123",
    _type: "cbdefense_sensor_identified_alert",
    _class: "IDENTIFIED",
    _fromEntityKey: "cbdefense-sensor-9387",
    _toEntityKey: "cb-alert-123",
    displayName: "IDENTIFIED",
  });
});
