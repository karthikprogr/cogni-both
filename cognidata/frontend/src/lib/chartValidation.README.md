# Chart Validation Logic

This module provides validation functions to ensure selected columns are compatible with chosen chart types.

## Usage

### Import the functions

```javascript
import { 
  getColumnRequirements, 
  validateColumnSelection, 
  getRequirementsSummary,
  COLUMN_TYPES 
} from './lib/chartValidation';
```

### Get requirements for a chart type

```javascript
const requirements = getColumnRequirements('scatter');
// Returns:
// {
//   min: 2,
//   max: 2,
//   types: ['numeric', 'numeric'],
//   description: 'Requires 2 numeric columns'
// }
```

### Validate column selection

```javascript
const selectedColumns = [
  { name: 'temperature', type: COLUMN_TYPES.NUMERIC },
  { name: 'humidity', type: COLUMN_TYPES.NUMERIC }
];

const result = validateColumnSelection('scatter', selectedColumns);
// Returns:
// {
//   valid: true,
//   message: 'Valid selection: 2 columns selected for scatter chart'
// }
```

### Get requirements summary

```javascript
const summary = getRequirementsSummary('3d_scatter');
// Returns: "Requires 3 numeric columns (x, y, z), optionally 1 category column"
```

## Column Types

The module supports the following column types:

- `COLUMN_TYPES.NUMERIC` - Numeric/quantitative data
- `COLUMN_TYPES.CATEGORICAL` - Categorical/qualitative data
- `COLUMN_TYPES.DATETIME` - Date/time data
- `COLUMN_TYPES.ANY` - Any type accepted

## Supported Chart Types

The validation logic supports 150+ chart types including:

### Basic Charts
- `bar` - Bar Chart (1 category + 1 numeric)
- `line` - Line Chart (1 category/datetime + 1 numeric)
- `scatter` - Scatter Plot (2 numeric)
- `pie` - Pie Chart (1 category + 1 numeric)
- `histogram` - Histogram (1 numeric)
- `box` - Box Plot (1 numeric, optionally 1 category)
- `area` - Area Chart (1 category/datetime + 1 numeric)
- `bubble` - Bubble Chart (3 numeric, optionally 1 category)

### Advanced Charts
- `3d_scatter` - 3D Scatter (3 numeric, optionally 1 category)
- `3d_surface` - 3D Surface (3 numeric)
- `parallel` - Parallel Coordinates (4-10 numeric)
- `heatmap` - Heatmap (2+ numeric)
- `correlation` - Correlation Matrix (2+ numeric)
- `sankey` - Sankey Diagram (2 category + 1 numeric)
- `treemap` - Treemap (1-3 category + 1 numeric)
- `sunburst` - Sunburst (1-3 category + 1 numeric)

### Time-Based Charts
- `timeseries` - Time Series (1 datetime + 1 numeric)
- `multi_timeseries` - Multi-Series (1 datetime + 1 category + 1+ numeric)
- `candlestick` - Candlestick (1 datetime + 4 numeric OHLC)

### And 140+ more chart types!

See `chartValidation.js` for the complete list of supported chart types and their requirements.

## Examples

### Example 1: Validating scatter plot

```javascript
const columns = [
  { name: 'x_axis', type: COLUMN_TYPES.NUMERIC },
  { name: 'y_axis', type: COLUMN_TYPES.NUMERIC }
];

const result = validateColumnSelection('scatter', columns);
console.log(result);
// { valid: true, message: 'Valid selection: 2 columns selected for scatter chart' }
```

### Example 2: Invalid selection (too few columns)

```javascript
const columns = [
  { name: 'x_axis', type: COLUMN_TYPES.NUMERIC }
];

const result = validateColumnSelection('scatter', columns);
console.log(result);
// { 
//   valid: false, 
//   message: 'Requires 2 numeric columns. You selected 1 column, but need at least 2.'
// }
```

### Example 3: Invalid selection (wrong type)

```javascript
const columns = [
  { name: 'category', type: COLUMN_TYPES.CATEGORICAL },
  { name: 'value', type: COLUMN_TYPES.NUMERIC }
];

const result = validateColumnSelection('scatter', columns);
console.log(result);
// { 
//   valid: false, 
//   message: 'Column 1 (category) must be numeric. Requires 2 numeric columns'
// }
```

### Example 4: Parallel coordinates

```javascript
const columns = Array.from({ length: 6 }, (_, i) => ({
  name: `dimension_${i + 1}`,
  type: COLUMN_TYPES.NUMERIC
}));

const result = validateColumnSelection('parallel', columns);
console.log(result);
// { valid: true, message: 'Valid selection: 6 columns selected for parallel chart' }
```

## Integration with Charts Page

This validation logic is used in the Charts page to:

1. Enable/disable the "Generate Chart" button based on valid column selection
2. Display inline error messages when column selection is incompatible
3. Show requirements hints to guide users in selecting appropriate columns

Example integration:

```javascript
const [selectedColumns, setSelectedColumns] = useState([]);
const [selectedChartType, setSelectedChartType] = useState(null);
const [validation, setValidation] = useState({ valid: false, message: '' });

// Update validation when columns or chart type changes
useEffect(() => {
  const result = validateColumnSelection(selectedChartType, selectedColumns);
  setValidation(result);
}, [selectedColumns, selectedChartType]);

// Use validation to control button state
<button 
  disabled={!validation.valid}
  onClick={handleGenerateChart}
>
  Generate Chart
</button>

// Display validation message
{!validation.valid && validation.message && (
  <div className="error-message">{validation.message}</div>
)}
```

## Testing

Unit tests are provided in `chartValidation.test.js`. The tests cover:

- All basic chart types (bar, line, scatter, pie, etc.)
- Advanced charts (3D scatter, parallel coordinates, heatmap)
- Edge cases (no selection, invalid types, too few/many columns)
- Complex charts (candlestick, sankey, timeseries)
- Error messages and validation feedback

To run tests (once test framework is configured):
```bash
npm test -- chartValidation.test.js
```
