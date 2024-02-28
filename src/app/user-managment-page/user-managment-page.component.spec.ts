import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagmentPageComponent } from './user-managment-page.component';

describe('UserManagmentPageComponent', () => {
  let component: UserManagmentPageComponent;
  let fixture: ComponentFixture<UserManagmentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserManagmentPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserManagmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
