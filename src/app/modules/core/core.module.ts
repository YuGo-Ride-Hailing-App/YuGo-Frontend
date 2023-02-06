import { NgModule } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PassengerRegisterComponent } from './components/register/passenger-register/passenger-register.component';
import {SharedModule} from "../shared/shared.module";
import {CommonModule} from "@angular/common";
import { FooterComponent } from './components/footer/footer.component';
import {HistoryModule} from "../feature/history/history.module";
import {HomeModule} from "../feature/home/home.module";
import {AccountModule} from "../feature/account/account.module";
import {RideModule} from "../feature/ride/ride.module";
import {FavoritePathModule} from "../feature/favorite-path/favorite-path.module";
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import {VehicleModule} from "../feature/vehicle/vehicle.module";
import { DriverRegisterComponent } from './components/register/driver-register/driver-register.component';
import { AccountActivationComponent } from './components/account-activation/account-activation.component';
import {PanicModule} from "../feature/panic/panic.module";

@NgModule({
  declarations: [
    LoginComponent,
    NavbarComponent,
    PassengerRegisterComponent,
    FooterComponent,
    ForgotPasswordComponent,
    DriverRegisterComponent,
    AccountActivationComponent],
  exports: [
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    HistoryModule,
    HomeModule,
    AccountModule,
    FavoritePathModule,
    RideModule,
    VehicleModule,
    PanicModule
  ]
})
export class CoreModule {
}
