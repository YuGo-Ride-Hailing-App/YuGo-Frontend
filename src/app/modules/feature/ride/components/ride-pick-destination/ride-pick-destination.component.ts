import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MapService} from "../../../home/services/map.service";
import {DestinationPickerService} from "../../services/destination-picker.service";
import {LocationInfo} from "../../../../shared/models/LocationInfo";

@Component({
  selector: 'app-ride-pick-destination',
  templateUrl: './ride-pick-destination.component.html',
  styleUrls: ['./ride-pick-destination.component.css']
})
export class RidePickDestinationComponent implements AfterViewInit{
  @Output() changeFormPageEmitter = new EventEmitter<number>();
  @Output() routeChangedEvent = new EventEmitter<[LocationInfo, LocationInfo]>();
  recommendedAddresses:any[] = [];
  selectedFromAddress?:LocationInfo;
  selectedToAddress?:LocationInfo;
  selectedField?:string;

  destinationForm = new FormGroup({
    from: new FormControl('', [Validators.required]),
    to: new FormControl('', [Validators.required]),
  })
  constructor(private mapService: MapService, private destinationPickerService: DestinationPickerService) {}

  ngAfterViewInit(): void {
    this.destinationPickerService.manuallySelectedToAddress.subscribe({
      next:(address: LocationInfo)=>{
        this.selectedToAddress = address;
        this.destinationForm.value.to = address.address;
      }
    });
    this.destinationPickerService.manuallySelectedFromAddress.subscribe({
      next:(address: LocationInfo)=>{
        this.selectedFromAddress = address;
        this.destinationForm.value.from = address.address;
      }
    });
    }
  nextFormPage(): void {
    this.routeChangedEvent.emit([this.selectedFromAddress!, this.selectedToAddress!]);
    this.changeFormPageEmitter.emit(1);
  }

  enterSubmit(keyPress: KeyboardEvent):void {
    if(keyPress.code != "Enter"){
      return;
    }
    this.recommendedAddresses = [];
    let searchValue = "";
    if(this.selectedField == "from"){
      if(this.destinationForm.controls.from.value){
        searchValue = this.destinationForm.controls.from.value;
      }
    }else if(this.selectedField == "to"){
      if(this.destinationForm.controls.to.value){
        searchValue = this.destinationForm.controls.to.value;
      }
    }
    if(searchValue == ""){
      return;
    }
    this.mapService.search(searchValue).subscribe({
      next: (result) => {
        for (const address of result){
          this.recommendedAddresses.push(address);
        }
      }
    });

  }

  clearToAddress(){
    this.destinationForm.value.to = "";
    this.selectedToAddress = undefined;
    this.destinationPickerService.updateToAddress(undefined);
  }
  clearFromAddress(){
    this.destinationForm.value.from = "";
    this.selectedFromAddress = undefined;
    this.destinationPickerService.updateFromAddress(undefined);
  }

  enableManualFromAddressSelection(){
    this.destinationPickerService.enableManualFromAddressSelection.next();
  }
  enableManualToAddressSelection(){
    this.destinationPickerService.enableManualToAddressSelection.next();
  }

  onAddressSelected(address:any){
    console.log(address);
    if(this.selectedField == "from"){
      this.selectedFromAddress = {
        address: address.display_name,
        latitude: address.lat,
        longitude: address.lon
      } as LocationInfo;
      this.destinationPickerService.updateFromAddress ({
        address:address.display_name,
        latitude:address.lat,
        longitude:address.lon
      });
      this.destinationForm.value.from = address.display_name
    }else if(this.selectedField == "to"){
      this.selectedToAddress = {
        address: address.display_name,
        latitude: address.lat,
        longitude: address.lon
      } as LocationInfo;
      this.destinationPickerService.updateToAddress({
        address:address.display_name,
        latitude:address.lat,
        longitude:address.lon
      });
      this.destinationForm.value.to = address.display_name;
    }
    this.selectedField = undefined;
    this.recommendedAddresses = [];
  }
  changeFieldFocus(fieldName:string){
    this.selectedField=fieldName;
    this.recommendedAddresses = [];
  }
}
