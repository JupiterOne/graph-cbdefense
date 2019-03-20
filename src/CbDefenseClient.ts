import * as axios from "axios";

import {
  IntegrationInstanceAuthenticationError,
  IntegrationLogger,
} from "@jupiterone/jupiter-managed-integration-sdk";

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
  name: string;
  status: string | null;
  policyId: number | null;
  policyName: string | null;
}

export default class CbDefenseClient {
  private axiosInstance: axios.AxiosInstance;
  private BASE_API_URL: string;
  private logger: IntegrationLogger;
  private site: string;

  constructor(config: CbDefenseIntegrationConfig, logger: IntegrationLogger) {
    this.site = config.site;
    this.BASE_API_URL = `https://api-${
      this.site
    }.conferdeploy.net/integrationServices/v3`;
    this.logger = logger;
    this.axiosInstance = axiosUtil.createInstance(
      {
        baseURL: this.BASE_API_URL,
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
        "device",
        "start=1&rows=1",
      );
      this.logger.trace({}, "Fetched one device sensor agent");

      if (devices && devices.length === 1) {
        return {
          site: this.site,
          organizationName: devices[0].organizationName as string,
          organizationId: devices[0].organizationId,
        };
      } else {
        throw new Error(
          "Unable to retrieve Cb Defense account details from device sensor",
        );
      }
    } catch (err) {
      if (err.status === 401) {
        throw new IntegrationInstanceAuthenticationError(err);
      } else {
        throw new Error(
          "Unable to retrieve Cb Defense account details from device sensor",
        );
      }
    }
  }

  public async getSensorAgents(): Promise<CbDefenseSensor[]> {
    this.logger.trace("Fetching Cb Defense device sensor agents...");
    const result = await this.collectAllPages<CbDefenseSensor>("device");
    this.logger.trace({}, "Fetched device sensor agents");
    return result;
  }

  private async forEachPage<T>(
    firstUri: string,
    eachFn: (page: Page<T>) => void,
  ) {
    let nextPageUrl: string | null = `${this.BASE_API_URL}/${firstUri}`;

    while (nextPageUrl) {
      const response = await this.axiosInstance.get<Page<T>>(nextPageUrl);

      const page: any = response.data;

      eachFn(page);

      if (page.start && page.rows) {
        if (page.totalResults < page.start + page.rows) {
          nextPageUrl = `${this.BASE_API_URL}/${firstUri}?start=${page.start +
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

  private async collectAllPages<T>(firstUri: string): Promise<T[]> {
    const results: T[] = [];

    await this.forEachPage<T>(firstUri, (page: Page<T>) => {
      for (const item of page.results) {
        results.push(item);
      }
    });

    return results;
  }

  private async collectOnePage<T>(uri: string, params: string): Promise<T[]> {
    const url = `${this.BASE_API_URL}/${uri}?${params}`;
    const response = await this.axiosInstance.get<Page<T>>(url);
    const page: any = response.data;
    return page.results;
  }
}
