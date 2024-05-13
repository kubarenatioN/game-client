import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, SessionService } from '../../services';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
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
      .register({
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
}
