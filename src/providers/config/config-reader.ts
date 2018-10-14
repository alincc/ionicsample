import {Environments} from "./environments";
import {ENVIRONMENT} from "../../environment";
import * as DefaultConfig from "../../config/defaults.json";
import * as ProductionConfig from "../../config/production.json";
import * as StagingConfig from "../../config/staging.json";
import * as DevConfig from "../../config/dev.json";
import {ConfigInterface} from "./config-class";

let finalConfig;

export function readConfig(): ConfigInterface {
  if (!finalConfig) {
    let envConfig;
    finalConfig = {};
    switch (ENVIRONMENT) {
      case Environments.Production:
        envConfig = ProductionConfig;
        break;
      case Environments.Staging:
        envConfig = StagingConfig;
        break;
      case Environments.Development:
        envConfig = DevConfig;
        break;
    }

    for (let key in DefaultConfig) {
      finalConfig[key] = DefaultConfig[key];
    }
    for (let key in envConfig) {
      finalConfig[key] = envConfig[key];
    }
  }

  return finalConfig as ConfigInterface;

}
