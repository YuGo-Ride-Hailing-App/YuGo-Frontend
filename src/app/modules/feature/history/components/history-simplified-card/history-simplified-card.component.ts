import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {RideInfo} from "../../../../shared/models/RideInfo";
import {MatTableDataSource} from "@angular/material/table";
import {BehaviorSubject} from "rxjs";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {HttpErrorResponse} from "@angular/common/http";
import {HistoryDetailedDialogComponent} from "../history-detailed-dialog/history-detailed-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PassengerService} from "../../../../shared/services/passenger.service";
import {DriverService} from "../../../../shared/services/driver.service";
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-history-simplified-card',
  templateUrl: './history-simplified-card.component.html',
  styleUrls: ['./history-simplified-card.component.css']
})
export class HistorySimplifiedCardComponent implements OnInit, AfterViewInit{
  @Input()
  public userId = -1;
  @Input()
  public role = "";
  hasError = false;
  selected="startTime";
  accountInfoForm : FormGroup;
  dataSource= new MatTableDataSource<RideInfo>();
  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  obs:  BehaviorSubject<RideInfo[]>;
  @Output()
  dateChange: EventEmitter<MatDatepickerInputEvent<any>> = new EventEmitter();

  constructor(@Inject(LOCALE_ID) private _locale: string, private passengerService:PassengerService, public dialog: MatDialog,
              private driverService: DriverService) {
    this.accountInfoForm = new FormGroup({
      startDate: new FormControl(new Date(2022,0,1), [Validators.required]),
      endDate: new FormControl(new Date(), [Validators.required])});
    this.obs = this.dataSource.connect();
  }

  @ViewChild('ridesPaginator') ridesPaginator!: MatPaginator;
  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit(){

    this.dataSource.paginator = this.ridesPaginator;
  }

  loadData(){
    if (this.role=="PASSENGER") {
      this.passengerService.getPassengerRides(this.userId, this.currentPage, this.pageSize, this.selected, formatDate(this.accountInfoForm.get('startDate')?.value, "yyyy-MM-dd", this._locale), formatDate(this.accountInfoForm.get('endDate')?.value, "yyyy-MM-dd", this._locale)).subscribe({
        next: (results) => {
          this.dataSource.data = results.results;
          setTimeout(() => {
            this.ridesPaginator.pageIndex = this.currentPage;
            this.ridesPaginator.length = results.totalCount;
          });

        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            this.hasError = true;
          }
        }
      })
    }else if (this.role=="DRIVER"){

      this.driverService.getDriverRides(this.userId, this.currentPage, this.pageSize, this.selected, this.accountInfoForm.get('startDate')?.value.toISOString().split('T')[0], this.accountInfoForm.get('endDate')?.value.toISOString().split('T')[0]).subscribe({
        next: (results) => {
          this.dataSource.data = results.results;
          setTimeout(() => {
            this.ridesPaginator.pageIndex = this.currentPage;
            this.ridesPaginator.length = results.totalCount;
          });

        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            this.hasError = true;
          }
        }
      })
    }
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadData();
  }

  onDateChange(): void{
    this.dateChange.emit();
    this.loadData();
  }

  viewDetails(ride: RideInfo) {
    this.dialog.open(HistoryDetailedDialogComponent,{
      data: {ride:ride, userId:this.userId, role:this.role},
      width: '60%',
      maxWidth: '1300px',
      backdropClass: 'backdropBackground',
      hasBackdrop:true
    })
  }

  cleanUpLocation(location:string): string{
    if (location.includes(",")){
      const partialLocations=location.split(",");
      let result="";
      for (let i=0;i<partialLocations.length;i++){
        if (i<=2) {
          if (i === partialLocations.length - 1 || i===2)
            result = result + partialLocations[i];
          else
            result = result + partialLocations[i] + ", ";
        }
      }
      return result;
    }
    return location;
  }
  cleanUpCost(cost:number):number{
    return Math.round(cost * 100) / 100
  }
}
