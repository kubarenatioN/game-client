import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
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

  user$ = this.sessionService.session$;

  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.sessionService.getSession().subscribe();

    // Debug session
    // this.sessionService.session$.subscribe((res) => {
    //   console.log('app component', res);
    // });
  }
}
