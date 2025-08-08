import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-project-card',
  imports: [CommonModule],
  templateUrl: './project-card.html',
  styleUrls: ['./project-card.css']
})
export class ProjectCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() githubUrl: string = '';
}