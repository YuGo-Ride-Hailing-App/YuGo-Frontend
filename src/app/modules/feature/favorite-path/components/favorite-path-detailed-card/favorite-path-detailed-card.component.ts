import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {FavoritePathInfo} from "../../models/FavoritePathInfo";
import {FavoritePathService} from "../../../../shared/services/favorite.path.service";

@Component({
  selector: 'app-favorite-path-detailed-card',
  templateUrl: './favorite-path-detailed-card.component.html',
  styleUrls: ['./favorite-path-detailed-card.component.css']
})
export class FavoritePathDetailedCardComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public path: FavoritePathInfo,private favoritePathService:FavoritePathService) {
  }

  dateToString(date:Date):string{
    const dateString=date.toString().split(",");
    return [dateString[2], dateString[1], dateString[0]].join(".")+". "+[dateString[3],dateString[4]].join(":");
  }
  padTo2Digits(num:number) {
    return num.toString().padStart(2, '0');
  }
  deletePath(){
    this.favoritePathService.deleteFavoritePath(this.path.id).subscribe({next:()=>{
        window.location.reload();
      }})

  }
  cleanUpLocation(location:string): string{
    if (location.includes(",")){
      const partialLocations=location.split(",");
      let result="";
      for (let i=0;i<partialLocations.length;i++){
        if (i<=2) {
          if (i === partialLocations.length - 1 || i===2)
            result = result + partialLocations[i];
          else
            result = result + partialLocations[i] + ", ";
        }
      }
      return result;
    }
    return location;
  }
}
