import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'https://theaiworld.onrender.com/vector';

  constructor(private http: HttpClient) {}

  compareDogCat(): Observable<ComparisonResult> {
    return this.http.get<ComparisonResult>(`${this.apiUrl}/compare-dog-cat`);
  }
}
