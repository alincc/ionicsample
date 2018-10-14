import {BrowserModule} from "@angular/platform-browser";
import {enableProdMode, ErrorHandler, NgModule} from "@angular/core";
import {IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";
import {SplashScreen} from "@ionic-native/splash-screen";
import {StatusBar} from "@ionic-native/status-bar";
import { Firebase } from '@ionic-native/firebase';
import { Clipboard } from '@ionic-native/clipboard';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Deeplinks } from '@ionic-native/deeplinks';
import {MyApp} from "./app.component";
import {LoadingStacker} from "../providers/stacker/loading-stacker";
import {StackerFactory} from "../providers/stacker/stacker";
import {AuthService} from "../providers/pidge-client/auth-service";
import {HttpModule} from "@angular/http";
import {IonicStorageModule} from "@ionic/storage";
import {config} from "../providers/config/config";
import {CloudDeploy} from "../providers/services/cloud-deploy";
import {FirebaseNotifications} from "../providers/services/firebase-notification";
import {PushNotifications} from "../providers/services/push-notifications";
import {AppVersion} from "@ionic-native/app-version";
import {NotificationService} from '../providers/pidge-client/notification-service';
import {EventService} from "../providers/pidge-client/event-service";
import {PidgeApiService} from "../providers/pidge-client/pidge-api-service";
import {UserMetaInfoService} from "../providers/pidge-client/user-meta-info-service";
import {LoginPageModule} from "../pages/login/login.module";
import {LoadingPageModule} from "../pages/loading/loading.module";
import {HomePageModule} from "../pages/home/home.module";
import {AboutPageModule} from "../pages/about/about.module";
import {RegisterPageModule} from "../pages/register/register.module";
import {DashboardPageModule} from "../pages/dashboard/dashboard.module";
import {CalendarPickerPageModule} from "../pages/calendar-picker/calendar-picker.module";
import {ChatService} from "../providers/pidge-client/chat-service";
import {UserService} from "../providers/pidge-client/user-service";
import {SimpleStacker} from "../providers/stacker/simple-stacker";
import {ChatPageModule} from "../pages/chat/chat.module";
import {ChatCalendarPageModule} from "../pages/chat-calendar/chat-calendar.module";
import {ChatCreatePageModule} from "../pages/chat-create/chat-create.module";
import {EventEditPageModule} from "../pages/event-edit/event-edit.module";
import {ChatParticipantInfoPageModule} from "../pages/chat-participant-info/chat-participant-info.module";
import {ChatsPageModule} from "../pages/chats/chats.module";
import {AccountPageModule} from "../pages/account/account.module";
import {CreateEventPageModule} from "../pages/create-event/create-event.module";
import {CalendarPageModule} from "../pages/calendar/calendar.module";
import {UserEventsListService} from "../providers/pidge-client/user-event-list-service";
import {EventPageModule} from "../pages/event/event.module";
import {RegularEventPageModule} from "../pages/regular-event/regular-event.module";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {AnalyticsLogger} from '../providers/services/analytics-logger';
import {ApiCompatibilityService} from "../providers/pidge-client/api-compatibility-service";
import {Environments} from "../providers/config/environments";
import {EventFormPageModule} from "../pages/event-form/event-form.module";
import {Camera} from "@ionic-native/camera";
import {ForgotPasswordPageModule} from "../pages/forgot-password/forgot-password.module";
import {ChangePasswordPageModule} from "../pages/change-password/change-password.module";
import {AcceptInvitationPageModule} from "../pages/accept-invitation/accept-invitation.module";
import {InitPidge} from '../providers/services/init-pidge';
import { Contacts } from '@ionic-native/contacts';
import {DeviceContacts} from "../providers/services/DeviceContacts";
import {ProfileImageProcessor} from '../providers/services/profile-image-processor';
import {StandardResponseAlert} from '../providers/services/standard-response-alert';
import {FallbackImageFilePickerPageModule} from "../pages/fallback-image-file-picker/fallback-image-file-picker.module";
import {ListItemPickerPageModule} from "../pages/list-item-picker/list-item-picker.module";
import {ComponentsModule} from "../components/components.module";
import {StandardToast} from "../providers/services/standard-toast";
import {ContactListEmailPageModule} from "../pages/contact-list-email/contact-list-email.module";
import {JoinTeamWithUrlPageModule} from "../pages/join-team-with-url/join-team-with-url.module";
import { PendingInvitedMembersPageModule } from './../pages/pending-invited-members/pending-invited-members.module';
import { InvitationListPageModule } from './../pages/invitation-list/invitation-list.module';

if (config.environment === Environments.Production) {
  //if in production mode, enable production mode for angular.
  enableProdMode();
}

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp, {
      preloadModules: true,
      platforms: {
        ios: {
          scrollAssist: false,    // Valid options appear to be [true, false]
          autoFocusAssist: false  // Valid options appear to be ['instant', 'delay', false]
        }
      }
    }),

    ComponentsModule,
    AboutPageModule,
    ContactListEmailPageModule,
    JoinTeamWithUrlPageModule,
    AccountPageModule,
    CalendarPageModule,
    CalendarPickerPageModule,
    ChatPageModule,
    ChatCalendarPageModule,
    ChatCreatePageModule,
    EventEditPageModule,
    ChatParticipantInfoPageModule,
    ChatsPageModule,
    CreateEventPageModule,
    DashboardPageModule,
    EventPageModule,
    HomePageModule,
    LoadingPageModule,
    LoginPageModule,
    RegisterPageModule,
    RegularEventPageModule,
    EventFormPageModule,
    ForgotPasswordPageModule,
    ChangePasswordPageModule,
    AcceptInvitationPageModule,
    FallbackImageFilePickerPageModule,
    ListItemPickerPageModule,
    PendingInvitedMembersPageModule,
    InvitationListPageModule 

  ],
  bootstrap: [
    IonicApp
  ],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AppVersion,
    Firebase,
    Clipboard,
    SocialSharing,
    Deeplinks,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Contacts,
    DeviceContacts,
    LoadingStacker,
    SimpleStacker,
    StackerFactory,
    AuthService,
    CloudDeploy,
    FirebaseNotifications,
    PushNotifications,
    NotificationService,
    PidgeApiService,
    UserMetaInfoService,
    EventService,
    ChatService,
    UserService,
    UserEventsListService,
    AnalyticsLogger,
    GoogleAnalytics,
    ApiCompatibilityService,
    Camera,
    InitPidge,
    ProfileImageProcessor,
    StandardResponseAlert,
    StandardToast,
  ]
})
export class AppModule {
}
