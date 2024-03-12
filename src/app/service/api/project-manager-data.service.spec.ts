import { TestBed } from '@angular/core/testing';

import { ProjectManagerDataService } from './project-manager-data.service';

describe('ProjectManagerDataService', () => {
  let service: ProjectManagerDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectManagerDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
