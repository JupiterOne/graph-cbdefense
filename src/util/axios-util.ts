import Axios, * as axios from "axios";
// import * as axios from 'axios';
// import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { IntegrationLogger } from "@jupiterone/jupiter-managed-integration-sdk";

export function serializeAxiosRequestConfig(config: axios.AxiosRequestConfig) {
  return {
    // auth: config.auth, // <-- Turn on for local development?
    // data: config.data, // <-- Turn on for local development?
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    headers: config.headers,
  };
}

export function serializeAxiosResponse(response: axios.AxiosResponse) {
  return {
    // data: response.data,
    statusCode: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };
}

function serializeAxiosError(err: axios.AxiosError) {
  const response = err.response as axios.AxiosResponse;
  return {
    message: err.message,
    name: err.name,
    stack: err.stack,
    request: serializeAxiosRequestConfig(response.config),
    response: serializeAxiosResponse(response),
  };
}

export function createInstance(
  instanceConfig: axios.AxiosRequestConfig,
  logger: IntegrationLogger,
) {
  const instance = Axios.create(instanceConfig);

  instance.interceptors.request.use(
    (config: axios.AxiosRequestConfig) => {
      logger.debug(
        {
          // config: serializeAxiosRequestConfig(instanceConfig),
          request: serializeAxiosRequestConfig(config),
        },
        "axios request",
      );
      return config;
    },
    err => {
      logger.error(
        {
          err: serializeAxiosError(err),
        },
        "axios request error",
      );
      throw err;
    },
  );

  instance.interceptors.response.use(
    (response: axios.AxiosResponse) => {
      logger.debug(
        {
          // config: serializeAxiosRequestConfig(instanceConfig),
          // request: serializeAxiosRequestConfig(response.config),
          response: serializeAxiosResponse(response),
        },
        "axios response",
      );
      return response;
    },
    err => {
      logger.error(
        {
          response: err.response,
          message: err.message,
        },
        "axios response error",
      );
      throw err;
    },
  );

  return instance;
}
