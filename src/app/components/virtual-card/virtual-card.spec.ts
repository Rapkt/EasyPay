import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VirtualCardComponent } from './virtual-card';

describe('VirtualCardComponent', () => {
  let component: VirtualCardComponent;
  let fixture: ComponentFixture<VirtualCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VirtualCardComponent);
    fixture.componentRef.setInput('card', {
      number: '4539201874560912',
      expiry: '10/29',
      cvv: '482',
      holder: 'BRIDGE USER',
      service: 'Supabase',
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
