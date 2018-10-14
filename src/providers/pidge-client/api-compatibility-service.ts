import {Injectable} from "@angular/core";
import {PidgeApiService} from "./pidge-api-service";
import {Subject} from "rxjs/Subject";
import {Chat} from "../../models/chat";
import {config} from "../config/config";

const API_BASE_URL: string = "/";

@Injectable()
export class ApiCompatibilityService {

  protected observableInstance: Subject<Chat[]>;

  public constructor(protected apis: PidgeApiService) {

    this.observableInstance = new Subject();

  }

  public checkApiCompatibility(): Promise<boolean> {
    return this.apis.publicPost(API_BASE_URL, null, {version: config.api_version})
      .then(response => !!response.isSupported);
  }

}
