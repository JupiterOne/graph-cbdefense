import {
  IntegrationExecutionContext,
  IntegrationInstanceConfigError,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { CbDefenseIntegrationConfig } from "./types";

export default async function invocationValidator(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
) {
  const { accountId, config } = context.instance;
  const instanceConfig = config as CbDefenseIntegrationConfig;

  if (!instanceConfig) {
    throw new IntegrationInstanceConfigError(
      `Carbon Black Defense configuration not found (accountId=${accountId})`,
    );
  }

  const { site, connectorId, apiKey } = instanceConfig;

  if (!site) {
    throw new IntegrationInstanceConfigError(
      `No deployment site provided (accountId=${accountId})`,
    );
  }

  if (!connectorId) {
    throw new IntegrationInstanceConfigError(
      `Missing Connector ID in configuration (accountId=${accountId})`,
    );
  }

  if (!apiKey) {
    throw new IntegrationInstanceConfigError(
      `Missing API key in configuration (accountId=${accountId})`,
    );
  }
}
