import {Component, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FavoritePathService} from "../../../../shared/services/favorite.path.service";
import {RideInfo} from "../../../../shared/models/RideInfo";
import {Router} from "@angular/router";

@Component({
  selector: 'app-favorite-path-input',
  templateUrl: './favorite-path-input.component.html',
  styleUrls: ['./favorite-path-input.component.css']
})
export class FavoritePathInputComponent {

  ride:RideInfo;
  constructor(private favoritePathService:FavoritePathService,private dialogRef:MatDialogRef<FavoritePathInputComponent>, public dialog: MatDialog,@Inject(MAT_DIALOG_DATA) public data: any) {
  this.ride=data;
  }
  newPathForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  submitPath(){

      let favoritePath={
        "favoriteName":this.newPathForm.value.name,
        "locations":this.ride.locations,
        "passengers":this.ride.passengers,
        "vehicleType":this.ride.vehicleType,
        "babyTransport":this.ride.babyTransport,
        "petTransport":this.ride.petTransport
      };
      this.favoritePathService.addFavoritePath(favoritePath).subscribe({next:(result)=>{
          this.dialogRef.close();
        }});

  }

}
