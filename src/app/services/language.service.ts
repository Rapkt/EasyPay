import{Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class LanguageService {
  private translations = signal<Record<string, any>>({});

  currentLang = signal<string>('en');

  constructor(private http: HttpClient) {
    this.setLanguage('en');
  }
  setLanguage(lang: string) :void{
    this.http.get<Record<string, any>>(`/i18n/${lang}.json`).subscribe(data => {
      this.translations.set(data);
      this.currentLang.set(lang);
    });
  }
  t(key: string, params?: Record<string, string | number>): string {
    const value = key.split('.').reduce((obj, k) => obj?.[k], this.translations() as any);
    if (!value) return key;

    if (params) {
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
        value
      );
    }
    return value;
  }

}
