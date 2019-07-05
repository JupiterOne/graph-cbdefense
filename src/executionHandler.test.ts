import { IntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";

import { account, policies, sensors } from "./converters.test";
import executionHandler from "./executionHandler";
import initializeContext from "./initializeContext";
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_SENSOR_RELATIONSHIP_TYPE,
  SENSOR_ENTITY_TYPE,
} from "./types";

jest.mock("./initializeContext");

test("executionHandler", async () => {
  const executionContext: any = {
    graph: {
      findAllEntitiesByType: jest.fn().mockResolvedValue([]),
      findEntitiesByType: jest.fn().mockResolvedValue([]),
      findAllRelationshipsByType: jest.fn().mockResolvedValue([]),
      findRelationshipsByType: jest.fn().mockResolvedValue([]),
    },
    persister: {
      processEntities: jest.fn().mockReturnValue([]),
      processRelationships: jest.fn().mockReturnValue([]),
      publishPersisterOperations: jest.fn().mockResolvedValue({}),
    },
    provider: {
      getAccountDetails: jest.fn().mockResolvedValue(account),
      getSensorAgents: jest.fn().mockResolvedValue(sensors),
      getPolicies: jest.fn().mockResolvedValue(policies),
    },
  };

  (initializeContext as jest.Mock).mockReturnValue(executionContext);

  const invocationContext = {} as IntegrationExecutionContext;
  await executionHandler(invocationContext);

  expect(initializeContext).toHaveBeenCalledWith(invocationContext);

  expect(executionContext.graph.findAllEntitiesByType).toHaveBeenCalledWith(
    ACCOUNT_ENTITY_TYPE,
  );
  expect(executionContext.graph.findEntitiesByType).toHaveBeenCalledWith(
    SENSOR_ENTITY_TYPE,
  );
  expect(executionContext.graph.findRelationshipsByType).toHaveBeenCalledWith(
    ACCOUNT_SENSOR_RELATIONSHIP_TYPE,
  );

  expect(executionContext.provider.getAccountDetails).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.getSensorAgents).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.getPolicies).toHaveBeenCalledTimes(1);

  // account, service, sensors, policies
  expect(executionContext.persister.processEntities).toHaveBeenCalledTimes(4);

  // account -HAS-> sensors
  // account -HAS-> service
  // policy -ENFORCES -> service
  // sensor -ASSIGEND -> policy
  // sensor -PROTECTS -> device
  expect(executionContext.persister.processRelationships).toHaveBeenCalledTimes(
    5,
  );
  expect(
    executionContext.persister.publishPersisterOperations,
  ).toHaveBeenCalledTimes(1);
});
