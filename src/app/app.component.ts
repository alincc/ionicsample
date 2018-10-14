// pidge
import {Component, ViewChild} from "@angular/core";
import {AlertController, App, Nav, Platform} from "ionic-angular";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {Deeplinks} from '@ionic-native/deeplinks';
import {FirebaseNotifications} from "../providers/services/firebase-notification";
import {LoadingPage} from "../pages/loading/loading";
import {AUTH_OBSERVED_ACTION_LOGIN, AuthObservedAction, AuthService} from "../providers/pidge-client/auth-service";
import {UserInterface} from "../models/user";
import {HomePage} from "../pages/home/home";
import {CloudDeploy} from "../providers/services/cloud-deploy";
import {AboutPage} from "../pages/about/about";
import {timezoneOffsetString} from "../shared/time";
import {LoadingStacker} from "../providers/stacker/loading-stacker";
import {AnalyticsLogger} from "../providers/services/analytics-logger";
import {ChangePasswordPage} from "../pages/change-password/change-password";
import {LoginPage} from "../pages/login/login";
import {ProfileImageProcessor} from "../providers/services/profile-image-processor";
import {UserService} from "../providers/pidge-client/user-service";
import { NotificationService } from './../providers/pidge-client/notification-service';

import {StandardResponseAlert} from "../providers/services/standard-response-alert";
import {JoinTeamWithUrlPage} from "../pages/join-team-with-url/join-team-with-url";
@Component({
  templateUrl: "app.html",
})
export class MyApp {

  @ViewChild(Nav) navCtrl: Nav;

  protected rootPage: any = LoadingPage;
  protected user: UserInterface;
  protected notificationId;
  protected pages: PageInterface[] = [
    // {title: 'My Account', icon: 'contact', component: 'AccountPage'},
    // {title: 'Settings', icon: 'settings', component: 'SettingsPage'},
  ];

  constructor(protected platform: Platform,
              protected deeplinks: Deeplinks,
              protected statusBar: StatusBar,
              protected splashScreen: SplashScreen,
              protected authService: AuthService,
              protected cloudDeploy: CloudDeploy,
              protected loadingStacker: LoadingStacker,
              protected analytics: AnalyticsLogger,
              protected alertCtrl: AlertController,
              protected app: App,
              protected userService: UserService,
              protected notificationService:NotificationService,
              protected profileProcessor: ProfileImageProcessor,
              protected standardAlert: StandardResponseAlert,
              protected firebaseNotification: FirebaseNotifications) {

    //if the platform became ready to run
    this.platform.ready().then(() => {
      if (this.platform.is("ios"))
        this.firebaseNotification.initializeFirebaseIOS();
      // listen to notification.
      this.firebaseNotification.subscribeToPushNotifications(data => {
       if(data.notification_id!=undefined){
         this.notificationId=data.notification_id;
         this.getNotificationDetail(this.notificationId);
     }    
      });

      // hide the splash, and other UI changes
      this.changeUiToReady();
      //prepare google analytics
      this.prepareAnalytics();
      //if it is a native mobile app, check for updates, and register for push notifications
      this.prepareNativeFeatures();
      //check if user is already authenticated, and log them in, or display the register/login page
      this.tryToLoginLastUser();
      //we get the device token at the beginning of the app run
      if (this.platform.is("cordova")) {
        this.DeepLinking();
        //we wait until the user is logged in, then we send the token to the server
        this.firebaseNotification.initializeFirebaseAndroid(token => this.authService.subscribe(loginEvent => loginEvent.loggedIn ? this.userService.senPushNotification(token, this.platform._platforms[2]).then(res => {
        }) : this.userService.senPushNotification('', this.platform._platforms[2])))
      }
    });


  }
  protected getNotificationDetail(notificationId)
  {
    Promise.resolve(this.notificationService.getNotificationDetail(notificationId))
    .then(result=>{this.notificationNavigate(result.type,result.related_team_event_invitation_id,result.related_team_id)})
  }
  protected notificationNavigate(eventType:string,invitationId:number,TeamId:number)
  {
     Promise.resolve(this.notificationService.notificationRedirectPage(eventType))
        .then(result=>{
        
        if(result=="ChatsPage")
        {

          this.navCtrl.push(result,{'chat':TeamId});

        }
        else if(result=="EventPage")
        {
          
          this.navCtrl.push(result,{'invitation':invitationId});

        }
        })
  }
  protected changeUiToReady() {
    this.statusBar.styleDefault();
    this.splashScreen.hide();
  }

