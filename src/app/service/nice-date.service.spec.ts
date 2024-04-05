import { TestBed } from '@angular/core/testing';

import { NiceDateService } from './nice-date.service';

describe('NiceDateService', () => {
  let service: NiceDateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NiceDateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
