/* tslint:disable:no-console */
import {
  createLocalInvocationEvent,
  executeSingleHandlerLocal,
} from "@jupiterone/jupiter-managed-integration-sdk/local";
import { createLogger, TRACE } from "bunyan";
import { executionHandler } from "../src/index";
import { CbDefenseIntegrationConfig } from "../src/types";

async function run(): Promise<void> {
  const logger = createLogger({ name: "local", level: TRACE });

  const integrationConfig: CbDefenseIntegrationConfig = {
    site: process.env.CB_DEFENSE_LOCAL_EXECUTION_SITE as string,
    connectorId: process.env.CB_DEFENSE_LOCAL_EXECUTION_CONNECTOR_ID as string,
    apiKey: process.env.CB_DEFENSE_LOCAL_EXECUTION_API_KEY as string,
  };

  const invocationArgs = {
    // providerPrivateKey: process.env.PROVIDER_LOCAL_EXECUTION_PRIVATE_KEY
  };

  logger.info(
    await executeSingleHandlerLocal(
      integrationConfig,
      logger,
      executionHandler,
      invocationArgs,
      createLocalInvocationEvent(),
    ),
    "Execution completed successfully!",
  );
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