  protected prepareNativeFeatures() {
    if (this.platform.is("cordova")) {
      //this.preparePush();

      setTimeout(() => this.cloudDeploy.checkUpdate().then(() => setInterval(() => this.cloudDeploy.checkUpdate(), 1800000)), 5000);
    }
  }

  protected DeepLinking() {
    this.deeplinks.routeWithNavController(this.navCtrl, {
      '/public-url/:urlKey': JoinTeamWithUrlPage,
    }).subscribe((match) => {
      // match.$route - the route we matched, which is the matched entry from the arguments to route()
      // match.$args - the args passed in the link
      // match.$link - the full link data
    }, (nomatch) => {
      // nomatch.$link - the full link data
      console.error('Got a deeplink that didn\'t match', nomatch);
    });
  }

  protected tryToLoginLastUser() {
    let firstTimeLoad: boolean = true;
    this.authService.subscribe((event: AuthObservedAction) => Promise.resolve(this.user = event.user)
      .then(() => event.action != AUTH_OBSERVED_ACTION_LOGIN ? null : (!this.user || this.user['email_verified'] ? null : this.standardAlert.showInfo("Email verification required", [{
        text: "Resend Verification Email",
        role: "cancel",
        handler: () => {
          Promise.resolve(this.loadingStacker.add())
            .then(() => this.authService.resendVerificationEmail(this.user.email))
            .then(() => this.standardAlert.showSuccess("Message has been sent"))
            .catch(e => this.standardAlert.showError(e))
            .then(() => this.loadingStacker.pop());

        }
      }], {
        title: "Please verify your email",
        message: "Email verification is required to keep your account active. Please follow the link we sent to your account to guarantee the continuity of our service."
      })))
      .then(() => !this.user && !firstTimeLoad ? this.app.getRootNav().setRoot(LoadingPage).then(() => this.displayNextPage()) : null)
    );
    this.authService.retrieveCurrentUser()
      .then(user => {
        this.displayHomePage(user);
        if(this.notificationId){this.getNotificationDetail(this.notificationId);} 
      })
      .then(() => firstTimeLoad = false)
      .catch(e => this.displayNextPage());
  }

  protected displayHomePage(user: UserInterface) {
    this.displayNextPage(HomePage);
  }

  protected displayLoginPage() {
    this.displayNextPage(LoginPage);
  }

  protected displayNextPage(page = null) {
    LoadingPage.loadedChange(true, page);
  }

  protected displayAboutPage() {
    return this.openPage({title: "About", component: AboutPage});
  }

  protected logout() {
    this.loadingStacker.add("Logging out");
    this.authService.logout()
      .then(() => this.app.getRootNav().setRoot(LoadingPage, {skipAnimation: true}))
      .then(() => this.displayNextPage())
      .then(() => this.loadingStacker.pop());
  }

  protected openPage(page: PageInterface) {
    return this.navCtrl.push(page.component);
  }

  protected timezoneOffset() {
    return timezoneOffsetString();
  }

  protected prepareAnalytics() {
    this.analytics.ga();
  }

  protected changePhoto() {
    return this.profileProcessor.changePhoto()
      .then(res => res ? this.savePhoto(res) : null)
      .catch(e => null);
  }

  protected savePhoto(image: string) {
    Promise.resolve(this.loadingStacker.add("Saving"))
      .then(() => this.userService.savePhoto(image))
      .catch(err => console.error(err))
      .then(() => this.loadingStacker.pop());
  }

  protected changePassword() {
    this.navCtrl.push(ChangePasswordPage);
  }

}

interface PageInterface {
  title: string;
  component: any;
  icon?: string;
}

