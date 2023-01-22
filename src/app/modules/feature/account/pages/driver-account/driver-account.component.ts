import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-driver-account',
  templateUrl: './driver-account.component.html',
  styleUrls: ['./driver-account.component.css']
})
export class DriverAccountComponent {
  @Input()
  public userId = -1;
  @Input()
  public role = "";
}
