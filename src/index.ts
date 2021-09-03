import { IntegrationInvocationConfig } from "@jupiterone/integration-sdk-core";
import { IntegrationInvocationConfig as ManagedInvocationConfig } from "@jupiterone/jupiter-managed-integration-sdk";
import { Entities, MappedRelationships, Relationships } from "./constants";

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
      entities: [
        Entities.ACCOUNT,
        Entities.SERVICE,
        Entities.DEVICE_SENSOR,
        Entities.ALERT,
      ],
      relationships: [
        Relationships.ACCOUNT_HAS_SERVICE,
        Relationships.ACCOUNT_HAS_SENSOR,
        Relationships.SENSOR_IDENTIFIED_ALERT,
      ],
      mappedRelationships: [MappedRelationships.DEVICE_SENSOR_PROTECTS_DEVICE],
      executionHandler: () => undefined,
    },
  ],
};

export default managedInvocationConfig;
