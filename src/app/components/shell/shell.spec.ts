import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShellComponent } from './shell';
import { ToastService } from '../../services/toast.service';

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have user menu closed initially', () => {
    expect(component.isUserMenuOpen()).toBe(false);
  });

  it('should toggle user menu', () => {
    component.toggleUserMenu();
    expect(component.isUserMenuOpen()).toBe(true);

    component.toggleUserMenu();
    expect(component.isUserMenuOpen()).toBe(false);
  });

  it('should close user menu when closeUserMenu is called', () => {
    component.toggleUserMenu();
    expect(component.isUserMenuOpen()).toBe(true);

    component.closeUserMenu();
    expect(component.isUserMenuOpen()).toBe(false);
  });

  it('should close user menu on escape key', () => {
    component.toggleUserMenu();
    expect(component.isUserMenuOpen()).toBe(true);

    component.onEscape();
    expect(component.isUserMenuOpen()).toBe(false);
  });

  it('should close user menu and show toast when onUserProfile is called', () => {
    component.toggleUserMenu();
    component.onUserProfile();

    expect(component.isUserMenuOpen()).toBe(false);
    expect(toastService.toasts().length).toBeGreaterThan(0);
  });

  it('should close user menu and show toast when onSignOut is called', () => {
    component.toggleUserMenu();
    component.onSignOut();

    expect(component.isUserMenuOpen()).toBe(false);
    expect(toastService.toasts().length).toBeGreaterThan(0);
  });
});
