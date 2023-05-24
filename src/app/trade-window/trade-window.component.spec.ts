import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeWindowComponent } from './trade-window.component';

describe('TradeWindowComponent', () => {
  let component: TradeWindowComponent;
  let fixture: ComponentFixture<TradeWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradeWindowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
