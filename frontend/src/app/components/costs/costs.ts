import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cost-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './costs.html',
  styleUrls: ['./costs.css']
})
export class CostSimulatorComponent implements OnChanges {
  @Input() promptTokens: number = 0;
  @Input() responseTokens: number = 0;
  @Input() totalTokens: number = 0;

  @Input() modelPricing: any = {};
  @Input() modelKeys: string[] = [];
  @Input() calculatedCosts: { [key: string]: number } = {};

  // Filter properties
  filterModel: string = '';
  filterMaxInputPrice: number | null = null;
  filterMaxEstCost: number | null = null;

  // Sort properties
  sortKey: string = 'cost'; // Default sort by estimated cost
  sortDir: 'asc' | 'desc' = 'desc';

  // Toggle for knowing if we are showing real vs example data
  get isExample(): boolean {
    return !this.promptTokens && !this.responseTokens;
  }

  @Output() calculateModel = new EventEmitter<string>();

  constructor(private router: Router) {}

  // Recalculate when inputs change so costs appear immediately
  ngOnChanges(changes: SimpleChanges) {
    // If token counts or pricing/keys changed, recalc all costs
    if (
      changes['promptTokens'] ||
      changes['responseTokens'] ||
      changes['totalTokens'] ||
      changes['modelPricing'] ||
      changes['modelKeys']
    ) {
      this.calculateAllCosts();
    }
  }

  calculateAllCosts() {
    const keys = (this.modelKeys && this.modelKeys.length > 0)
      ? this.modelKeys
      : Object.keys(this.modelPricing || {});

    this.calculatedCosts = this.calculatedCosts || {};

    for (const k of keys) {
      this.calculateCostFor(k, false);
    }
  }

  get filteredKeys(): string[] {
    let keys = (this.modelKeys && this.modelKeys.length > 0)
      ? this.modelKeys
      : Object.keys(this.modelPricing || {});

    if (this.filterModel) {
      const term = this.filterModel.toLowerCase();
      keys = keys.filter(k => (this.modelPricing[k]?.name || k).toLowerCase().includes(term));
    }
    
    if (this.filterMaxInputPrice !== null) {
      keys = keys.filter(k => (this.modelPricing[k]?.inputPrice || 0) <= this.filterMaxInputPrice!);
    }
    
    if (this.filterMaxEstCost !== null) {
      keys = keys.filter(k => {
        const c = this.calculatedCosts[k] || 0;
        return c <= this.filterMaxEstCost!;
      });
    }

    // Apply Sorting
    keys.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (this.sortKey) {
        case 'name':
          valA = (this.modelPricing[a]?.name || a).toLowerCase();
          valB = (this.modelPricing[b]?.name || b).toLowerCase();
          break;
        case 'input':
          valA = this.modelPricing[a]?.inputPrice || 0;
          valB = this.modelPricing[b]?.inputPrice || 0;
          break;
        case 'output':
          valA = this.modelPricing[a]?.outputPrice || 0;
          valB = this.modelPricing[b]?.outputPrice || 0;
          break;
        case 'cost':
        default:
          valA = this.calculatedCosts[a] || 0;
          valB = this.calculatedCosts[b] || 0;
          break;
      }

      const order = this.sortDir === 'asc' ? 1 : -1;
      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });

    return keys;
  }

  toggleSort(key: string) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'desc'; // Default to desc for new keys
    }
  }

  calculateCostFor(modelKey: string, emit: boolean = true) {
    // If no real tokens yet, use an example of 1,000 input and 1,000 output to give a balanced comparison
    const prompt = this.isExample ? 1000 : (this.promptTokens || 0);
    const response = this.isExample ? 1000 : (this.responseTokens || 0);

    const pricing = this.modelPricing?.[modelKey];
    if (!pricing) {
      this.calculatedCosts[modelKey] = 0;
      if (emit) this.calculateModel.emit(modelKey);
      return;
    }

    // Pricing is per 1 Million tokens
    const inputCost = (prompt / 1000000) * (pricing.inputPrice || 0);
    const outputCost = (response / 1000000) * (pricing.outputPrice || 0);
    const totalCost = inputCost + outputCost;

    // Store the result on the shared object
    this.calculatedCosts[modelKey] = totalCost;

    if (emit) this.calculateModel.emit(modelKey);
  }

  /**
   * Return the maximum computed cost across all models (used for relative bars)
   */
  getMaxCost(): number {
    if (!this.calculatedCosts) return 0;
    const vals = Object.values(this.calculatedCosts).filter(v => typeof v === 'number');
    if (!vals.length) return 0;
    return Math.max(...vals);
  }

  /**
   * Percentage width (0-100) for the mini bar for a given model key
   */
  percentFor(key: string): number {
    const max = this.getMaxCost();
    if (!max || !this.calculatedCosts) return 0;
    const v = this.calculatedCosts[key] || 0;

    if (v <= 0) return 0;

    // Logarithmic scaling to compress outliers while keeping ratios meaningful
    const scaled = (Math.log(v + 1) / Math.log(max + 1)) * 100;

    // Ensure small-but-nonzero values are visible: minimum width when cost > 0
    const minVisible = 6; // percent
    return Math.min(100, Math.max(minVisible, Math.round(scaled)));
  }

  /**
   * Provide a color (CSS gradient) according to the Model Tier
   * Economic (Green), Balanced (Yellow), Enterprise (Orange), Premium (Red).
   */
  costColor(key: string): string {
    const pricing = this.modelPricing?.[key];
    if (!pricing) return 'linear-gradient(90deg, #94a3b8, #64748b)';
    
    // Evaluate based on 1M combined tokens just for tier classification
    const benchmarkCost = (pricing.inputPrice || 0) + (pricing.outputPrice || 0);

    if (benchmarkCost <= 2) return 'linear-gradient(90deg, #10b981, #059669)'; // Green (Cheap)
    if (benchmarkCost <= 10) return 'linear-gradient(90deg, #f59e0b, #d97706)'; // Yellow (Moderate)
    if (benchmarkCost <= 40) return 'linear-gradient(90deg, #f97316, #ea580c)'; // Orange (High)
    return 'linear-gradient(90deg, #ef4444, #dc2626)'; // Red (Premium)
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
