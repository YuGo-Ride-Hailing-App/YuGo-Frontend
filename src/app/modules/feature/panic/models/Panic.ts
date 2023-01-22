import {UserInfo} from "../../../shared/models/UserInfo";
import {RideInfo} from "../../../shared/models/RideInfo";

export interface Panic {
  id: number
  user: UserInfo
  ride: RideInfo
  time: Date
  reason: String
}
