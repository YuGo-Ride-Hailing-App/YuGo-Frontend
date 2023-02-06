import { TestBed } from '@angular/core/testing';

import { RegistrationService } from './registration.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {mockUser1} from "../mocks/registration.service.mock";
import {environment} from "../../../../enviroments/environment";

describe('RegistrationService', () => {
  let service: RegistrationService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(RegistrationService);
    httpController=TestBed.inject(HttpTestingController)
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register driver', () => {
    service.registerPassenger(mockUser1).subscribe((data) => {
      expect(data.name).toEqual(mockUser1.name);
      expect(data.surname).toEqual(mockUser1.surname);
      expect(data.telephoneNumber).toEqual(mockUser1.telephoneNumber);
      expect(data.email).toEqual(mockUser1.email);
      expect(data.address).toEqual(mockUser1.address);
    });

    const req = httpController.expectOne({
      method: 'POST',
      url: environment.apiHost + "passenger",
    });
    req.flush(mockUser1);
  });

  it('should register driver', () => {
    service.registerDriver(mockUser1).subscribe((data) => {
      expect(data.name).toEqual(mockUser1.name);
      expect(data.surname).toEqual(mockUser1.surname);
      expect(data.telephoneNumber).toEqual(mockUser1.telephoneNumber);
      expect(data.email).toEqual(mockUser1.email);
      expect(data.address).toEqual(mockUser1.address);
    });

    const req = httpController.expectOne({
      method: 'POST',
      url: environment.apiHost + "driver",
    });
    req.flush(mockUser1);
  });
});
