# Chart Types Configuration

## Overview

This directory contains the configuration for all available chart types in the Charts page.

## File Structure

- `chartTypes.js` - Main configuration file with 161+ chart types organized into 20 categories

## Chart Types Data Structure

The `CHART_TYPES` constant exports an array of category objects, where each category contains:

```javascript
{
  category: string,  // Category name (e.g., "Basic Charts")
  types: [
    {
      id: string,          // Unique identifier for API calls (e.g., "bar")
      name: string,        // Display name for UI (e.g., "Bar Chart")
      description: string  // Brief explanation (e.g., "Compare values across categories")
    }
  ]
}
```

## Categories (20 total)

1. **Basic Charts** (8 types) - Fundamental chart types like bar, line, scatter, pie
2. **Distribution** (6 types) - Charts focused on data distribution visualization
3. **Hierarchical** (4 types) - Tree structures and hierarchical data
4. **Statistical** (8 types) - Statistical analysis visualizations
5. **Advanced** (10 types) - Complex 3D and specialized visualizations
6. **Time-Based** (4 types) - Temporal data visualization
7. **Specialized** (8 types) - Domain-specific chart types
8. **Comparison** (15 types) - Charts optimized for comparing values
9. **Geographic** (8 types) - Map-based visualizations
10. **3D Visualizations** (8 types) - Three-dimensional charts
11. **Matrix & Grid** (8 types) - Grid-based matrix visualizations
12. **Part-to-Whole** (8 types) - Proportional representation charts
13. **Ranking** (8 types) - Ranking and order visualization
14. **Correlation & Relationship** (8 types) - Relationship analysis charts
15. **Financial** (8 types) - Financial market charts (candlestick, OHLC, etc.)
16. **Scientific** (10 types) - Scientific and research visualizations
17. **Annotation & Text** (8 types) - Text-enhanced visualizations
18. **Animation & Interactive** (8 types) - Interactive and animated charts
19. **Uncertainty & Error** (8 types) - Uncertainty and confidence visualization
20. **Composition** (8 types) - Compositional analysis charts

**Total: 161 chart types**

## Utility Functions

### `getAllChartTypes()`
Returns a flat array of all chart types with their category included.

```javascript
import { getAllChartTypes } from './chartTypes';
const allTypes = getAllChartTypes();
// Returns: [{ id, name, description, category }, ...]
```

### `getChartTypeById(id)`
Finds a specific chart type by its ID.

```javascript
import { getChartTypeById } from './chartTypes';
const barChart = getChartTypeById('bar');
// Returns: { id: 'bar', name: 'Bar Chart', description: '...', category: 'Basic Charts' }
```

### `getCategoryByName(categoryName)`
Gets all chart types in a specific category.

```javascript
import { getCategoryByName } from './chartTypes';
const basicCharts = getCategoryByName('Basic Charts');
// Returns: { category: 'Basic Charts', types: [...] }
```

### `getChartTypeCount()`
Returns the total number of chart types available.

```javascript
import { getChartTypeCount } from './chartTypes';
const count = getChartTypeCount();
// Returns: 161
```

## Usage in Components

```javascript
import { CHART_TYPES, getChartTypeCount } from '../config/chartTypes';

function ChartTypeSelector() {
  return (
    <div>
      <h3>{getChartTypeCount()} Chart Types Available</h3>
      {CHART_TYPES.map(category => (
        <div key={category.category}>
          <h4>{category.category}</h4>
          {category.types.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} - {type.description}
            </option>
          ))}
        </div>
      ))}
    </div>
  );
}
```

## Adding New Chart Types

To add a new chart type:

1. Open `chartTypes.js`
2. Find the appropriate category or create a new one
3. Add a new type object with `id`, `name`, and `description`
4. Ensure the `id` is unique across all chart types
5. The total count will automatically update

Example:
```javascript
{
  category: "Basic Charts",
  types: [
    // ... existing types
    { 
      id: "new_chart", 
      name: "New Chart Type", 
      description: "Description of what this chart does" 
    }
  ]
}
```

## Notes

- Chart type IDs should match the backend API expectations
- Descriptions should be concise (under 100 characters)
- Categories help organize the UI - consider UX when adding new categories
- The structure is designed for easy expansion without breaking changes
