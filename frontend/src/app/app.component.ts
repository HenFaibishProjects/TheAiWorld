import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackToHomeButtonComponent } from './components/back-to-home-button/back-to-home-button';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, BackToHomeButtonComponent],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'WorkWithTokens';
}
