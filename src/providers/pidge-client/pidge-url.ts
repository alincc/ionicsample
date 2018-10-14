import {config} from "../config/config";
import {ApiVersion} from "../config/config-class";

export class PidgeURL {

  public static url(path: string, params: { [key: string]: any } = {}, version: ApiVersion = null, newFormat: boolean = false): string {
    version = version || config.api_version;
    let done = {};
    let queryData = {};
    let url: string = path
      .replace(/\{([a-zA-Z0-9_]+)\}/g, (all, key) => {
        done[key] = true;
        return params.hasOwnProperty(key) && params[key] !== null ? params[key] : key;
      })
      .replace(/\[([a-zA-Z0-9_]+)\]/g, (all, key) => {
        done[key] = true;
        return params.hasOwnProperty(key) && params[key] !== null ? params[key] : "";
      })
      .replace(new RegExp(/\/{2,}/), "/")
      .replace(new RegExp(/\/+$/), "");
    url = config.base_url + (newFormat ? "" : "v" + version + "/") + (path.substr(0, 1) === "/" ? url.substr(1) : url);
    if (newFormat) {
      queryData['api_version'] = version;
    }
    for (let key in params) {
      if (!done.hasOwnProperty(key)) {
        queryData[key] = params[key];
      }
    }
    let query = "?";
    let index = 0;
    for (let i in queryData) {
      index++;
      let param = i;
      let value = queryData[i];
      if (index == 1) {
        query += param + "=" + encodeURIComponent(value);
      } else {
        query += "&" + param + "=" + encodeURIComponent(value);
      }
    }
    return url + query;
  }

}

export function pidgeApiUrl(path: string, params: { [key: string]: any } = {}, apiVersion: ApiVersion = null, newFormat: boolean = false): string {
  return PidgeURL.url(path, params, apiVersion, newFormat);
}
