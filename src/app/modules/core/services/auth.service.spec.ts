import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {environment} from "../../../../enviroments/environment";
import {
  loginCredentials01, token01

} from "../mocks/auth.service.mock"
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

describe('AuthService', () => {
  let service: AuthService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
    httpController = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpController.verify();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it("should call logIn and return token", () => {
    service.logIn(loginCredentials01).subscribe(res => {
      expect(res).toEqual(token01);
    })
    const req = httpController.expectOne({
      method: 'POST',
      url: environment.apiHost + 'user/login'
    });

    req.flush(token01);
  });
});
