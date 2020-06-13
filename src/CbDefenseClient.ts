import {
  IntegrationError,
  IntegrationInstanceAuthenticationError,
  IntegrationLogger,
} from "@jupiterone/jupiter-managed-integration-sdk";
import * as axios from "axios";
import { CbDefenseIntegrationConfig } from "./types";
import * as axiosUtil from "./util/axios-util";

interface Page<T> {
  latestTime: number;
  success: boolean;
  message: string;
  totalResults: number;
  elapsed: number;
  start?: number;
  rows?: number;
  results: T[];
}

export interface CbDefenseAccount {
  site: string;
  organizationName: string;
  organizationId: number;
  domains?: string[];
}

export interface CbDefenseSensor {
  adGroupId: number | null;
  policyOverride: boolean | null;
  currentSensorPolicyName: string | null;
  deviceMetaDataItemList: string[] | null;
  lastDevicePolicyRequestedTime: number | null;
  lastDevicePolicyChangedTime: number | null;
  lastPolicyUpdatedTime: number | null;
  loginUserName: string | null;
  activationCode: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  middleName: string | null;
  deviceId: number | null;
  deviceType: string | null;
  deviceOwnerId: number | null;
  deviceGuid: number | null;
  deviceSessionId: number | null;
  assignedToId: number | null;
  assignedToName: string | null;
  targetPriorityType: string | null;
  organizationName: string;
  organizationId: number;
  uninstallCode: number | null;
  createTime: number | null;
  lastReportedTime: number | null;
  osVersion: string | null;
  activationCodeExpiryTime: number | null;
  sensorVersion: string | null;
  registeredTime: number | null;
  lastContact: number | null;
  windowsPlatform: string | null;
  vdiBaseDevice: string | null;
  avStatus: string | null;
  deregisteredTime: number | null;
  sensorStates: string[] | null;
  messages: string[] | null;
  rootedBySensor: boolean | null;
  rootedBySensorTime: number | null;
  quarantined: boolean | null;
  lastInternalIpAddress: string | null;
  macAddress: string | null;
  lastExternalIpAddress: string | null;
  lastLocation: string | null;
  sensorOutOfDate: boolean | null;
  avUpdateServers: string[] | null;
  passiveMode: boolean | null;
  lastResetTime: number | null;
  lastShutdownTime: number | null;
  scanStatus: string | null;
  scanLastActionTime: number | null;
  scanLastCompleteTime: number | null;
  linuxKernelVersion: number | null;
  avEngine: string | null;
  avProductVersion: string | null;
  avAveVersion: string | null;
  avPackVersion: string | null;
  avVdfVersion: string | null;
  avLastScanTime: number | null;
  virtualMachine: boolean | null;
  virtualizationProvider: string | null;
  firstVirusActivityTime: number | null;
  lastVirusActivityTime: number | null;
  rootedByAnalytics: boolean | null;
  rootedByAnalyticsTime: number | null;
  testId: number | null;
  avMaster: boolean | null;
  encodedActivationCode: number | null;
  originEventHash: number | null;
  uninstalledTime: number | null;
  name: string | null;
  status: string | null;
  policyId: number | null;
  policyName: string | null;
}

export interface CbDefensePolicy extends CbDefensePolicyProperties {
  policy: CbDefensePolicySettings;
}

export interface CbDefensePolicyProperties {
  id: number;
  version: number;
  latestRevision: number;
  priorityLevel: string;
  systemPolicy: boolean;
  name: string;
  description: string | null;
}

export interface CbDefensePolicySettings {
  id: number;
  avSettings: any;
  sensorSettings: any;
  knownBadHashAutoDeleteDelayMs: any;
  directoryActionRules: any;
  rules: CbDefensePolicyRule[];
}

export interface CbDefensePolicyRule {
  id: number;
  application: {
    type: string;
    value: string;
  };
  required: boolean;
  operation: string;
  action: string;
}

export interface CbDefenseAlert {
  id: string;
}

export default class CbDefenseClient {
  private axiosInstance: axios.AxiosInstance;
  private PSC_HOSTNAME: string;
  private DEFENSE_HOSTNAME: string;
  private logger: IntegrationLogger;
  private site: string;

