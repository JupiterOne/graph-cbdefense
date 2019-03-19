import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import initializeContext from "./initializeContext";

test("creates provider client", () => {
  const executionContext = createTestIntegrationExecutionContext({
    instance: {
      config: {
        site: "prod05",
        connectorId: "test",
        apiKey: "test",
      },
    },
  });
  const integrationContext = initializeContext(executionContext);
  expect(integrationContext.provider).toBeDefined();
});
