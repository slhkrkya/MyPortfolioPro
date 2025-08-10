import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';

import { SiteProfileService } from 'src/app/shared/services/site-profile.service';
import { SiteProfile } from 'src/app/shared/models/site-profile.model';

@Component({
  selector: 'app-site-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './site-profile-edit.component.html',
})
export class SiteProfileEditComponent implements OnInit {
  private api = inject(SiteProfileService);
  private fb = inject(FormBuilder);
  private msg = inject(MessageService);

  loading = true;
  saving = false;

  // Tipli (typed) reactive forms
  form = this.fb.group({
    fullName: this.fb.nonNullable.control<string>('', { validators: [Validators.required, Validators.maxLength(120)] }),
    tagline:  this.fb.nonNullable.control<string>('', { validators: [Validators.maxLength(240)] }),
    about:    this.fb.array<FormControl<string>>([]),
    github:   this.fb.nonNullable.control<string>(''),
    linkedIn: this.fb.nonNullable.control<string>(''),
    instagram:this.fb.nonNullable.control<string>(''),
    email:    this.fb.nonNullable.control<string>('', { validators: [Validators.email] }),
  });

  ngOnInit(): void { this.load(); }

  get aboutArr(): FormArray<FormControl<string>> {
    return this.form.get('about') as FormArray<FormControl<string>>;
  }

  private load() {
    this.loading = true;
    this.api.get().subscribe({
      next: (p) => {
        this.aboutArr.clear();
        const lines = (p.about?.length ? p.about : ['']);
        for (const line of lines) {
          this.aboutArr.push(this.fb.nonNullable.control<string>(line ?? ''));
        }

        this.form.patchValue({
          fullName: p.fullName ?? '',
          tagline:  p.tagline ?? '',
          github:   p.github ?? '',
          linkedIn: p.linkedIn ?? '',
          instagram:p.instagram ?? '',
          email:    p.email ?? '',
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.msg.add({ severity: 'error', summary: 'Hata', detail: 'Profil yüklenemedi' });
      }
    });
  }

  addAboutLine(index?: number) {
    const i = typeof index === 'number' ? index + 1 : this.aboutArr.length;
    this.aboutArr.insert(i, this.fb.nonNullable.control<string>(''));
  }

  removeAboutLine(index: number) {
    if (this.aboutArr.length === 1) { this.aboutArr.at(0).setValue(''); return; }
    this.aboutArr.removeAt(index);
  }

  moveAbout(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= this.aboutArr.length) return;
    const a = this.aboutArr.at(index).value;
    const b = this.aboutArr.at(j).value;
    this.aboutArr.at(index).setValue(b);
    this.aboutArr.at(j).setValue(a);
  }

  trackByIndex(i: number) { return i; }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    const dto: SiteProfile = {
      fullName: v.fullName.trim(),
      tagline:  v.tagline.trim(),
      about:    this.aboutArr.value.map(s => (s || '').trim()).filter(Boolean),
      github:   v.github.trim(),
      linkedIn: v.linkedIn.trim(),
      instagram:v.instagram.trim(),
      email:    v.email.trim(),
    };

    this.saving = true;
    this.api.update(dto).subscribe({
      next: () => {
        this.saving = false;
        this.msg.add({ severity: 'success', summary: 'Kaydedildi', detail: 'Site profili güncellendi' });
        this.form.markAsPristine();
      },
      error: () => {
        this.saving = false;
        this.msg.add({ severity: 'error', summary: 'Hata', detail: 'Kayıt sırasında bir sorun oluştu' });
      }
    });
  }
}