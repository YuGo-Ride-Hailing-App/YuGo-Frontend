import {Component, DoCheck, Inject} from '@angular/core';
import {HttpErrorResponse} from "@angular/common/http";
import {ReviewService} from "../../../../shared/services/review.service";
import {PassengerService} from "../../../../shared/services/passenger.service";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {RideInfo} from "../../../../shared/models/RideInfo";
import {MatTableDataSource} from "@angular/material/table";
import {Observable} from "rxjs";
import {ReviewOut} from "../history-review-card-driver/history-review-card-driver.component";
import {AuthService} from "../../../../core/services/auth.service";
import {ReviewInfoOut} from "../../models/ReviewInfoOut";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-history-review-card-passenger',
  templateUrl: './history-review-card-passenger.component.html',
  styleUrls: ['./history-review-card-passenger.component.css']
})
export class HistoryReviewCardPassengerComponent implements DoCheck {
  foundReview: boolean[] = [false, false];
  enabledReview: boolean[] = [true, true];
  reviewList: ReviewInfoOut[] = [{rating: 0, id: 0} as ReviewInfoOut, {} as ReviewInfoOut];
  vehicleForm: FormGroup;
  rideForm: FormGroup;
  vehicleRating: number = 0;
  rideRating: number = 0;
  ride: RideInfo;
  userId: number;
  role: string;

  constructor(private reviewService: ReviewService, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.ride = data.ride;
    this.userId = data.userId;
    this.role = data.role;
    this.vehicleForm = new FormGroup({
      rating5v: new FormControl(false, [Validators.required]),
      rating4v: new FormControl(false, [Validators.required]),
      rating3v: new FormControl(false, [Validators.required]),
      rating2v: new FormControl(false, [Validators.required]),
      rating1v: new FormControl(false, [Validators.required]),
      commentv: new FormControl("", [Validators.required])
    });
    this.rideForm = new FormGroup({
      rating5r: new FormControl(false, [Validators.required]),
      rating4r: new FormControl(false, [Validators.required]),
      rating3r: new FormControl(false, [Validators.required]),
      rating2r: new FormControl(false, [Validators.required]),
      rating1r: new FormControl(false, [Validators.required]),
      commentr: new FormControl("", [Validators.required])
    });
    this.getReviews();

  }

  ngDoCheck(): void {
  }


  getReviews() {
    this.reviewService.getReviewsForRide(this.ride.id).subscribe(
      {
        next: (reviews) => {
          reviews.forEach((reviewPerPassenger) => {
            if (reviewPerPassenger.vehicleReview != null) {
              if (this.userId == reviewPerPassenger.vehicleReview.passenger.id) {
                this.foundReview[0] = true;
                this.reviewList[0] = reviewPerPassenger.vehicleReview;
              }
            }
            if (reviewPerPassenger.driverReview != null) {
              if (this.userId == reviewPerPassenger.driverReview.passenger.id) {
                this.foundReview[1] = true;
                this.reviewList[1] = reviewPerPassenger.driverReview;
              }
            }
          })

          if (this.foundReview[0]) {
            this.vehicleRating = this.reviewList[0].rating;
            this.vehicleForm.patchValue({
              commentv: this.reviewList[0].comment
            });
            document.getElementById("submit-vehicle")!.hidden = true;
            this.vehicleForm.disable();
            this.enabledReview[0] = false;


          } else {
            if (this.getDayDiff(new Date(), new Date(this.ride.startTime)) > 3) {
              this.vehicleForm.patchValue({
                commentv: "Time for review expired."
              });
              document.getElementById("submit-vehicle")!.hidden = true;
              this.vehicleForm.disable();
              this.enabledReview[0] = false;
            }
          }
          if (this.foundReview[1]) {
            this.rideRating = this.reviewList[1].rating;
            this.rideForm.patchValue({
              commentr: this.reviewList[1].comment
            });
            document.getElementById("submit-ride")!.hidden = true;
            this.rideForm.disable();
            this.enabledReview[1] = false;

          } else {
            if (this.getDayDiff(new Date(), new Date(this.ride.startTime)) > 3) {
              this.rideForm.patchValue({
                commentr: "Time for review expired."
              });
              document.getElementById("submit-ride")!.hidden = true;
              this.rideForm.disable();
              this.enabledReview[1] = false;
            }

          }


        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
          }
        }
      })
  }

  getDayDiff(startDate: Date, endDate: Date): number {
    const msInDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs(Number(endDate) - Number(startDate)) / msInDay);
  }

  dateToString(date: Date): string {
    let dateString = date.toString().split(",");
    return [dateString[2], dateString[1], dateString[0]].join(".") + ". " + [dateString[3], dateString[4]].join(":");
  }
  dateToStringConversion(date: Date): string {
    let dateString = date.toString().split(",");
    return [dateString[1], dateString[2], dateString[0]].join(".") + ". " + [dateString[3], dateString[4]].join(":");
  }

  padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }

  createVehicleReview() {
    let rating = 0;
    if (this.vehicleForm.value["rating5v"])
      rating = 5;
    else if (this.vehicleForm.value["rating4v"])
      rating = 4;
    else if (this.vehicleForm.value["rating3v"])
      rating = 3;
    else if (this.vehicleForm.value["rating2v"])
      rating = 2;
    else if (this.vehicleForm.value["rating1v"])
      rating = 1;
    if (rating != 0) {
      this.reviewService.createVehicleReview(this.ride.id, rating, this.vehicleForm.value["commentv"]).subscribe({
        next: () => {

        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {

          }
        }
      });
      this.vehicleForm.disable();
      document.getElementById("submit-vehicle")!.hidden = true;
      this.enabledReview[0] = false;
      this.ngDoCheck();
      document.getElementById("stars-vehicle")?.classList.remove("invalid-error");

    }else {
      document.getElementById("stars-vehicle")?.classList.add("invalid-error");
    }
  }

  createRideReview() {
    let rating = 0;
    if (this.rideForm.value["rating5r"])
      rating = 5;
    else if (this.rideForm.value["rating4r"])
      rating = 4;
    else if (this.rideForm.value["rating3r"])
      rating = 3;
    else if (this.rideForm.value["rating2r"])
      rating = 2;
    else if (this.rideForm.value["rating1r"])
      rating = 1;
    if (rating != 0) {
      this.reviewService.createRideReview(this.ride.id, rating, this.rideForm.value["commentr"]).subscribe({
        next: () => {

        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {

          }
        }
      });
      this.rideForm.disable();
      document.getElementById("submit-ride")!.hidden = true;
      this.enabledReview[1] = false;
      this.ngDoCheck();
      document.getElementById("stars-ride")?.classList.remove("invalid-error");

    }
    else{
      document.getElementById("stars-ride")?.classList.add("invalid-error");
    }
  }
}
