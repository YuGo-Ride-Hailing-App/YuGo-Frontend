import {Component, Input} from '@angular/core';
import {Panic} from "../../models/Panic";
import {MatDialog} from "@angular/material/dialog";
import {
  HistoryDetailedRideCardComponent
} from "../../../history/components/history-detailed-ride-card/history-detailed-ride-card.component";

@Component({
  selector: 'app-panic-card',
  templateUrl: './panic-card.component.html',
  styleUrls: ['./panic-card.component.css']
})
export class PanicCardComponent {
  @Input()
  public panic! : Panic;
  @Input()
  public notification! : boolean;
  constructor(private _dialog: MatDialog) {

  }

  openRidePreview(){
    const ridePreview = this._dialog.open(HistoryDetailedRideCardComponent, {
      minWidth: '300px',
      maxWidth: '500px',
      minHeight: '650px',
      width: '30%',
      height: '50%',
    })
    const ridePreviewDialogInstance = ridePreview.componentInstance;
    ridePreviewDialogInstance.ride = this.panic.ride;
    ridePreviewDialogInstance.historyPreview = false;
  }
}
