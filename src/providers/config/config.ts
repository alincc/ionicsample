import {Config, ConfigInterface} from "./config-class";
import {readConfig} from "./config-reader";
import {ENVIRONMENT} from "../../environment";

let config: Config = new Config(readConfig() as ConfigInterface);
config.environment = ENVIRONMENT;
// ENVIRONMENT
export {config};
