import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ComparisonResult {
  pair: string;
  similarityPercent: string;
  vector1Preview: number[];
  vector2Preview: number[];
}

@Injectable({
  providedIn: 'root'
})
export class VectorCompareService {
  private apiUrl = `${environment.apiUrl}/vector`;

  constructor(private http: HttpClient) {}

  compareDogCat(): Observable<ComparisonResult> {
    return this.http.get<ComparisonResult>(`${this.apiUrl}/compare-dog-cat`);
  }
}
