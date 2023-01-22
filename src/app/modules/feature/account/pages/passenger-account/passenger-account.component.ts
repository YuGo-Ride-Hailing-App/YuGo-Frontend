import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-passenger-account',
  templateUrl: './passenger-account.component.html',
  styleUrls: ['./passenger-account.component.css']
})
export class PassengerAccountComponent {
  @Input()
  public userId = -1;
  @Input()
  public role = "";

}
