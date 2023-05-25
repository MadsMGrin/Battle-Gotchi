import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineUserListComponent } from './online-user-list.component';

describe('OnlineUserListComponent', () => {
  let component: OnlineUserListComponent;
  let fixture: ComponentFixture<OnlineUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnlineUserListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
