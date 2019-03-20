import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk";
import CbDefenseClient from "./CbDefenseClient";
import { CbDefenseExecutionContext } from "./types";

export default function initializeContext(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
): CbDefenseExecutionContext {
  return {
    ...context,
    ...context.clients.getClients(),
    provider: new CbDefenseClient(context.instance.config, context.logger),
  };
}
