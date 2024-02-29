import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../services';
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
        next: (res) => {
          this.sessionService.session = res;

          this.router.navigate(['/']);
        },
      });
  }
}
