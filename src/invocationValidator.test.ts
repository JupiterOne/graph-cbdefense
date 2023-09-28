import {
  IntegrationProviderAuthenticationError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import { randomUUID as uuid } from 'crypto';
import invocationValidator from './invocationValidator';
import { CarbonBlackIntegrationConfig } from './types';

const mockGetAccountDetails = jest.fn();
jest.mock('./CbDefenseClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getAccountDetails: mockGetAccountDetails };
  });
});

test('should throw error if configuration is not found', async () => {
  const executionContext =
    createMockExecutionContext<CarbonBlackIntegrationConfig>();

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationValidationError,
  );
});

test('should throw error if orgKey is missing', async () => {
  const config: CarbonBlackIntegrationConfig = {
    connectorId: uuid(),
    apiKey: uuid(),
    site: 'prod',
    orgKey: '',
  };

  const executionContext =
    createMockExecutionContext<CarbonBlackIntegrationConfig>({
      instanceConfig: config,
    });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationValidationError,
  );
});

test('should throw if connectorId is missing', async () => {
  const config: CarbonBlackIntegrationConfig = {
    site: 'prod01',
    apiKey: uuid(),
    connectorId: '',
    orgKey: '',
  };

  const executionContext =
    createMockExecutionContext<CarbonBlackIntegrationConfig>({
      instanceConfig: config,
    });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationValidationError,
  );
});

test('should throw if api key is missing', async () => {
  const config: CarbonBlackIntegrationConfig = {
    site: 'prod01',
    connectorId: uuid(),
    apiKey: '',
    orgKey: '',
  };

  const executionContext =
    createMockExecutionContext<CarbonBlackIntegrationConfig>({
      instanceConfig: config,
    });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationValidationError,
  );
});

test('should throw if site include domain', async () => {
  const config: CarbonBlackIntegrationConfig = {
    site: 'prod01.conferdeploy.net',
    orgKey: uuid(),
    connectorId: uuid(),
    apiKey: uuid(),
  };

  const executionContext =
    createMockExecutionContext<CarbonBlackIntegrationConfig>({
      instanceConfig: config,
    });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationValidationError,
  );
});

test.skip('authentication failure', async () => {
  const config: CarbonBlackIntegrationConfig = {
    orgKey: uuid(),
    connectorId: uuid(),
    apiKey: uuid(),
  };

  const executionContext =
    createMockExecutionContext<CarbonBlackIntegrationConfig>({
      instanceConfig: config,
    });

  mockGetAccountDetails.mockRejectedValue({ code: 401 });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationProviderAuthenticationError,
  );
});