  constructor(config: CbDefenseIntegrationConfig, logger: IntegrationLogger) {
    this.site = config.site;

    // See https://developer.carbonblack.com/reference/carbon-black-cloud/authentication/#explaining-the-url-parts
    this.PSC_HOSTNAME = `https://defense-${
      this.site
    }.conferdeploy.net/appservices/v6/orgs/${config.orgKey}`;
    this.DEFENSE_HOSTNAME = `https://api-${
      this.site
    }.conferdeploy.net/integrationServices/v3`;

    this.logger = logger;
    this.axiosInstance = axiosUtil.createInstance(
      {
        headers: {
          "X-Auth-Token": `${config.apiKey}/${config.connectorId}`,
        },
      },
      logger,
    );
  }

  public async getAccountDetails(): Promise<CbDefenseAccount> {
    this.logger.trace("Fetching a single Cb Defense device sensor agent...");
    try {
      const devices = await this.collectOnePage<CbDefenseSensor>(
        this.DEFENSE_HOSTNAME,
        "device",
        "start=1&rows=1",
      );
      this.logger.trace("Fetched one device sensor agent");

      if (devices && devices.length > 0) {
        return {
          site: this.site,
          organizationName: devices[0].organizationName as string,
          organizationId: devices[0].organizationId,
        };
      } else {
        throw new IntegrationError(
          "Unable to retrieve Cb Defense account details, no device sensor found",
        );
      }
    } catch (err) {
      if (err.status === 401) {
        throw new IntegrationInstanceAuthenticationError(err);
      } else {
        throw new IntegrationError({
          cause: err,
          message: "Unable to retrieve Cb Defense account details",
        });
      }
    }
  }

  public async getSensorAgents(): Promise<CbDefenseSensor[]> {
    this.logger.trace("Fetching Cb Defense device sensor agents...");
    const result = await this.collectAllPages<CbDefenseSensor>(
      this.DEFENSE_HOSTNAME,
      "device",
    );
    this.logger.trace("Fetched device sensor agents");
    return result;
  }

  public async getPolicies(): Promise<CbDefensePolicy[]> {
    this.logger.trace("Fetching Cb Defense policies...");
    const result = await this.collectAllPages<CbDefensePolicy>(
      this.DEFENSE_HOSTNAME,
      "policy",
    );
    this.logger.trace("Fetched policies");
    return result;
  }

  public async getAlerts(): Promise<CbDefenseAlert[]> {
    this.logger.trace("Fetching Cb Defense alerts...");
    const fiveDaysMs = 1000 * 60 * 60 * 24 * 5;
    const fiveDaysAgo = new Date(Date.now() - fiveDaysMs);

    const response = await this.axiosInstance.post<Page<CbDefenseAlert>>(
      `${this.PSC_HOSTNAME}/alerts/_search`,
      {
        criteria: {
          create_time: {
            start: fiveDaysAgo.toISOString(),
            end: new Date().toISOString(),
          },
        },
      },
    );

    this.logger.info({ response }, "Got de Alerts");
    this.logger.trace("Fetched alerts");
    const page = response.data;
    return page.results;
  }

  private async forEachPage<T>(
    hostname: string,
    path: string,
    eachFn: (page: Page<T>) => void,
  ) {
    let nextPageUrl: string | null = `${hostname}/${path}`;

    while (nextPageUrl) {
      const response = await this.axiosInstance.get<Page<T>>(nextPageUrl);

      const page: any = response.data;

      eachFn(page);

      if (page.start && page.rows) {
        if (page.totalResults < page.start + page.rows) {
          nextPageUrl = `${hostname}/${path}?start=${page.start +
            page.rows +
            1}&rows=${page.rows}`;
        } else {
          nextPageUrl = null;
        }
      } else {
        nextPageUrl = null;
      }
    }
  }

  private async collectAllPages<T>(
    hostname: string,
    path: string,
  ): Promise<T[]> {
    const results: T[] = [];

    await this.forEachPage<T>(hostname, path, (page: Page<T>) => {
      for (const item of page.results) {
        results.push(item);
      }
    });

    return results;
  }

  private async collectOnePage<T>(
    hostname: string,
    path: string,
    params: string,
  ): Promise<T[]> {
    const url = `${hostname}/${path}?${params}`;
    const response = await this.axiosInstance.get<Page<T>>(url);
    const page: any = response.data;
    return page.results;
  }
}
