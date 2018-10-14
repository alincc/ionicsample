import {Injectable} from '@angular/core';
import {AuthService} from "./auth-service";
import {PidgeApiService} from "./pidge-api-service";
import {Chat, TeamInterface} from "../../models/chat";
import {Event, EventInterface} from "../../models/event";
import {Standardize} from "./standardize";
import {EventInvitationInterface} from "../../models/event-invitation";
import {pidgeApiUrl} from "./pidge-url";
import {RegularEvent, RegularEventInterface} from "../../models/regular-event";
import {GenericScheduleInterface} from "../../models/generic-schedule-interface";

//URL consts
const CHAT_EVENTS = "chats/{chat}/events";
const CHAT_EVENT_URL = "chats/{chat}/events/{event}";
const RESPONSE_TO_INVITATION_URL = "events/{event}/invitations/{invitation}";
const RESPONSE_TO_INVITATION_ACCEPTANCE_URL = "schedules/invitations/{invitation}";
const MY_EVENTS_URL = "user/events";
const AFFILIATE_SCHEDULES = "affiliates/{affiliate}/schedules";//new
const AFFILIATE_SCHEDULE = "affiliates/{affiliate}/schedules/{event}";//new

@Injectable()
export class EventService {

  constructor(protected authService: AuthService,
              protected apiService: PidgeApiService) {
  }

  protected callApis(method, url, data = {}, headers = {}) {
    return new Promise((resolve, reject) => {
      if (['put', 'post'].indexOf(method.toLowerCase()) > -1) {
        this.apiService[method](this.authService.currentUser, url, data, headers)
          .then((response) => resolve(response), error => reject(error))
          .catch(error => reject(error));
      } else {
        this.apiService[method](this.authService.currentUser, url, headers)
          .then((response) => resolve(response), error => reject(error))
          .catch(error => reject(error));
      }
    });
  }

  public eventInfo(chatUqid: String, eventUqid: String): Promise<Event> {
    let url = pidgeApiUrl(CHAT_EVENT_URL, {
      chat: chatUqid,
      event: eventUqid
    });
    return this.callApis('get', url)
      .then((event: EventInterface) => {
        return Standardize.event(event);
      });
  }

  public createEvent(chat: TeamInterface, eventData: EventInterface): Promise<Event> {
    let url = pidgeApiUrl(CHAT_EVENTS, {chat: chat.uqid});
    return this.callApis('post', url, eventData)
      .then((event: EventInterface) => Standardize.event(event, Standardize.chat(chat)));
  }

  public updateEvent(chat: Chat, event: Event, data: { [key: string]: number | string | boolean | null }): Promise<Event> {
    let url = pidgeApiUrl(CHAT_EVENT_URL, {chat: chat.uqid, event: event.uqid});
    return this.callApis('put', url, data)
      .then((event: EventInterface) => Standardize.event(event, Standardize.chat(chat)));
  }

  public acceptEventInvitation(invitation: EventInvitationInterface) {
    let url = pidgeApiUrl(RESPONSE_TO_INVITATION_URL, {
      event: invitation.event.uqid,
      invitation: invitation.id
    });
    return this.callApis('put', url);
  }

  public rejectEventInvitation(invitation: EventInvitationInterface) {
    let url = pidgeApiUrl(RESPONSE_TO_INVITATION_URL, {
      event: invitation.event.uqid,
      invitation: invitation.id
    });
    return this.callApis('delete', url);
  }

  public confirmEventParticipation(invitation: EventInvitationInterface, position?: string) {
    let url = pidgeApiUrl(RESPONSE_TO_INVITATION_ACCEPTANCE_URL, {
      invitation: invitation.uqid
    }, '1', true);
    return this.callApis('put', url, {position});
  }

  public cancelEventParticipation(invitation: EventInvitationInterface) {
    let url = pidgeApiUrl(RESPONSE_TO_INVITATION_ACCEPTANCE_URL, {
      invitation: invitation.uqid
    }, '1', true)
    return this.callApis('delete', url)
      .then(()=>this.eventsList());
  }

  public eventsList() {
    let url = pidgeApiUrl(MY_EVENTS_URL, {});
    return this.callApis('get', url);
  }

  /**
   * This is the new one.
   * @param {String} affiliateUqid
   * @param {String} eventUqid
   * @returns {Promise<Event | RegularEvent>}
   */
  public scheduleInfo(affiliateUqid: String, eventUqid: String): Promise<Event | RegularEvent> {
    //@TODO:use this one and replace eventInfo() with it
    let url = pidgeApiUrl(AFFILIATE_SCHEDULE, {
      affiliate: affiliateUqid,
      event: eventUqid
    }, "1", true);
    return this.callApis('get', url)
      .then((event: EventInterface | RegularEventInterface) => {
        let chat = Standardize.chat(event.chat);
        return event.hasOwnProperty('team_regular_event_id') ? Standardize.event(event as EventInterface, chat, Standardize.regularEvent(event as RegularEventInterface, chat)) : Standardize.regularEvent(event as RegularEventInterface, chat);
      });
  }

  public createSchedule(eventData: GenericScheduleInterface): Promise<any> {
    var url = pidgeApiUrl(AFFILIATE_SCHEDULES, {affiliate: eventData.team_uqid}, "1", true);
    return this.callApis("post",
      url,
      {
        title: eventData.name,
        geolocation: "", //@TODO: add geolocation
        type: eventData.type,
        note: eventData.note,
        address: eventData.location,
        date: eventData.date,
        repeat: eventData.repeat,
        end_date: eventData.stopRepeatingDate,
        team_uqid: eventData.team_uqid
      },
      {})
      .then((data: EventInterface | RegularEventInterface) => !(data.hasOwnProperty('team_regular_event_id')) ? Standardize.regularEvent(data as RegularEventInterface) : Standardize.event(data as EventInterface));
  }

  public updateSchedule(eventData: GenericScheduleInterface): Promise<any> {
    var url = pidgeApiUrl(AFFILIATE_SCHEDULE, {affiliate: eventData.team_uqid, event: eventData.uqid}, "1", true);
    return this.callApis("put",
      url,
      {
        title: eventData.name,
        geolocation: "", //@TODO: add geolocation
        type: eventData.type,
        note: eventData.note,
        address: eventData.location,
        date: eventData.date,
        repeat: eventData.repeat,
        end_date: eventData.stopRepeatingDate,
        team_uqid: eventData.team_uqid,
        regular_uqid: eventData.regular_uqid
      },
      {});
  }

  public removeSchedule(team: Chat, event: RegularEvent | Event, cascade: boolean) {
    var url = pidgeApiUrl(AFFILIATE_SCHEDULE, {affiliate: team.uqid, event: event.uqid, cascade}, "1", true);
    return this.callApis("delete", url, {cascade}, {});
  }

}
