import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {DomSanitizer} from "@angular/platform-browser";
@Component({
  selector: 'app-vehicle-type-card',
  templateUrl: './vehicle-type-card.component.html',
  styleUrls: ['./vehicle-type-card.component.css']
})
export class VehicleTypeCardComponent implements OnInit{
  @Input() vehicleType?:VehicleTypeCardData;
  @Input() distanceChangedEvent?: Observable<number>;
  @Input() index?:number;
  @Input() selectionChangedEvent?: Observable<number>;
  image:any;
  isChecked:boolean = false;
  totalPrice?:number;
  onClick():void{
    this.isChecked = !this.isChecked;
  }

  constructor(private sanitizer: DomSanitizer) {}
  ngOnInit():void{
    this.selectionChangedEvent?.subscribe((n:number) => {
      this.isChecked = this.index == n;
    });
    this.distanceChangedEvent?.subscribe((distance:number) => {
      this.totalPrice = Math.round(this.vehicleType!.pricePerKm * distance * 100) / 100;
    });
  }

  ngAfterContentInit(): void {
    let objectURL = URL.createObjectURL(this.vehicleType?.image);
    this.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
  }
}
export interface VehicleTypeCardData {
  id:number;
  vehicleTypeName:string;
  image:any;
  pricePerKm:number;
}
export interface VehicleType{
  id:number;
  vehicleType:string;
  imgPath:string;
  pricePerKm:number;
}
