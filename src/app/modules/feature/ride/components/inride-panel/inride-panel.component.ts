import {Component, Input, OnInit} from '@angular/core';
import {RideInfo} from "../../../../shared/models/RideInfo";
import {Observable} from "rxjs";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {PanicDialogComponent} from "../panic-dialog/panic-dialog.component";
import {RideService} from "../../services/ride.service";
import {ImageService} from "../../../../core/services/image.service";
import {UserSimpleInfo} from "../../../../shared/models/UserSimpleInfo";
import {PassengerService} from "../../../../shared/services/passenger.service";
import {DomSanitizer} from "@angular/platform-browser";
import {DriverService} from "../../../../shared/services/driver.service";

@Component({
  selector: 'app-inride-panel',
  templateUrl: './inride-panel.component.html',
  styleUrls: ['./inride-panel.component.css']
})
export class InridePanelComponent implements OnInit{
  progressBarHeight = "0%";
  departureAddress = "Bulevar oslobodjenja";
  destinationAddress = "Bulevar oslobodjenja 30"
  rideEstTime = "1hr 15min"
  rideLength = "55km"
  toolTipInfo = ""
  image:any;

  @Input() currentRide?:RideInfo;
  @Input() rideLengthKm?:number;
  @Input() distanceLeftChangedEvent?:Observable<number>;
  @Input() userType?:string;

  panicDialog?: MatDialogRef<PanicDialogComponent>;
  panicEnabled = true;

  constructor(private dialog: MatDialog,
              private rideService:RideService,
              private imageService:ImageService,
              private passengerService:PassengerService,
              private driverService:DriverService,
              private sanitizer: DomSanitizer) {
  }

  openPanicDialog(){
    this.panicDialog = this.dialog.open(PanicDialogComponent);
    this.panicDialog.afterClosed().subscribe(res => {
      if(res != undefined){
        if(this.rideService.currentRide!=null) {
          const rideID: number = this.rideService.currentRide.id;
          this.rideService.createPanic(rideID, {"reason":res.message}).subscribe();
          this.panicEnabled = false;
        }
      }
    });
  }

  setupImage(imgName:string){
    this.imageService.getProfilePicture(imgName).then(imgData => {
      const objectURL = URL.createObjectURL(imgData);
      this.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    });
  }

  ngOnInit(): void {
    let estTimeMinutes=0;
    if (this.currentRide!=null) {
      this.destinationAddress = this.currentRide.locations[0].destination.address;
      this.departureAddress = this.currentRide.locations[0].departure.address;
      estTimeMinutes = this.currentRide.estimatedTimeInMinutes;
    }
    const hours:number = Math.floor(estTimeMinutes / 60);
    const minutes:number = estTimeMinutes % 60;
    if(hours == 0){
      this.rideEstTime = `${minutes}min`;
    }else{
      this.rideEstTime = `${hours}hr ${minutes}min`;
    }
    if (this.rideLengthKm!=null)
      this.rideLength = `${Math.round(this.rideLengthKm * 10) / 10}km`;
    this.distanceLeftChangedEvent?.subscribe(distance => {
      if(this.rideLengthKm!=null) {
        const ridePercent: number = Math.ceil((1 - (distance / this.rideLengthKm)) * 100);
        this.progressBarHeight = ridePercent + "%";
      }
    });
    if (this.currentRide!=null)
      if(this.userType == "DRIVER"){
        const passengerBase:UserSimpleInfo = this.currentRide.passengers[0];
        this.passengerService.getPassenger(passengerBase.id).subscribe(user => {
          this.setupImage(user.profilePicture);
          this.toolTipInfo = user.name + " " + user.surname + "\n" + user.email + "\n" + user.telephoneNumber;
        });
      }else if(this.userType == "PASSENGER"){
        const driverBase:UserSimpleInfo = this.currentRide.driver;
        this.driverService.getDriver(driverBase.id).subscribe(user => {
          this.setupImage(user.profilePicture);
          this.toolTipInfo = user.name + " " + user.surname + "\n" + user.email + "\n" + user.telephoneNumber;
        });
      }


  }
}
