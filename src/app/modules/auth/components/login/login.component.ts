import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);

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
          console.log(res);
        },
      });
  }
}
