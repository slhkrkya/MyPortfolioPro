import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Admin Panel</h1>
      <p>Yönetim sayfasına hoş geldiniz.</p>
    </div>
  `,
})
export class AdminPanelComponent {}