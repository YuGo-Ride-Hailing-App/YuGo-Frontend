import {Component, OnInit} from '@angular/core';
import {PassengerRegisterComponent} from "../../../core/components/register/passenger-register/passenger-register.component";
import {MatDialog} from '@angular/material/dialog';
import {HistoryDetailedDialogComponent} from "../components/history-detailed-dialog/history-detailed-dialog.component";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit{
  public role: string = "";
  public userId: number = -1;

  constructor(private _route: ActivatedRoute) {}

  ngOnInit() {
    this._route.params.subscribe(params => {
      this.userId = Number.parseInt(params['userId'])
      this.role = params['role'];
    })
  }
}
