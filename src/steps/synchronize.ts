import {
  Entity,
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import CbDefenseClient from '../CbDefenseClient';
import {
  Entities,
  MappedRelationships,
  Relationships,
  StepIds,
} from '../constants';
import {
  AlertFindingEntity,
  createAccountDeviceSensorRelationship,
  createAccountEntity,
  createAccountServiceRelationship,
  createAlertFindingEntity,
  createDeviceSensorAlertFindingRelationship,
  createDeviceSensorEntity,
  createServiceEntity,
  DeviceSensorEntity,
  mapSensorToDeviceRelationship,
} from '../converters';
import { CarbonBlackIntegrationConfig } from '../types';

async function synchronize(
  context: IntegrationStepExecutionContext<CarbonBlackIntegrationConfig>,
) {
  const { jobState } = context;
  const provider = new CbDefenseClient(context.instance.config, context.logger);

  const accountData = await provider.getAccountDetails();
  const accountEntity = await jobState.addEntity(
    createAccountEntity(accountData),
  );
  const serviceEntity = await jobState.addEntity(
    createServiceEntity(accountData.site, accountData.organization_id),
  );
  await jobState.addRelationship(
    createAccountServiceRelationship(accountEntity, serviceEntity),
  );

  await syncDeviceSensors(context, provider, accountEntity);
  await syncAlertFindings(context, provider);
}

async function syncDeviceSensors(
  context: IntegrationStepExecutionContext<CarbonBlackIntegrationConfig>,
  provider: CbDefenseClient,
  accountEntity: Entity,
) {
  const { jobState } = context;

  await provider.iterateDevices(async (device) => {
    const deviceEntity = (await jobState.addEntity(
      createDeviceSensorEntity(device),
    )) as DeviceSensorEntity;
    await jobState.addRelationship(
      createAccountDeviceSensorRelationship(accountEntity, deviceEntity),
    );
    await jobState.addRelationship(mapSensorToDeviceRelationship(deviceEntity));
  });
}

async function syncAlertFindings(
  context: IntegrationStepExecutionContext<CarbonBlackIntegrationConfig>,
  provider: CbDefenseClient,
) {
  const { jobState, executionHistory } = context;
  const alertsSinceDate = determineAlertsSinceDate(
    executionHistory.lastSuccessful?.startedOn,
  );
  await provider.iterateAlerts(async (alert) => {
    const findingEntity = (await jobState.addEntity(
      createAlertFindingEntity(alert),
    )) as AlertFindingEntity;
    await jobState.addRelationship(
      createDeviceSensorAlertFindingRelationship(findingEntity),
    );
  }, alertsSinceDate);
}

function determineAlertsSinceDate(
  lastSuccessStartTime: number | undefined,
): Date {
  if (lastSuccessStartTime) {
    return new Date(lastSuccessStartTime);
  } else {
    const fiveDaysMs = 1000 * 60 * 60 * 24 * 5;
    return new Date(Date.now() - fiveDaysMs);
  }
}

export const synchronizeStep: Step<
  IntegrationStepExecutionContext<CarbonBlackIntegrationConfig>
> = {
  id: StepIds.SYNCHRONIZE,
  name: 'Synchronize',
  entities: [
    Entities.ACCOUNT,
    Entities.SERVICE,
    Entities.DEVICE_SENSOR,
    Entities.ALERT,
  ],
  relationships: [
    Relationships.ACCOUNT_HAS_SERVICE,
    Relationships.ACCOUNT_HAS_SENSOR,
    Relationships.SENSOR_IDENTIFIED_ALERT,
  ],
  mappedRelationships: [MappedRelationships.DEVICE_SENSOR_PROTECTS_DEVICE],
  executionHandler: synchronize,
};
