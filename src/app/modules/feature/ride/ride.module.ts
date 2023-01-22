import { NgModule } from '@angular/core';
import {SharedModule} from "../../shared/shared.module";
import {RideComponent} from "./pages/ride.component";
import {RidePickDestinationComponent} from "./components/ride-pick-destination/ride-pick-destination.component";
import { RidePickPropertiesComponent } from './components/ride-pick-properties/ride-pick-properties.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import { VehicleTypeCardComponent } from './components/vehicle-type-card/vehicle-type-card.component';
import { RidePickTimeComponent } from './components/ride-pick-time/ride-pick-time.component';
import {NgxMatTimepickerModule} from "ngx-mat-timepicker";
import { RecommendedLocationComponent } from './components/recommended-location/recommended-location.component';
import { SearchingDriverScreenComponent } from './components/searching-driver-screen/searching-driver-screen.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { RideOfferCardComponent } from './components/ride-offer-card/ride-offer-card.component';

@NgModule({
  declarations: [
    RideComponent,
    RidePickDestinationComponent,
    RidePickPropertiesComponent,
    VehicleTypeCardComponent,
    RidePickTimeComponent,
    RecommendedLocationComponent,
    SearchingDriverScreenComponent,
    RideOfferCardComponent],
    exports: [
        RideComponent,
        RideOfferCardComponent,
    ],
    imports: [
        SharedModule,
        MatCheckboxModule,
        NgxMatTimepickerModule,
        MatProgressSpinnerModule,
    ]
})
export class RideModule {}
