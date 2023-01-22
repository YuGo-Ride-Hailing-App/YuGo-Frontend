import {Component, EventEmitter, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../../core/services/auth.service";
import {PassengerService} from "../../../../shared/services/passenger.service";
import {UserSimpleInfo} from "../../../../shared/models/UserSimpleInfo";

@Component({
  selector: 'app-ride-add-passengers',
  templateUrl: './ride-add-passengers.component.html',
  styleUrls: ['./ride-add-passengers.component.css']
})
export class RideAddPassengersComponent {
  @Output() changeFormPageEmitter = new EventEmitter<number>();
  @Output() passengersChangedEvent = new EventEmitter<UserSimpleInfo[]>();
  addPassengersForm:FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required])
  })
  ridePassengers:UserSimpleInfo[] = [];


  constructor(private authService:AuthService, private passengerService:PassengerService) {}

  private isDuplicateEmail(email:string):boolean{
    for(const passenger of this.ridePassengers){
      if(passenger.email == email){
        return true;
      }
    }
    return false;
  }

  previousFormPage(){
    this.changeFormPageEmitter.emit(-1);
  }
  nextFormPage(){
    const output:UserSimpleInfo[] = [{id:this.authService.getId(), email:this.authService.getEmail()}, ...this.ridePassengers];
    this.passengersChangedEvent.emit(output);
    this.changeFormPageEmitter.emit(1);
  }
  addPassenger(){
    const email:string = this.addPassengersForm.controls['email'].value;
    this.addPassengersForm.controls['email'].setValue('');
    if(this.authService.getEmail() == email){
      const errors = this.addPassengersForm.controls['email'].errors || {};
      this.addPassengersForm.controls['email'].setErrors({
        'selfReference': 'Username already exists', ...errors
      });
      return;
    }
    if(this.isDuplicateEmail(email)){
      const errors = this.addPassengersForm.controls['email'].errors || {};
      this.addPassengersForm.controls['email'].setErrors({
        'duplicateEmail': 'User already added', ...errors
      });
      return;
    }
    this.passengerService.getPassengerByEmail(email).subscribe({
      next: user => {
        this.ridePassengers.push({id:user.id, email:email});
      },
      error: () => {
        const errors = this.addPassengersForm.controls['email'].errors || {};
        this.addPassengersForm.controls['email'].setErrors({
          'wrongEmail': "User with email doesn't exist", ...errors
        });
        return;
      }
    })
  }
  removeItem(index:number){
    this.ridePassengers.splice(index, 1);
  }
}
