import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-passenger-account',
  templateUrl: './passenger-account.component.html',
  styleUrls: ['./passenger-account.component.css']
})
export class PassengerAccountComponent {
  @Input()
  public userId: number = -1;
  @Input()
  public role: string = "";
  constructor() {
  }

}
