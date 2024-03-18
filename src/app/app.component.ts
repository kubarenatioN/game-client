import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SessionService } from './modules/auth/services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  http = inject(HttpClient);

  user$ = this.sessionService.user$;

  constructor(private sessionService: SessionService, private router: Router) {}

  ngOnInit(): void {
    this.sessionService.loadUserSession().subscribe();

    // Debug session
    // this.sessionService.session$.subscribe((res) => {
    //   console.log('app component', res);
    // });
  }

  logout(): void {
    this.sessionService.disposeSession();

    this.router.navigate(['/auth']);
  }
}
