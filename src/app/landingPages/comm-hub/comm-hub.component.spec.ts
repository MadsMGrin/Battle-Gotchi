import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommHubComponent } from './comm-hub.component';

describe('CommHubComponent', () => {
  let component: CommHubComponent;
  let fixture: ComponentFixture<CommHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommHubComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
