import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import uuid from "uuid/v4";
import invocationValidator from "./invocationValidator";
import { CbDefenseIntegrationConfig } from "./types";

test("should throw error if configuration is not found", async () => {
  const accountId = uuid();
  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      accountId,
    } as any,
  });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    `Carbon Black Defense configuration not found (accountId=${accountId})`,
  );
});

test("should throw error if site is missing", async () => {
  const accountId = uuid();
  const config: Partial<CbDefenseIntegrationConfig> = {
    connectorId: uuid(),
    apiKey: uuid(),
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      accountId,
      config,
    } as any,
  });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    `No deployment site provided (accountId=${accountId})`,
  );
});

test("should throw if connectorId is missing", async () => {
  const accountId = uuid();
  const config: Partial<CbDefenseIntegrationConfig> = {
    site: "prod01",
    apiKey: uuid(),
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      accountId,
      config,
    } as any,
  });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    `Missing Connector ID in configuration (accountId=${accountId})`,
  );
});

test("should throw if api key is missing", async () => {
  const accountId = uuid();
  const config: Partial<CbDefenseIntegrationConfig> = {
    site: "prod01",
    connectorId: uuid(),
  };

  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      accountId,
      config,
    } as any,
  });

  await expect(invocationValidator(executionContext)).rejects.toThrow(
    `Missing API key in configuration (accountId=${accountId})`,
  );
});
