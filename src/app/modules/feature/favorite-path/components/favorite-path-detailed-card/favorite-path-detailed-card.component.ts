import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {RideInfo} from "../../../../shared/models/RideInfo";
import {FavoritePathInfo} from "../../models/FavoritePathInfo";

@Component({
  selector: 'app-favorite-path-detailed-card',
  templateUrl: './favorite-path-detailed-card.component.html',
  styleUrls: ['./favorite-path-detailed-card.component.css']
})
export class FavoritePathDetailedCardComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public path: FavoritePathInfo) {
  }

  dateToString(date:Date):string{
    let dateString=date.toString().split(",");
    return [dateString[2], dateString[1], dateString[0]].join(".")+". "+[dateString[3],dateString[4]].join(":");
  }
  padTo2Digits(num:number) {
    return num.toString().padStart(2, '0');
  }
}
