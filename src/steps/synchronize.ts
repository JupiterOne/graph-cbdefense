import {
  Entity,
  IntegrationError,
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import CbDefenseClient from '../CbDefenseClient';
import {
  Entities,
  MappedRelationships,
  Relationships,
  SetDataKeys,
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

async function getAccount(
  context: IntegrationStepExecutionContext<CarbonBlackIntegrationConfig>,
) {
  const { jobState } = context;
  const provider = new CbDefenseClient(context.instance.config, context.logger);

  const accountData = await provider.getAccountDetails();
  const accountEntity = await jobState.addEntity(
    createAccountEntity(accountData),
  );
  await jobState.setData(SetDataKeys.ACCOUNT, accountEntity);
  const serviceEntity = await jobState.addEntity(
    createServiceEntity(accountData.site, accountData.organization_id),
  );
  await jobState.addRelationship(
    createAccountServiceRelationship(accountEntity, serviceEntity),
  );
}

async function syncDeviceSensors(
  context: IntegrationStepExecutionContext<CarbonBlackIntegrationConfig>,
) {
  const { jobState } = context;
  const accountEntity = await jobState.getData<Entity>(SetDataKeys.ACCOUNT);
  if (!accountEntity) {
    throw new IntegrationError({
      code: 'MISSING_ACCOUNT_ENTITY',
      message:
        'Could not synchronize device sensors - account entity not found.',
    });
  }
  const provider = new CbDefenseClient(context.instance.config, context.logger);

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
) {
  const { jobState, executionHistory } = context;
  const provider = new CbDefenseClient(context.instance.config, context.logger);

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

export const integrationSteps: Step<
  IntegrationStepExecutionContext<CarbonBlackIntegrationConfig>
>[] = [
  {
    id: StepIds.ACCOUNT,
    name: 'Get Account',
    entities: [Entities.ACCOUNT, Entities.SERVICE],
    relationships: [Relationships.ACCOUNT_HAS_SERVICE],
    executionHandler: getAccount,
  },
  {
    id: StepIds.DEVICE_SENSORS,
    name: 'Fetch Device Sensors',
    entities: [Entities.DEVICE_SENSOR],
    relationships: [Relationships.ACCOUNT_HAS_SENSOR],
    mappedRelationships: [MappedRelationships.DEVICE_SENSOR_PROTECTS_DEVICE],
    dependsOn: [StepIds.ACCOUNT],
    executionHandler: syncDeviceSensors,
  },
  {
    id: StepIds.ALERT_FINDINGS,
    name: 'Fetch Device Sensors',
    entities: [Entities.ALERT],
    relationships: [Relationships.SENSOR_IDENTIFIED_ALERT],
    dependsOn: [StepIds.DEVICE_SENSORS],
    executionHandler: syncAlertFindings,
  },
];
