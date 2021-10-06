import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import invocationValidator from './invocationValidator';
import { integrationSteps } from './steps/synchronize';
import { CarbonBlackIntegrationConfig } from './types';

export const invocationConfig: IntegrationInvocationConfig<CarbonBlackIntegrationConfig> =
  {
    instanceConfigFields: {
      site: {
        type: 'string',
        mask: false,
      },
      orgKey: {
        type: 'string',
        mask: false,
      },
      connectorId: {
        type: 'string',
        mask: false,
      },
      apiKey: {
        type: 'string',
        mask: true,
      },
    },
    validateInvocation: invocationValidator,
    integrationSteps,
  };
