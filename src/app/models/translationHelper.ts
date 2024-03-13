import { ActivityName } from "./activityName";

export class TranslationHelper {
  activityDescription: string;

  constructor(private activityName: ActivityName) {
    this.activityDescription = this.getDatabaseString(this.activityName);
  }

  getDatabaseString(activity: ActivityName): string {
    switch (activity) {
      case ActivityName.LOGIN:
        return "login_string";
      case ActivityName.LOGOUT:
        return "logout_string";
      case ActivityName.CREATE_USER:
        return "create_user_string";

      default:
        return ""; // Return empty string for unknown activities
    }
  }
}

