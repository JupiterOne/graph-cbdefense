import { IntegrationInvocationConfig } from "@jupiterone/jupiter-managed-integration-sdk";

import executionHandler from "./executionHandler";
import invocationValidator from "./invocationValidator";

const invocationConfig: IntegrationInvocationConfig = {
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

export default invocationConfig;
