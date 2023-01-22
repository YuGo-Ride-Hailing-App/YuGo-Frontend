import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {RideInfo} from "../../../../shared/models/RideInfo";

@Component({
  selector: 'app-history-detailed-dialog',
  templateUrl: './history-detailed-dialog.component.html',
  styleUrls: ['./history-detailed-dialog.component.css']
})
export class HistoryDetailedDialogComponent{
  public ride : RideInfo;
  public userId : number;
  public role : string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.ride = data.ride;
    this.userId = data.userId;
    this.role = data.role;
  }
}
