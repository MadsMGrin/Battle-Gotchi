import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeRequestListComponent } from './trade-request-list.component';

describe('TradeRequestListComponent', () => {
  let component: TradeRequestListComponent;
  let fixture: ComponentFixture<TradeRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradeRequestListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
