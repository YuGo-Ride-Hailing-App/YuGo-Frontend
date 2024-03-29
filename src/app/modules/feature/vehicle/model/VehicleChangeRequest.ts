import {UserInfo} from "../../../shared/models/UserInfo";
import {Vehicle} from "../../../shared/models/Vehicle";

export interface VehicleChangeRequest {
  id: number;
  driver: UserInfo;
  oldVehicle: Vehicle;
  newVehicle: Vehicle;
  dateCreated: Date;
}
