import {
  EntityFromIntegration,
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  IntegrationRelationship,
  IntegrationServiceClient,
  MappedRelationshipFromIntegration,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAccountDeviceSensorRelationship,
  createAccountEntity,
  createAccountServiceRelationship,
  createAlertFindingEntity,
  createDeviceSensorAlertFindingRelationship,
  createDeviceSensorEntity,
  createServiceEntity,
  mapSensorToDeviceRelationship,
} from "./converters";
import initializeContext from "./initializeContext";
import {
  ACCOUNT_DEVICE_SENSOR_RELATIONSHIP_TYPE,
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
  CbDefenseExecutionContext,
  DEVICE_SENSOR_ENTITY_TYPE,
  SENSOR_DEVICE_RELATIONSHIP_TYPE,
  SERVICE_ENTITY_TYPE,
} from "./types";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  const cbContext = initializeContext(context);
  const { provider } = cbContext;

  const results: PersisterOperationsResult[] = [];

  const accountData = await provider.getAccountDetails();
  const newAccountEntity = createAccountEntity(accountData);
  const newServiceEntity = createServiceEntity(
    accountData.site,
    accountData.organization_id,
  );

  results.push(
    await syncAccountAndService(cbContext, newAccountEntity, newServiceEntity),
  );
  results.push(await syncDeviceSensors(cbContext, newAccountEntity));
  results.push(await syncAlertFindings(cbContext));

  return {
    operations: summarizePersisterOperationsResults(...results),
  };
}

async function syncDeviceSensors(
  context: CbDefenseExecutionContext,
  newAccountEntity: EntityFromIntegration,
): Promise<PersisterOperationsResult> {
  const { provider, graph, persister } = context;

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

  const oldDeviceSensorEntities = await graph.findEntitiesByType(
    DEVICE_SENSOR_ENTITY_TYPE,
  );

  const [
    oldAccountDeviceSensorRelationships,
    oldMappedDeviceRelationships,
  ] = await Promise.all([
    graph.findRelationshipsByType(ACCOUNT_DEVICE_SENSOR_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(SENSOR_DEVICE_RELATIONSHIP_TYPE),
  ]);

  return persister.publishPersisterOperations([
    persister.processEntities({
      oldEntities: oldDeviceSensorEntities,
      newEntities: newDeviceSensorEntities,
    }),
    [
      ...persister.processRelationships({
        oldRelationships: oldAccountDeviceSensorRelationships,
        newRelationships: newAccountDeviceSensorRelationships,
      }),
      ...persister.processRelationships({
        oldRelationships: oldMappedDeviceRelationships,
        newRelationships: newMappedDeviceRelationships,
      }),
    ],
  ]);
}

async function syncAccountAndService(
  context: CbDefenseExecutionContext,
  newAccountEntity: EntityFromIntegration,
  newServiceEntity: EntityFromIntegration,
): Promise<PersisterOperationsResult> {
  const { graph, persister } = context;

  const [oldAccountEntities, oldServiceEntities] = await Promise.all([
    graph.findAllEntitiesByType(ACCOUNT_ENTITY_TYPE),
    graph.findEntitiesByType(SERVICE_ENTITY_TYPE),
  ]);

  const oldAccountServiceRelationships = await graph.findRelationshipsByType(
    ACCOUNT_SERVICE_RELATIONSHIP_TYPE,
  );

  return persister.publishPersisterOperations([
    [
      ...persister.processEntities({
        oldEntities: oldAccountEntities,
        newEntities: [newAccountEntity],
      }),
      ...persister.processEntities({
        oldEntities: oldServiceEntities,
        newEntities: [newServiceEntity],
      }),
    ],
    persister.processRelationships({
      oldRelationships: oldAccountServiceRelationships,
      newRelationships: [
        createAccountServiceRelationship(newAccountEntity, newServiceEntity),
      ],
    }),
  ]);
}

async function syncAlertFindings(
  context: CbDefenseExecutionContext,
): Promise<PersisterOperationsResult> {
  const { provider, persister } = context;

  const alertsSinceDate = await determineAlertsSinceDate(
    context.clients.getClients().integrationService,
  );

  const recentAlertFindingEntities: EntityFromIntegration[] = [];
  const deviceSensorAlertFindingRelationships: IntegrationRelationship[] = [];
  await provider.iterateAlerts(alert => {
    const newFindingEntity = createAlertFindingEntity(alert);
    recentAlertFindingEntities.push(newFindingEntity);
    deviceSensorAlertFindingRelationships.push(
      createDeviceSensorAlertFindingRelationship(newFindingEntity),
    );
  }, alertsSinceDate);

  return persister.publishPersisterOperations([
    persister.processEntities({
      oldEntities: [],
      newEntities: recentAlertFindingEntities,
    }),
    persister.processRelationships({
      oldRelationships: [],
      newRelationships: deviceSensorAlertFindingRelationships,
    }),
  ]);
}

async function determineAlertsSinceDate(
  integrationService: IntegrationServiceClient,
): Promise<Date> {
  const lastSuccessStartTime = await integrationService.lastSuccessfulSynchronizationTime();
  if (lastSuccessStartTime) {
    return new Date(lastSuccessStartTime);
  } else {
    const fiveDaysMs = 1000 * 60 * 60 * 24 * 5;
    return new Date(Date.now() - fiveDaysMs);
  }
}
