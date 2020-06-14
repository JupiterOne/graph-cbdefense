import {
  EntityFromIntegration,
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  IntegrationRelationship,
  MappedRelationshipFromIntegration,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAccountDeviceSensorRelationship,
  createAccountEntity,
  createAccountServiceRelationship,
  createDeviceSensorEntity,
  createServiceEntity,
  mapSensorToDeviceRelationship,
} from "./converters";
import initializeContext from "./initializeContext";
import {
  ACCOUNT_DEVICE_SENSOR_RELATIONSHIP_TYPE,
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
  DEVICE_SENSOR_ENTITY_TYPE,
  SENSOR_DEVICE_RELATIONSHIP_TYPE,
  SERVICE_ENTITY_TYPE,
} from "./types";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, provider } = initializeContext(context);

  const results: PersisterOperationsResult[] = [];

  const accountData = await provider.getAccountDetails();
  const newAccountEntity = createAccountEntity(accountData);
  const newServiceEntity = createServiceEntity(
    accountData.site,
    accountData.organization_id,
  );

  const [
    oldAccountEntities,
    oldServiceEntities,
    oldAccountServiceRelationships,
  ] = await Promise.all([
    graph.findAllEntitiesByType(ACCOUNT_ENTITY_TYPE),
    graph.findEntitiesByType(SERVICE_ENTITY_TYPE),
    graph.findRelationshipsByType(ACCOUNT_SERVICE_RELATIONSHIP_TYPE),
  ]);

  results.push(
    await persister.publishPersisterOperations([
      [
        ...persister.processEntities(oldAccountEntities, [newAccountEntity]),
        ...persister.processEntities(oldServiceEntities, [newServiceEntity]),
      ],
      [
        ...persister.processRelationships(oldAccountServiceRelationships, [
          createAccountServiceRelationship(newAccountEntity, newServiceEntity),
        ]),
      ],
    ]),
  );

  const newDeviceSensorEntities: EntityFromIntegration[] = [];
  const newAccountDeviceSensorRelationships: IntegrationRelationship[] = [];
  const newMappedDeviceRelationships: MappedRelationshipFromIntegration[] = [];
  await provider.iterateDevices(device => {
    const newDeviceSensorEntity = createDeviceSensorEntity(device);
    newDeviceSensorEntities.push(newDeviceSensorEntity);
    newAccountDeviceSensorRelationships.push(
      createAccountDeviceSensorRelationship(
        newAccountEntity,
        newDeviceSensorEntity,
      ),
    );
    newMappedDeviceRelationships.push(
      mapSensorToDeviceRelationship(newDeviceSensorEntity),
    );
  });

  const [
    oldDeviceSensorEntities,
    oldAccountDeviceSensorRelationships,
    oldMappedDeviceRelationships,
  ] = await Promise.all([
    graph.findEntitiesByType(DEVICE_SENSOR_ENTITY_TYPE),
    graph.findRelationshipsByType(ACCOUNT_DEVICE_SENSOR_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(SENSOR_DEVICE_RELATIONSHIP_TYPE),
  ]);

  results.push(
    await persister.publishPersisterOperations([
      [
        ...persister.processEntities(
          oldDeviceSensorEntities,
          newDeviceSensorEntities,
        ),
      ],
      [
        ...persister.processRelationships(
          oldAccountDeviceSensorRelationships,
          newAccountDeviceSensorRelationships,
        ),
        ...persister.processRelationships(
          oldMappedDeviceRelationships,
          newMappedDeviceRelationships,
        ),
      ],
    ]),
  );

  return {
    operations: summarizePersisterOperationsResults(...results),
  };
}
