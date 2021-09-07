import { IntegrationInvocationConfig } from "@jupiterone/integration-sdk-core";
import { Entities, MappedRelationships, Relationships } from "./constants";

import invocationValidator from "./invocationValidator";
import { CarbonBlackIntegrationConfig } from "./types";

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
