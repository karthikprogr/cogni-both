# DatasetDropdown Component

A dropdown selector component for switching between available datasets in the CogniData Dashboard.

## Features

- **Dataset Selection**: Displays all available datasets with metadata (rows, columns, file size, upload date)
- **Active Dataset Indication**: Clearly shows which dataset is currently active
- **Loading States**: Shows loading spinners during data fetching and dataset switching
- **Error Handling**: Graceful error handling with user-friendly messages
- **Keyboard Navigation**: Full keyboard support with arrow keys and Enter/Space
- **Accessibility**: Screen reader support with proper ARIA attributes
- **Responsive Design**: Adapts to different screen sizes
- **Dark Theme**: Matches existing Dashboard styling

## Components

### DatasetDropdown.jsx
Main dropdown component with:
- Trigger button showing current dataset
- Dropdown menu with dataset list
- Loading and empty states
- Click outside to close functionality

### DatasetItem.jsx  
Individual dataset list item with:
- Dataset name and metadata display
- Active state indication
- Hover effects
- Click handling

### useDatasetSwitcher.js
Custom hook providing:
- Dataset list fetching with caching
- Dataset switching functionality  
- Loading state management
- Error handling and retry logic

## Usage

```jsx
import DatasetDropdown from '../components/DatasetDropdown';
import { useDatasetSwitcher } from '../hooks/useDatasetSwitcher';

function MyComponent() {
  const {
    datasets,
    activeDataset,
    loading,
    switching,
    switchDataset,
    hasDatasets
  } = useDatasetSwitcher();

  const handleDatasetSelect = async (dataset) => {
    const success = await switchDataset(dataset.name);
    if (success) {
      // Handle successful switch
    }
  };

  return (
    <DatasetDropdown
      datasets={datasets}
      activeDataset={activeDataset}
      onDatasetSelect={handleDatasetSelect}
      loading={loading || switching}
      disabled={!hasDatasets || switching}
    />
  );
}
```

## API Dependencies

- `GET /api/data/datasets` - List available datasets
- `POST /api/data/datasets/switch?name={name}` - Switch active dataset
- `GET /api/data/info` - Get current dataset info

## Styling

The component uses inline styles matching the existing Dashboard theme:
- Dark background (#18181b)
- Purple accent color (#6366f1) 
- Gray text colors for hierarchy
- Smooth transitions and hover effects
- Consistent with existing UI components

## Accessibility

- Full keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion support
- Proper focus indicators