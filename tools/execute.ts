/* tslint:disable:no-console */
import { executeIntegrationLocal } from "@jupiterone/jupiter-managed-integration-sdk";
import managedInvocationConfig from "../src/index";

const integrationConfig = {
  site: process.env.CB_DEFENSE_LOCAL_EXECUTION_SITE as string,
  orgKey: process.env.CB_DEFENSE_LOCAL_EXECUTION_ORG_KEY as string,
  connectorId: process.env.CB_DEFENSE_LOCAL_EXECUTION_CONNECTOR_ID as string,
  apiKey: process.env.CB_DEFENSE_LOCAL_EXECUTION_API_KEY as string,
};

const invocationArgs = {
  // providerPrivateKey: process.env.PROVIDER_LOCAL_EXECUTION_PRIVATE_KEY
};

executeIntegrationLocal(
  integrationConfig,
  managedInvocationConfig,
  invocationArgs,
).catch(err => {
  console.error(err);
  process.stdout.end(() => {
    process.exit(1);
  });
});
