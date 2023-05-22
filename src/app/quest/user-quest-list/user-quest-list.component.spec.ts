import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQuestListComponent } from './user-quest-list.component';

describe('UserQuestListComponent', () => {
  let component: UserQuestListComponent;
  let fixture: ComponentFixture<UserQuestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserQuestListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserQuestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
