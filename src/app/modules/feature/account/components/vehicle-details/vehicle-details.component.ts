import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Vehicle} from "../../../../shared/models/Vehicle";
import {VehicleService} from "../../../../shared/services/vehicle.service";
import {take} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-vehicle-details',
  templateUrl: './vehicle-details.component.html',
  styleUrls: ['./vehicle-details.component.css']
})
export class VehicleDetailsComponent implements OnInit, AfterViewInit{
  @Input()
  public userId = -1;

  LICENSE_NUMBER_REGEX= "[A-Z][A-Z][0-9]*[A-Z][A-Z]";
  vehicleDetailsForm : FormGroup;
  editEnabled = false;
  responseMessage = "";
  constructor(private _snackBar: MatSnackBar, private _vehicleService: VehicleService) {
    this.vehicleDetailsForm = new FormGroup({
      model: new FormControl('', [Validators.required]),
      vehicleType: new FormControl('STANDARD', [Validators.required]),
      licenseNumber: new FormControl('', [Validators.required,
        Validators.pattern(this.LICENSE_NUMBER_REGEX)]),
      babyTransport: new FormControl(false),
      petTransport: new FormControl(false),
      passengerSeats: new FormControl(1, [Validators.required]),
    });
  }

  ngOnInit(){
    this.loadVehicleData();
  }

  ngAfterViewInit() {
    this.cancelEdit();
  }

  loadVehicleData(){
    this._vehicleService.getVehicle(this.userId).pipe(take(1)).subscribe({
      next: (vehicle) => {
        this.vehicleDetailsForm.patchValue({
          model: vehicle.model,
          vehicleType: vehicle.vehicleType,
          licenseNumber: vehicle.licenseNumber,
          babyTransport: vehicle.babyTransport,
          petTransport: vehicle.petTransport,
          passengerSeats: vehicle.passengerSeats,
        })
      }
    });
  }

  enableEdit() : void{
    this.vehicleDetailsForm.enable();
    this.editEnabled = true;
  }

  cancelEdit() : void{
    this.vehicleDetailsForm.disable();
    this.editEnabled = false;
    this.loadVehicleData();
  }

  submitEdit() : void {
    const vehicleDetails : Vehicle = {
      "id":0,
      "driverId":0,
      "model": this.vehicleDetailsForm.controls['model'].value,
      "vehicleType": this.vehicleDetailsForm.controls['vehicleType'].value,
      "licenseNumber": this.vehicleDetailsForm.controls['licenseNumber'].value,
      "babyTransport": this.vehicleDetailsForm.controls['babyTransport'].value,
      "petTransport": this.vehicleDetailsForm.controls['petTransport'].value,
      "passengerSeats": this.vehicleDetailsForm.controls['passengerSeats'].value,
      "currentLocation": {
        "address": "Null Island",
        "longitude": 0,
        "latitude": 0
      }
    }
    this._vehicleService.makeVehicleChangeRequest(this.userId, vehicleDetails).pipe(take(1)).subscribe({
      next: (response) => {
        this._snackBar.open(response.message,"OK");
      }
    });
    this.loadVehicleData();
    this.vehicleDetailsForm.disable();
    this.editEnabled = false;
  }
}
