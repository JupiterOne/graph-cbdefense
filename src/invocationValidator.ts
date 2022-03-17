import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';
import CbDefenseClient from './CbDefenseClient';
import { CarbonBlackIntegrationConfig } from './types';

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
export default async function invocationValidator({
  instance,
  logger,
}: {
  instance: { config: CarbonBlackIntegrationConfig };
  logger: { info: (...args: any[]) => boolean | void };
}) {
  const instanceConfig = instance.config;

  if (!instanceConfig) {
    throw new IntegrationValidationError('Configuration missing');
  }

  const { site, orgKey, connectorId, apiKey } = instanceConfig;

  if (!(site && orgKey && connectorId && apiKey)) {
    throw new IntegrationValidationError(
      'Configuration requires site, orgKey, connectorId, and apiKey',
    );
  }

  if (site.match('conferdeploy')) {
    throw new IntegrationValidationError(
      'Site is invalid; should be the environment only, not the full dashboard URL. For example, `prod05` in `https://defense-prod05.conferdeploy.net/`',
    );
  }

  const client = new CbDefenseClient(instanceConfig, logger);
  await client.getAccountDetails();
}
