import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk";

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
      findEntitiesByType: jest.fn().mockResolvedValue([]),
      findRelationshipsByType: jest.fn().mockResolvedValue([]),
    },
    persister: {
      processEntities: jest.fn().mockReturnValue([]),
      processRelationships: jest.fn().mockReturnValue([]),
      publishPersisterOperations: jest.fn().mockResolvedValue({}),
    },
    provider: {
      getAccountDetails: jest.fn().mockResolvedValue({}),
      getSensorAgents: jest.fn().mockResolvedValue([]),
    },
  };

  (initializeContext as jest.Mock).mockReturnValue(executionContext);

  const invocationContext = {} as IntegrationExecutionContext<
    IntegrationInvocationEvent
  >;
  await executionHandler(invocationContext);

  expect(initializeContext).toHaveBeenCalledWith(invocationContext);

  expect(executionContext.graph.findEntitiesByType).toHaveBeenCalledWith(
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

  expect(executionContext.persister.processEntities).toHaveBeenCalledTimes(2);
  expect(executionContext.persister.processRelationships).toHaveBeenCalledTimes(
    1,
  );
  expect(
    executionContext.persister.publishPersisterOperations,
  ).toHaveBeenCalledTimes(1);
});
