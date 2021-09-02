import { IntegrationInvocationConfig } from "@jupiterone/integration-sdk-core";
import { IntegrationInvocationConfig as ManagedInvocationConfig } from "@jupiterone/jupiter-managed-integration-sdk";

import executionHandler from "./executionHandler";
import invocationValidator from "./invocationValidator";
import { CarbonBlackIntegrationConfig } from "./types";

const managedInvocationConfig: ManagedInvocationConfig = {
  instanceConfigFields: {
    site: {
      type: "string",
      mask: false,
    },
    orgKey: {
      type: "string",
      mask: false,
    },
    connectorId: {
      type: "string",
      mask: false,
    },
    apiKey: {
      type: "string",
      mask: true,
    },
  },

  executionHandler,
  invocationValidator,
};

export const invocationConfig: IntegrationInvocationConfig<
  CarbonBlackIntegrationConfig
> = {
  instanceConfigFields: {
    site: {
      type: "string",
      mask: false,
    },
    orgKey: {
      type: "string",
      mask: false,
    },
    connectorId: {
      type: "string",
      mask: false,
    },
    apiKey: {
      type: "string",
      mask: true,
    },
  },
  validateInvocation: invocationValidator,
  integrationSteps: [
    {
      id: "synchronize",
      name: "Synchronize",
      entities: [],
      relationships: [],
      executionHandler: () => undefined,
    },
  ],
};

export default managedInvocationConfig;
