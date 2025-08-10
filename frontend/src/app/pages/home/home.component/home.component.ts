import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SiteProfileService } from 'src/app/shared/services/site-profile.service';
import { SiteProfile } from 'src/app/shared/models/site-profile.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private profileApi = inject(SiteProfileService);

  loading = true;
  error = '';
  profile: SiteProfile | null = null;

  ngOnInit(): void {
    this.profileApi.get().subscribe({
      next: (p) => { this.profile = p; this.loading = false; },
      error: () => { this.error = 'Profil bilgileri yüklenemedi.'; this.loading = false; }
    });
  }

  get aboutList(): string[] {
    return this.profile?.about?.length ? this.profile!.about : [];
  }

  // trackBy fonksiyonu (sadece index'e göre)
  trackByIndex(index: number): number {
    return index;
  }

  get social() {
    const p = this.profile;
    return [
      p?.github ?   { label: 'GitHub',   href: p.github }   : null,
      p?.linkedIn ? { label: 'LinkedIn', href: p.linkedIn } : null,
      p?.instagram? { label: 'Instagram',href: p.instagram}: null,
      p?.email ?    { label: 'E-posta',  href: `mailto:${p.email}` } : null,
    ].filter(Boolean) as Array<{label: string; href: string}>;
  }
}