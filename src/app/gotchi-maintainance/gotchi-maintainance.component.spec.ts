import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GotchiMaintainanceComponent } from './gotchi-maintainance.component';

describe('GotchiMaintainanceComponent', () => {
  let component: GotchiMaintainanceComponent;
  let fixture: ComponentFixture<GotchiMaintainanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GotchiMaintainanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GotchiMaintainanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
