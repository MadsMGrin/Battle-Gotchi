import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleRequestListComponent } from './battle-request-list.component';

describe('BattleRequestListComponent', () => {
  let component: BattleRequestListComponent;
  let fixture: ComponentFixture<BattleRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BattleRequestListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BattleRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
