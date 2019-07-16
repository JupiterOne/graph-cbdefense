import {
  createTestIntegrationExecutionContext,
  IntegrationInstanceAuthenticationError,
  IntegrationInstanceConfigError,
} from "@jupiterone/jupiter-managed-integration-sdk";
import uuid from "uuid/v4";
import invocationValidator from "./invocationValidator";
import { CbDefenseIntegrationConfig } from "./types";

const mockGetAccountDetails = jest.fn();
jest.mock("./CbDefenseClient", () => {
  return jest.fn().mockImplementation(() => {
    return { getAccountDetails: mockGetAccountDetails };
  });
});

test("should throw error if configuration is not found", async () => {
  const executionContext = createTestIntegrationExecutionContext();

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationInstanceConfigError,
  );
});

test("should throw error if site is missing", async () => {
  const config: Partial<CbDefenseIntegrationConfig> = {
    connectorId: uuid(),
    apiKey: uuid(),
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config,
    } as any,
  });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationInstanceConfigError,
  );
});

test("should throw if connectorId is missing", async () => {
  const config: Partial<CbDefenseIntegrationConfig> = {
    site: "prod01",
    apiKey: uuid(),
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config,
    } as any,
  });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationInstanceConfigError,
  );
});

test("should throw if api key is missing", async () => {
  const config: Partial<CbDefenseIntegrationConfig> = {
    site: "prod01",
    connectorId: uuid(),
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config,
    } as any,
  });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationInstanceConfigError,
  );
});

test("should throw if site include domain", async () => {
  const config: CbDefenseIntegrationConfig = {
    site: "prod01.conferdeploy.net",
    connectorId: uuid(),
    apiKey: uuid(),
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config,
    } as any,
  });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationInstanceConfigError,
  );
});

test("authentication failure", async () => {
  const config: CbDefenseIntegrationConfig = {
    site: "prod01",
    connectorId: uuid(),
    apiKey: uuid(),
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config,
    } as any,
  });

  mockGetAccountDetails.mockRejectedValue({ code: 401 });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    IntegrationInstanceAuthenticationError,
  );
});
