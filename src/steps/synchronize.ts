import { Entity, IntegrationStepExecutionContext, Step } from "@jupiterone/integration-sdk-core";
import CbDefenseClient from "../CbDefenseClient";
import { StepIds } from "../constants";
import { createAccountDeviceSensorRelationship, createAccountEntity, createAccountServiceRelationship, createAlertFindingEntity, createDeviceSensorAlertFindingRelationship, createDeviceSensorEntity, createServiceEntity, mapSensorToDeviceRelationship } from "../converters";
import { CarbonBlackIntegrationConfig } from "../types";

async function synchronize(
  context: IntegrationStepExecutionContext<CarbonBlackIntegrationConfig>,
) {
  const { jobState } = context;
  const provider = new CbDefenseClient(context.instance.config, context.logger);

  const accountData = await provider.getAccountDetails();
  const accountEntity = await jobState.addEntity(createAccountEntity(accountData));
  const serviceEntity = await jobState.addEntity(createServiceEntity(accountData.site,accountData.organization_id));
  await jobState.addRelationship(createAccountServiceRelationship(accountEntity, serviceEntity));


  await syncDeviceSensors(context, provider, accountEntity);
  await syncAlertFindings(context, provider);
}

async function syncDeviceSensors(
  context: IntegrationStepExecutionContext<CarbonBlackIntegrationConfig>,
  provider: CbDefenseClient,
  accountEntity: Entity,
) {
  const { jobState } = context;

  await provider.iterateDevices(async device => {
    const deviceEntity  = await jobState.addEntity(createDeviceSensorEntity(device));
    await jobState.addRelationship(createAccountDeviceSensorRelationship(accountEntity, deviceEntity));
    await jobState.addRelationship(mapSensorToDeviceRelationship(deviceEntity));
  });
}

async function syncAlertFindings(
  context: IntegrationStepExecutionContext<CarbonBlackIntegrationConfig>,
  provider: CbDefenseClient,
) {
  const { jobState, executionHistory } = context;
  const alertsSinceDate = await determineAlertsSinceDate(executionHistory.lastSuccessful?.startedOn);
  await provider.iterateAlerts(async alert => {
    const findingEntity = await jobState.addEntity(createAlertFindingEntity(alert));
    await jobState.addRelationship(createDeviceSensorAlertFindingRelationship(findingEntity));
  }, alertsSinceDate);
}

async function determineAlertsSinceDate(
  lastSuccessStartTime: number | undefined,
): Promise<Date> {
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
entities: [],
relationships: [],
executionHandler: synchronize,
};
