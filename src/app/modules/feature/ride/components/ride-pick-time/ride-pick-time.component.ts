import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {interval, Observable} from "rxjs";

@Component({
  selector: 'app-ride-pick-time',
  templateUrl: './ride-pick-time.component.html',
  styleUrls: ['./ride-pick-time.component.css']
})

export class RidePickTimeComponent implements OnInit{
  @Output() changeFormPageEmitter = new EventEmitter<number>();
  @Output() rideDateTimeChangedEvent = new EventEmitter<Date>();
  selectedTime?:string;
  currentDateTime:Date;
  minTime:Date;
  selectedDate?:Date;
  constructor() {
    this.currentDateTime = new Date();
    this.minTime = this.currentDateTime;
    this.selectedTime = this.dateToString(this.currentDateTime);
    this.selectedDate = this.currentDateTime;
  }
  private getSelectedDateTime():Date{
    let tokens:string[] = this.selectedTime!.split(':');
    let hours:number = Number(tokens[0]);
    let minutes:number = Number(tokens[1]);
    let output:Date = new Date(this.selectedDate!);
    output.setHours(hours);
    output.setMinutes(minutes);
    return output;
  }

  nextFormPage():void{
    this.rideDateTimeChangedEvent.emit(this.getSelectedDateTime());
    this.changeFormPageEmitter.emit(1);
  }
  previousFormPage():void{
    this.changeFormPageEmitter.emit(-1);
  }

  ngOnInit(): void {

  }
  dateToString(date:Date):string{
    return date.getHours() + ":" + date.getMinutes();
  }
  selectedDateChanged(event:any){
    this.selectedDate = event;
    this.checkMinTime();
  }
  selectedTimeChanged(event:any){
    this.selectedTime = event;
  }
  checkMinTime(){
    if(this.selectedDate){
      let dummy:Date = new Date(this.selectedDate);
      dummy.setHours(0,0,0,0);
      if(dummy > this.currentDateTime){
        this.minTime.setHours(0,0,0,0);
      }else{
        this.minTime = this.currentDateTime;
        if(this.selectedTime){
          if(this.selectedTime < this.currentDateTime.getHours()+":"+this.currentDateTime.getMinutes()){
            this.selectedTime = this.dateToString(this.currentDateTime);
          }
        }
      }
    }
  }
}
