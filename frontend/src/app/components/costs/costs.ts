import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cost-simulator',
  standalone: true,
  imports: [CommonModule],
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

  @Output() calculateModel = new EventEmitter<string>();

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

  calculateCostFor(modelKey: string, emit: boolean = true) {
    // Use local inputs to compute cost so the component is self-contained.
    const prompt = this.promptTokens || 0;
    const response = this.responseTokens || 0;

    const pricing = this.modelPricing?.[modelKey];
    if (!pricing) {
      this.calculatedCosts[modelKey] = 0;
      if (emit) this.calculateModel.emit(modelKey);
      return;
    }

    const inputCost = (prompt / 1000) * (pricing.inputPrice || 0);
    const outputCost = (response / 1000) * (pricing.outputPrice || 0);
    const totalCost = inputCost + outputCost;

    // Store the result on the shared object (parent sees updates because it's passed by reference)
    this.calculatedCosts[modelKey] = totalCost;

    // Emit the model key for backwards compatibility (parent can react if needed)
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
   * Provide a color (CSS gradient) for a given modelKey. Simple heuristics:
   * - 'gpt' models: blue
   * - 'claude' models: purple/pink
   * - otherwise: green
   */
  barColor(key: string): string {
    const k = (key || '').toLowerCase();
    if (k.includes('gpt')) return 'linear-gradient(90deg,#60a5fa,#3b82f6)';
    if (k.includes('claude')) return 'linear-gradient(90deg,#f472b6,#a78bfa)';
    if (k.includes('fine') || k.includes('vector')) return 'linear-gradient(90deg,#34d399,#10b981)';
    return 'linear-gradient(90deg,#60a5fa,#3b82f6)';
  }
}
