import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UsersPanicsComponent} from "./pages/users-panics.component";
import {PanicCardComponent} from "./components/panic-card/panic-card.component";
import {SharedModule} from "../../shared/shared.module";

@NgModule({
  declarations: [
    UsersPanicsComponent,
    PanicCardComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    CommonModule,
    PanicCardComponent,
    UsersPanicsComponent
  ]
})
export class PanicModule {}
