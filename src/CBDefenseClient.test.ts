import { Recording, setupRecording } from '@jupiterone/integration-sdk-testing';
import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import CbDefenseClient from './CbDefenseClient';

const config = {
  site: process.env.SITE || 'prod05',
  connectorId: process.env.CONNECTOR_ID || 'test',
  orgKey: process.env.ORG_KEY || 'test',
  apiKey: process.env.API_KEY || 'test',
};
const client = new CbDefenseClient(config, createMockIntegrationLogger());
const cbUrl = `https://defense-${config.site}.conferdeploy.net/appservices/v6/orgs/${config.orgKey}`;

describe('CbDefenseClient', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  test('iterateAlerts handles 500 error', async () => {
    recording = setupRecording({
      directory: __dirname,
      name: 'iterateAlertsHandles500Error',
      options: {
        recordFailedRequests: true,
      },
    });
    recording.server
      .post(`${cbUrl}/alerts/_search`)
      .intercept((_: any, res: any) => {
        res.setHeaders({
          'Content-Type': 'application/json',
        });
        res.sendStatus(500);
      });
    try {
      await client.iterateAlerts(
        () => Promise.resolve(),
        new Date('2021-05-01'),
      );
    } catch (e) {
      fail(e);
    }
  });

  test('iterateAlerts fails with 404 error', async () => {
    recording = setupRecording({
      directory: __dirname,
      name: 'iterateAlertsFails404Error',
      options: {
        recordFailedRequests: true,
      },
    });
    recording.server
      .post(`${cbUrl}/alerts/_search`)
      .intercept((_: any, res: any) => {
        res.setHeaders({
          'Content-Type': 'application/json',
        });
        res.sendStatus(404);
      });
    try {
      await client.iterateAlerts(
        () => Promise.resolve(),
        new Date('2021-05-01'),
      );
    } catch (e) {
      expect(e.code).toBe('CB_DEFENSE_CLIENT_API_404_ERROR');
    }
  });

  test('iterateDevices handles 500 error', async () => {
    recording = setupRecording({
      directory: __dirname,
      name: 'iterateDevicesHandles500Error',
      options: {
        recordFailedRequests: true,
      },
    });
    recording.server
      .post(`${cbUrl}/devices/_search`)
      .intercept((_: any, res: any) => {
        res.setHeaders({
          'Content-Type': 'application/json',
        });
        res.sendStatus(500);
      });
    try {
      await client.iterateDevices(() => Promise.resolve());
    } catch (e) {
      fail(e);
    }
  });

  test('iterateDevices fails with 404 error', async () => {
    recording = setupRecording({
      directory: __dirname,
      name: 'iterateDevicesFails404Error',
      options: {
        recordFailedRequests: true,
      },
    });
    recording.server
      .post(`${cbUrl}/devices/_search`)
      .intercept((_: any, res: any) => {
        res.setHeaders({
          'Content-Type': 'application/json',
        });
        res.sendStatus(404);
      });
    try {
      await client.iterateDevices(() => Promise.resolve());
    } catch (e) {
      expect(e.code).toBe('CB_DEFENSE_CLIENT_API_404_ERROR');
    }
  });
});
