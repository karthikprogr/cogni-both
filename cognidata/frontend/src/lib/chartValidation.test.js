/**
 * Unit Tests for Chart Validation Logic
 * Task 4.1: Create column compatibility validation logic
 */

import { 
  getColumnRequirements, 
  validateColumnSelection, 
  getRequirementsSummary,
  COLUMN_TYPES 
} from './chartValidation';

describe('Chart Validation Logic', () => {
  describe('getColumnRequirements', () => {
    test('should return correct requirements for scatter chart', () => {
      const requirements = getColumnRequirements('scatter');
      expect(requirements.min).toBe(2);
      expect(requirements.max).toBe(2);
      expect(requirements.types).toContain(COLUMN_TYPES.NUMERIC);
      expect(requirements.description).toBeTruthy();
    });

    test('should return correct requirements for 3d scatter chart', () => {
      const requirements = getColumnRequirements('3d_scatter');
      expect(requirements.min).toBe(3);
      expect(requirements.max).toBe(4);
      expect(requirements.types[0]).toBe(COLUMN_TYPES.NUMERIC);
      expect(requirements.types[1]).toBe(COLUMN_TYPES.NUMERIC);
      expect(requirements.types[2]).toBe(COLUMN_TYPES.NUMERIC);
    });

    test('should return correct requirements for parallel coordinates', () => {
      const requirements = getColumnRequirements('parallel');
      expect(requirements.min).toBe(4);
      expect(requirements.max).toBe(10);
      expect(requirements.types[0]).toBe(COLUMN_TYPES.NUMERIC);
    });

    test('should return correct requirements for histogram', () => {
      const requirements = getColumnRequirements('histogram');
      expect(requirements.min).toBe(1);
      expect(requirements.max).toBe(1);
      expect(requirements.types[0]).toBe(COLUMN_TYPES.NUMERIC);
    });

    test('should return correct requirements for bar chart', () => {
      const requirements = getColumnRequirements('bar');
      expect(requirements.min).toBe(2);
      expect(requirements.max).toBe(2);
      expect(requirements.types[0]).toBe(COLUMN_TYPES.ANY);
      expect(requirements.types[1]).toBe(COLUMN_TYPES.NUMERIC);
    });

    test('should return correct requirements for heatmap (unlimited columns)', () => {
      const requirements = getColumnRequirements('heatmap');
      expect(requirements.min).toBe(2);
      expect(requirements.max).toBeNull();
      expect(requirements.types[0]).toBe(COLUMN_TYPES.NUMERIC);
    });

    test('should return default requirements for unknown chart type', () => {
      const requirements = getColumnRequirements('unknown_chart_type');
      expect(requirements.min).toBe(1);
      expect(requirements.max).toBeNull();
      expect(requirements.types[0]).toBe(COLUMN_TYPES.ANY);
    });
  });

  describe('validateColumnSelection', () => {
    test('should return invalid if no chart type selected', () => {
      const result = validateColumnSelection(null, [
        { name: 'col1', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('select a chart type');
    });

    test('should return invalid if no columns selected', () => {
      const result = validateColumnSelection('scatter', []);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least one column');
    });

    test('should return valid for scatter with 2 numeric columns', () => {
      const result = validateColumnSelection('scatter', [
        { name: 'col1', type: COLUMN_TYPES.NUMERIC },
        { name: 'col2', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(true);
      expect(result.message).toContain('Valid selection');
    });

    test('should return invalid for scatter with 1 column (too few)', () => {
      const result = validateColumnSelection('scatter', [
        { name: 'col1', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 2');
    });

    test('should return invalid for scatter with 3 columns (too many)', () => {
      const result = validateColumnSelection('scatter', [
        { name: 'col1', type: COLUMN_TYPES.NUMERIC },
        { name: 'col2', type: COLUMN_TYPES.NUMERIC },
        { name: 'col3', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('maximum allowed is 2');
    });

    test('should return invalid for scatter with non-numeric columns', () => {
      const result = validateColumnSelection('scatter', [
        { name: 'col1', type: COLUMN_TYPES.NUMERIC },
        { name: 'col2', type: COLUMN_TYPES.CATEGORICAL }
      ]);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('must be numeric');
    });

    test('should return valid for 3d scatter with 3 numeric columns', () => {
      const result = validateColumnSelection('3d_scatter', [
        { name: 'x', type: COLUMN_TYPES.NUMERIC },
        { name: 'y', type: COLUMN_TYPES.NUMERIC },
        { name: 'z', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(true);
    });

    test('should return valid for 3d scatter with 4 columns (3 numeric + 1 category)', () => {
      const result = validateColumnSelection('3d_scatter', [
        { name: 'x', type: COLUMN_TYPES.NUMERIC },
        { name: 'y', type: COLUMN_TYPES.NUMERIC },
        { name: 'z', type: COLUMN_TYPES.NUMERIC },
        { name: 'category', type: COLUMN_TYPES.CATEGORICAL }
      ]);
      expect(result.valid).toBe(true);
    });

    test('should return valid for parallel coordinates with 5 numeric columns', () => {
      const columns = Array.from({ length: 5 }, (_, i) => ({
        name: `col${i + 1}`,
        type: COLUMN_TYPES.NUMERIC
      }));
      const result = validateColumnSelection('parallel', columns);
      expect(result.valid).toBe(true);
    });

    test('should return invalid for parallel coordinates with 3 columns (too few)', () => {
      const columns = Array.from({ length: 3 }, (_, i) => ({
        name: `col${i + 1}`,
        type: COLUMN_TYPES.NUMERIC
      }));
      const result = validateColumnSelection('parallel', columns);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 4');
    });

    test('should return invalid for parallel coordinates with 11 columns (too many)', () => {
      const columns = Array.from({ length: 11 }, (_, i) => ({
        name: `col${i + 1}`,
        type: COLUMN_TYPES.NUMERIC
      }));
      const result = validateColumnSelection('parallel', columns);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('maximum allowed is 10');
    });

    test('should return valid for histogram with 1 numeric column', () => {
      const result = validateColumnSelection('histogram', [
        { name: 'values', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(true);
    });

    test('should return valid for bar chart with category + numeric', () => {
      const result = validateColumnSelection('bar', [
        { name: 'category', type: COLUMN_TYPES.CATEGORICAL },
        { name: 'value', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(true);
    });

    test('should return valid for heatmap with many numeric columns', () => {
      const columns = Array.from({ length: 20 }, (_, i) => ({
        name: `col${i + 1}`,
        type: COLUMN_TYPES.NUMERIC
      }));
      const result = validateColumnSelection('heatmap', columns);
      expect(result.valid).toBe(true);
    });

    test('should handle columns without type property (default to ANY)', () => {
      const result = validateColumnSelection('bar', [
        { name: 'category' },  // no type specified
        { name: 'value', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(true);
    });
  });

  describe('getRequirementsSummary', () => {
    test('should return description for scatter chart', () => {
      const summary = getRequirementsSummary('scatter');
      expect(summary).toBeTruthy();
      expect(summary).toContain('2');
      expect(summary).toContain('numeric');
    });

    test('should return description for 3d scatter chart', () => {
      const summary = getRequirementsSummary('3d_scatter');
      expect(summary).toBeTruthy();
      expect(summary).toContain('3');
      expect(summary).toContain('numeric');
    });

    test('should return description for parallel coordinates', () => {
      const summary = getRequirementsSummary('parallel');
      expect(summary).toBeTruthy();
      expect(summary).toContain('4');
      expect(summary).toContain('10');
    });

    test('should return description for unknown chart type', () => {
      const summary = getRequirementsSummary('unknown_chart');
      expect(summary).toBeTruthy();
      expect(summary).toContain('at least 1');
    });
  });

  describe('Edge Cases', () => {
    test('should handle null selectedColumns', () => {
      const result = validateColumnSelection('scatter', null);
      expect(result.valid).toBe(false);
    });

    test('should handle undefined selectedColumns', () => {
      const result = validateColumnSelection('scatter', undefined);
      expect(result.valid).toBe(false);
    });

    test('should handle empty string chart type', () => {
      const result = validateColumnSelection('', [
        { name: 'col1', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(false);
    });

    test('should provide informative messages for validation failures', () => {
      const result = validateColumnSelection('scatter', [
        { name: 'col1', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.message).toContain('scatter');
      expect(result.message).toContain('1 column');
      expect(result.message).toContain('at least 2');
    });
  });

  describe('Complex Chart Types', () => {
    test('should validate candlestick with 5 columns (datetime + OHLC)', () => {
      const result = validateColumnSelection('candlestick', [
        { name: 'date', type: COLUMN_TYPES.DATETIME },
        { name: 'open', type: COLUMN_TYPES.NUMERIC },
        { name: 'high', type: COLUMN_TYPES.NUMERIC },
        { name: 'low', type: COLUMN_TYPES.NUMERIC },
        { name: 'close', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(true);
    });

    test('should validate sankey with 3 columns (source, target, value)', () => {
      const result = validateColumnSelection('sankey', [
        { name: 'source', type: COLUMN_TYPES.CATEGORICAL },
        { name: 'target', type: COLUMN_TYPES.CATEGORICAL },
        { name: 'value', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(true);
    });

    test('should validate timeseries with datetime + numeric', () => {
      const result = validateColumnSelection('timeseries', [
        { name: 'date', type: COLUMN_TYPES.DATETIME },
        { name: 'value', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(true);
    });

    test('should invalidate timeseries without datetime column', () => {
      const result = validateColumnSelection('timeseries', [
        { name: 'x', type: COLUMN_TYPES.NUMERIC },
        { name: 'y', type: COLUMN_TYPES.NUMERIC }
      ]);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('datetime');
    });
  });
});
