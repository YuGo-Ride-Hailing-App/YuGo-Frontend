import {Component, Input, OnInit, SecurityContext} from '@angular/core';
import {DriverService} from "../../../../shared/services/driver.service";
import {PassengerService} from "../../../../shared/services/passenger.service";
import {MatDialog} from "@angular/material/dialog";
import {FavoritePathInputComponent} from "../favorite-path-input/favorite-path-input.component";
import {DomSanitizer} from "@angular/platform-browser";
import {ImageService} from "../../../../core/services/image.service";

@Component({
  selector: 'app-history-detailed-ride-card',
  templateUrl: './history-detailed-ride-card.component.html',
  styleUrls: ['./history-detailed-ride-card.component.css']
})
export class HistoryDetailedRideCardComponent implements OnInit{
  public icon = 'star_outlined';
  @Input() ride:any;
  @Input() historyPreview = true;
  public profilePicture: any;
  public driverProfilePicture: any;
  public passengersProfilePics:Array<any>;
  driverName="";
  passengerName="";

  constructor(private _sanitizer: DomSanitizer,private _imageService: ImageService,private driverService:DriverService,
              public dialog: MatDialog, private passengerService: PassengerService) {
    this.passengersProfilePics=[];
  }
  ngOnInit(){
    this.getDriver();
    this.getPassenger();
    this.getPassengers();
  }

  public changeIcon(){
    if (this.icon==='star'){
      this.icon = 'star_outlined' ;
    }
    else{
      this.icon='star';
      this.dialog.open(FavoritePathInputComponent,{
          data: this.ride,
          width: '30%',
          backdropClass: 'backdropBackground'
        });
    }
  }

  getDriver(){
    this.driverService.getDriver(this.ride.driver.id).subscribe(
      {next:(driver) => {
          this.driverName= driver.name+" "+driver.surname;
          this._imageService.getProfilePicture(driver.profilePicture).then(resp => {
            const objectURL = URL.createObjectURL(resp);
            this.driverProfilePicture = this._sanitizer.bypassSecurityTrustUrl(objectURL);
          });
        }})
  }

  getPassenger(){
    this.passengerService.getPassenger(this.ride.passengers[0].id).subscribe(
      {next:(passenger) => {
          this.passengerName= passenger.name+" "+passenger.surname;
          this._imageService.getProfilePicture(passenger.profilePicture).then(resp => {
            const objectURL = URL.createObjectURL(resp);
            this.profilePicture = this._sanitizer.bypassSecurityTrustUrl(objectURL);
          });
        }})
  }
  getPassengers(){
    for (let i = 0; i < this.ride.passengers.length; i++) {
      this.passengerService.getPassenger(this.ride.passengers[i].id).subscribe(
        {
          next: (passenger) => {
            this.passengerName = passenger.name + " " + passenger.surname;
            this._imageService.getProfilePicture(passenger.profilePicture).then(resp => {
              const objectURL = URL.createObjectURL(resp);
              const dto={picture:this._sanitizer.bypassSecurityTrustUrl(objectURL),name:(passenger.name+" "+passenger.surname+"\n"+passenger.email + "\n" + passenger.telephoneNumber)};
              this.passengersProfilePics.push(dto);

            });
          }
        })
    }
  }

  sanitize(profilePic:any):any{
    return this._sanitizer.sanitize(SecurityContext.HTML,this._sanitizer.bypassSecurityTrustHtml(profilePic));

  }
  onProfilePictureError(event : any) {
    event.target.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
  }

}
