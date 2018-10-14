export default function notificationIcon(type: string) {
  switch (type) {
    case "Chats":
      return "chatbubbles";
    case "EventInvitationSent":
    case "EventInvitationAccepted":
    case "EventInvitationRejected":
    case "EventInvitationConfirmed":
    case "EventInvitationCancelled":
    case "EventCreated":
    case "EventCancelled":
    case "EventChanged":
      return "calendar";
    default:
      return "notifications";
  }
}
