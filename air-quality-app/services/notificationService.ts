// import * as Notifications from "expo-notifications";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowBanner: true,
//     shouldShowList: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// export async function requestNotificationPermissions() {
//   const settings = await Notifications.getPermissionsAsync();

//   if (
//     settings.granted ||
//     settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
//   ) {
//     return true;
//   }

//   const request = await Notifications.requestPermissionsAsync();
//   return request.granted;
// }

// export async function showLocalAlertNotification(title: string, body: string) {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title,
//       body,
//     },
//     trigger: null,
//   });
// }
