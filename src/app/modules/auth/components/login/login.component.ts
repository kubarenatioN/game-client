import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import { AuthWeb3Service, SessionService } from '../../services';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private authWeb3 = inject(AuthWeb3Service);
  private router = inject(Router);
  private sessionService = inject(SessionService);

  form = new FormGroup({
    login: new FormControl<string>('', {
      validators: [Validators.required],
    }),
    password: new FormControl<string>('', {
      validators: [Validators.required],
    }),
  });

  submit(): void {
    const { invalid } = this.form;
    if (invalid) {
      return;
    }

    const {
      value: { login, password },
    } = this.form;

    if (!login || !password) {
      return;
    }

    this.authService
      .login({
        login,
        password,
      })
      .subscribe({
        next: ({ user, session }) => {
          this.sessionService.user = user;
          this.sessionService.session = session;

          this.router.navigate(['/']);
        },
      });
  }

  loginWithWallet(): void {
    this.authWeb3
      .loginViaWallet()
      .pipe(
        switchMap((res) => {
          if (res) {
            const { accessToken } = res;
            this.sessionService.session = accessToken;

            return this.sessionService.loadUserSession();
          }

          return EMPTY;
        })
      )
      .subscribe({
        next: (res) => {
          this.sessionService.user = res;
          this.router.navigate(['/']);
        },
      });
  }
}
