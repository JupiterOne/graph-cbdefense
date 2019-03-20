import {
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk";

import CbDefenseClient from "./CbDefenseClient";
import {
  createAccountEntity,
  createAccountRelationships,
  createSensorEntities,
} from "./converters";
import initializeContext from "./initializeContext";
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_SENSOR_RELATIONSHIP_TYPE,
  CbDefenseAccountEntity,
  CbDefenseSensorEntity,
  SENSOR_ENTITY_TYPE,
} from "./types";

export default async function executionHandler(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, provider } = initializeContext(context);

  const [
    oldAccountEntities,
    oldSensorEntities,
    oldAccountSensorRelationships,
    newAccountEntities,
    newSensorEntities,
  ] = await Promise.all([
    graph.findEntitiesByType<CbDefenseAccountEntity>(ACCOUNT_ENTITY_TYPE),
    graph.findEntitiesByType<CbDefenseSensorEntity>(SENSOR_ENTITY_TYPE),
    graph.findRelationshipsByType(ACCOUNT_SENSOR_RELATIONSHIP_TYPE),
    fetchAccountEntitiesFromProvider(provider),
    fetchSensorEntitiesFromProvider(provider),
  ]);

  const [accountEntity] = newAccountEntities;
  const newAccountSensorRelationships = createAccountRelationships(
    accountEntity,
    newSensorEntities,
    ACCOUNT_SENSOR_RELATIONSHIP_TYPE,
  );

  return {
    operations: await persister.publishPersisterOperations([
      [
        ...persister.processEntities(oldAccountEntities, newAccountEntities),
        ...persister.processEntities(oldSensorEntities, newSensorEntities),
      ],
      [
        ...persister.processRelationships(
          oldAccountSensorRelationships,
          newAccountSensorRelationships,
        ),
      ],
    ]),
  };
}

async function fetchAccountEntitiesFromProvider(
  provider: CbDefenseClient,
): Promise<CbDefenseAccountEntity[]> {
  return [createAccountEntity(await provider.getAccountDetails())];
}

async function fetchSensorEntitiesFromProvider(
  provider: CbDefenseClient,
): Promise<CbDefenseSensorEntity[]> {
  return createSensorEntities(await provider.getSensorAgents());
}
