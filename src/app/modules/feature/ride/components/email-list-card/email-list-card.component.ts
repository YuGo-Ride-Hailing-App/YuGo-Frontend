import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-email-list-card',
  templateUrl: './email-list-card.component.html',
  styleUrls: ['./email-list-card.component.css']
})
export class EmailListCardComponent {
  @Input() email?:string;
  @Input() id?:number;
  @Output() removeItemEmitter = new EventEmitter<number>();

  removeItem(){
    this.removeItemEmitter.emit(this.id);
  }
}
