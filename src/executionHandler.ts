import {
  IntegrationExecutionContext,
  IntegrationExecutionResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import CbDefenseClient from "./CbDefenseClient";
import {
  createAccountEntity,
  createAccountRelationships,
  createPolicyEntities,
  createSensorEntities,
  createSensorPolicyRelationships,
  createServiceEntity,
  createServicePolicyRelationships,
  mapSensorToDeviceRelationship,
} from "./converters";
import initializeContext from "./initializeContext";
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_SENSOR_RELATIONSHIP_TYPE,
  ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
  CbDefenseAccountEntity,
  CbDefensePolicyEntity,
  CbDefenseSensorEntity,
  CbDefenseServiceEntity,
  POLICY_ENTITY_TYPE,
  SENSOR_DEVICE_RELATIONSHIP_TYPE,
  SENSOR_ENTITY_TYPE,
  SENSOR_POLICY_RELATIONSHIP_TYPE,
  SERVICE_ENTITY_TYPE,
  SERVICE_POLICY_RELATIONSHIP_TYPE,
} from "./types";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, provider } = initializeContext(context);

  const [
    oldAccountEntities,
    oldSensorEntities,
    oldServiceEntities,
    oldPolicyEntities,
    oldAccountSensorRelationships,
    oldAccountServiceRelationships,
    oldServicePolicyRelationships,
    oldSensorPolicyRelationships,
    oldMappedDeviceRelationships,
  ] = await Promise.all([
    graph.findAllEntitiesByType<CbDefenseAccountEntity>(ACCOUNT_ENTITY_TYPE),
    graph.findEntitiesByType<CbDefenseSensorEntity>(SENSOR_ENTITY_TYPE),
    graph.findEntitiesByType<CbDefenseServiceEntity>(SERVICE_ENTITY_TYPE),
    graph.findEntitiesByType<CbDefensePolicyEntity>(POLICY_ENTITY_TYPE),
    graph.findRelationshipsByType(ACCOUNT_SENSOR_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(ACCOUNT_SERVICE_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(SERVICE_POLICY_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(SENSOR_POLICY_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(SENSOR_DEVICE_RELATIONSHIP_TYPE),
  ]);

  const [
    newAccountEntities,
    newSensorEntities,
    newPolicyEntities,
  ] = await Promise.all([
    fetchAccountEntitiesFromProvider(provider),
    fetchSensorEntitiesFromProvider(provider),
    fetchPolicyEntitiesFromProvider(provider),
  ]);
  await provider.getAlerts();

  const [accountEntity] = newAccountEntities;
  const serviceEntity = createServiceEntity(accountEntity.accountId);
  const newServiceEntities = [serviceEntity];

  const newAccountServiceRelationships = createAccountRelationships(
    accountEntity,
    newServiceEntities,
    ACCOUNT_SENSOR_RELATIONSHIP_TYPE,
  );
  const newAccountSensorRelationships = createAccountRelationships(
    accountEntity,
    newSensorEntities,
    ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
  );

  const newMappedDeviceRelationships = [];
  for (const e of newSensorEntities) {
    newMappedDeviceRelationships.push(mapSensorToDeviceRelationship(e));
  }

  const newServicePolicyRelationships = createServicePolicyRelationships(
    serviceEntity,
    newPolicyEntities,
  );

  const newSensorPolicyRelationships = createSensorPolicyRelationships(
    newSensorEntities,
  );

  return {
    operations: await persister.publishPersisterOperations([
      [
        ...persister.processEntities(oldAccountEntities, newAccountEntities),
        ...persister.processEntities(oldSensorEntities, newSensorEntities),
        ...persister.processEntities(oldServiceEntities, newServiceEntities),
        ...persister.processEntities(oldPolicyEntities, newPolicyEntities),
      ],
      [
        ...persister.processRelationships(
          oldAccountServiceRelationships,
          newAccountServiceRelationships,
        ),
        ...persister.processRelationships(
          oldAccountSensorRelationships,
          newAccountSensorRelationships,
        ),
        ...persister.processRelationships(
          oldSensorPolicyRelationships,
          newSensorPolicyRelationships,
        ),
        ...persister.processRelationships(
          oldServicePolicyRelationships,
          newServicePolicyRelationships,
        ),
        ...persister.processRelationships(
          oldMappedDeviceRelationships,
          newMappedDeviceRelationships,
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

async function fetchPolicyEntitiesFromProvider(
  provider: CbDefenseClient,
): Promise<CbDefensePolicyEntity[]> {
  return createPolicyEntities(await provider.getPolicies());
}
