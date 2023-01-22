import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-recommended-location',
  templateUrl: './recommended-location.component.html',
  styleUrls: ['./recommended-location.component.css']
})
export class RecommendedLocationComponent {
  @Input() address?:any;
  @Output() isClickedEvent = new EventEmitter<any>();

  select():void{
    this.isClickedEvent.emit(this.address);
  }
}
