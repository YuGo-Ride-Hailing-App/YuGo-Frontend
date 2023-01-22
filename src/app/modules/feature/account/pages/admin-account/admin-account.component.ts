import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-admin-account',
  templateUrl: './admin-account.component.html',
  styleUrls: ['./admin-account.component.css']
})
export class AdminAccountComponent {
  @Input()
  public userId = -1;
  @Input()
  public role= "";
}
