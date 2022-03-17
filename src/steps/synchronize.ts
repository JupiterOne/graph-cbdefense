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
  createAccountDeviceSensorRelationship,
  createAccountEntity,
  createAccountServiceRelationship,
  createAlertFindingEntity,
  createDeviceSensorAlertFindingRelationship,
  createDeviceSensorEntity,
  createServiceEntity,
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
  const { jobState, logger, instance } = context;
  const accountEntity = await jobState.getData<Entity>(SetDataKeys.ACCOUNT);
  if (!accountEntity) {
    throw new IntegrationError({
      code: 'MISSING_ACCOUNT_ENTITY',
      message:
        'Could not synchronize device sensors - account entity not found.',
    });
  }

  const provider = new CbDefenseClient(instance.config, context.logger);

  await provider.iterateDevices(async (device) => {
    const deviceEntity = createDeviceSensorEntity(instance.config.site, device);

    // NOTE: It seems that it's possible for the same CB device to be returned
    // from the API multiple times. It's not immediately clear why that is.
    // Perhaps CB keeps records of every deregistered device and keeps separate
    // records of when the device is registered later.
    if (await jobState.hasKey(deviceEntity._key)) {
      logger.info(
        {
          _key: deviceEntity._key,
          status: device.status,
        },
        'Duplicate device key found',
      );
      return;
    }

    await jobState.addEntity(deviceEntity);
    await jobState.addRelationship(
      createAccountDeviceSensorRelationship(accountEntity, deviceEntity),
    );
    await jobState.addRelationship(mapSensorToDeviceRelationship(deviceEntity));
  });
}

async function syncAlertFindings(
  context: IntegrationStepExecutionContext<CarbonBlackIntegrationConfig>,
) {
  const { logger, jobState, executionHistory, instance } = context;
  const provider = new CbDefenseClient(instance.config, context.logger);

  const alertsSinceDate = determineAlertsSinceDate(
    executionHistory.lastSuccessful?.startedOn,
  );
  await provider.iterateAlerts(async (alert) => {
    const alertFindingEntity = createAlertFindingEntity(
      instance.config.site,
      alert,
    );

    // NOTE: It seems that it's possible for the same CB device to be returned
    // from the API multiple times. It's not immediately clear why that is.
    if (await jobState.hasKey(alertFindingEntity._key)) {
      logger.info(
        {
          _key: alertFindingEntity._key,
        },
        'Duplicate alert key found',
      );
      return;
    }

    await jobState.addEntity(alertFindingEntity);
    await jobState.addRelationship(
      createDeviceSensorAlertFindingRelationship(alertFindingEntity),
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
