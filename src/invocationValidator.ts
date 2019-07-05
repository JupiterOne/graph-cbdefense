import {
  IntegrationInstanceConfigError,
  IntegrationValidationContext,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { CbDefenseIntegrationConfig } from "./types";

/**
 * Performs validation of the execution before the execution handler function is
 * invoked.
 *
 * At a minimum, integrations should ensure that the
 * `context.instance.config` is valid. Integrations that require
 * additional information in `context.invocationArgs` should also
 * validate those properties. It is also helpful to perform authentication with
 * the provider to ensure that credentials are valid.
 *
 * The function will be awaited to support connecting to the provider for this
 * purpose.
 *
 * @param context
 */
export default async function invocationValidator(
  context: IntegrationValidationContext,
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
