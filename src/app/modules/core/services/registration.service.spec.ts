import { TestBed } from '@angular/core/testing';

import { RegistrationService } from './registration.service';
import {HttpTestingController} from "@angular/common/http/testing";

describe('RegistrationService', () => {
  let service: RegistrationService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistrationService);

    httpController=TestBed.inject(HttpTestingController)
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should be created', () => {
    expect(true).toBeTruthy();
  });
});
