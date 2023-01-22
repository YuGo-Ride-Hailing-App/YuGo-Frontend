import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {LocationInfo} from "../../../shared/models/LocationInfo";

@Injectable({
  providedIn: 'root'
})
export class DestinationPickerService {
  private fromAddressPublisher:Subject<LocationInfo | undefined> = new Subject<LocationInfo | undefined>();
  private toAddressPublisher:Subject<LocationInfo | undefined> = new Subject<LocationInfo | undefined>();
  private toAddress?:LocationInfo;
  private fromAddress?:LocationInfo;
  path:Subject<any> = new Subject<any>();
  enableManualFromAddressSelection:Subject<void> = new Subject<void>();
  enableManualToAddressSelection:Subject<void> = new Subject<void>();
  manuallySelectedFromAddress:Subject<LocationInfo> = new Subject<LocationInfo>();
  manuallySelectedToAddress:Subject<LocationInfo> = new Subject<LocationInfo>();
  currentFromAddress:Observable<LocationInfo | undefined> = this.fromAddressPublisher.asObservable();
  currentToAddress:Observable<LocationInfo | undefined> = this.toAddressPublisher.asObservable();


  updateFromAddress(address?:LocationInfo){
    this.fromAddress = address;
    this.fromAddressPublisher.next(address);
  }
  updateToAddress(address?:LocationInfo){
    this.toAddress = address;
    this.toAddressPublisher.next(address);
  }

}
