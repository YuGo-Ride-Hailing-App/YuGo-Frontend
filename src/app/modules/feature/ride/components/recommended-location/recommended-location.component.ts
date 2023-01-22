import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-recommended-location',
  templateUrl: './recommended-location.component.html',
  styleUrls: ['./recommended-location.component.css']
})
export class RecommendedLocationComponent implements OnInit{
  @Input() address?:any;
  @Output() isClickedEvent = new EventEmitter<any>();
  constructor() {
  }
  ngOnInit():void{

  }

  select():void{
    this.isClickedEvent.emit(this.address);
  }
}
