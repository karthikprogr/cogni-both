import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Charts from './Charts';
import ChartDatasetSelector from '../components/ChartDatasetSelector';

// Mock the API client
const mockApiGet = vi.fn(() => Promise.resolve({ data: { datasets: [] } }));
vi.mock('../api/client', () => ({
  api: {
    get: mockApiGet
  }
}));

// Mock react-plotly.js
vi.mock('react-plotly.js', () => ({
  default: () => null
}));

beforeEach(() => {
  mockApiGet.mockClear();
});

describe('Charts Page - DisplayModeToggle', () => {
  it('should render DisplayModeToggle component in header', () => {
    render(<Charts />);
    
    // Check if both toggle buttons exist
    expect(screen.getByText('Single Chart')).toBeInTheDocument();
    expect(screen.getByText('Multi-Chart')).toBeInTheDocument();
  });

  it('should default to Single Chart mode', () => {
    render(<Charts />);
    
    const singleButton = screen.getByText('Single Chart').closest('button');
    const multiButton = screen.getByText('Multi-Chart').closest('button');
    
    // Single should be active (has specific background color)
    expect(singleButton).toHaveStyle({ background: 'rgba(99,102,241,.15)' });
    // Multi should be inactive
    expect(multiButton).toHaveStyle({ background: 'rgba(255,255,255,.04)' });
  });

  it('should toggle between single and multi mode when clicked', () => {
    render(<Charts />);
    
    const singleButton = screen.getByText('Single Chart').closest('button');
    const multiButton = screen.getByText('Multi-Chart').closest('button');
    
    // Initially Single is active
    expect(singleButton).toHaveStyle({ background: 'rgba(99,102,241,.15)' });
    
    // Click Multi-Chart button
    fireEvent.click(multiButton);
    
    // Now Multi should be active
    expect(multiButton).toHaveStyle({ background: 'rgba(99,102,241,.15)' });
    expect(singleButton).toHaveStyle({ background: 'rgba(255,255,255,.04)' });
    
    // Click Single Chart button again
    fireEvent.click(singleButton);
    
    // Single should be active again
    expect(singleButton).toHaveStyle({ background: 'rgba(99,102,241,.15)' });
    expect(multiButton).toHaveStyle({ background: 'rgba(255,255,255,.04)' });
  });

  it('should disable toggle when no charts are displayed', () => {
    render(<Charts />);
    
    const singleButton = screen.getByText('Single Chart').closest('button');
    const multiButton = screen.getByText('Multi-Chart').closest('button');
    
    // Both buttons should be disabled when charts array is empty
    expect(singleButton).toBeDisabled();
    expect(multiButton).toBeDisabled();
    
    // Check for disabled styling
    expect(singleButton).toHaveStyle({ opacity: '0.5' });
    expect(multiButton).toHaveStyle({ opacity: '0.5' });
  });

  it('should display icons for each mode', () => {
    render(<Charts />);
    
    // Check for icon emojis
    const singleButton = screen.getByText('Single Chart').closest('button');
    const multiButton = screen.getByText('Multi-Chart').closest('button');
    
    expect(singleButton).toHaveTextContent('📊');
    expect(multiButton).toHaveTextContent('📈');
  });

  it('should be positioned in page header area', () => {
    render(<Charts />);
    
    const header = screen.getByText('Charts').closest('div').parentElement;
    const toggleContainer = screen.getByText('Single Chart').closest('div').parentElement;
    
    // The toggle should be within the header
    expect(header).toContainElement(toggleContainer);
  });
});

describe('Charts Page - DatasetSelector Integration', () => {
  it('should render DatasetSelector component', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        datasets: [
          { name: 'dataset1', rows: 100, columns: 5 },
          { name: 'dataset2', rows: 200, columns: 10 }
        ]
      }
    });

    render(<Charts />);
    
    // Wait for datasets to load
    await waitFor(() => {
      expect(screen.getByText('Select a dataset...')).toBeInTheDocument();
    });
  });

  it('should fetch datasets on mount', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        datasets: [{ name: 'test-dataset' }]
      }
    });

    render(<Charts />);
    
    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/data/datasets');
    });
  });

  it('should show error message when dataset fetch fails', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    render(<Charts />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load datasets/i)).toBeInTheDocument();
    });
  });

  it('should update UI when dataset is selected', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        datasets: [{ name: 'my-dataset' }]
      }
    });

    render(<Charts />);
    
    // Wait for datasets to load
    await waitFor(() => {
      expect(screen.getByText('Select a dataset...')).toBeInTheDocument();
    });

    // Click the selector to open dropdown
    const selector = screen.getByText('Select a dataset...').closest('button');
    fireEvent.click(selector);

    // Wait for dropdown to appear and click dataset
    await waitFor(() => {
      const datasetOption = screen.getByText('my-dataset');
      fireEvent.click(datasetOption);
    });

    // Check that the dataset is now selected
    await waitFor(() => {
      expect(screen.getByText('Dataset selected: my-dataset')).toBeInTheDocument();
    });
  });

  it('should disable dataset selector while loading', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: { datasets: [] }
    });

    render(<Charts />);
    
    await waitFor(() => {
      const selector = screen.getByText('Select a dataset...').closest('button');
      // Should be enabled when not loading
      expect(selector).not.toBeDisabled();
    });
  });
});

describe('ChartDatasetSelector Component', () => {
  it('should render with placeholder text when no dataset selected', () => {
    const onChange = vi.fn();
    render(
      <ChartDatasetSelector 
        datasets={['dataset1', 'dataset2']} 
        selected={null} 
        onChange={onChange}
      />
    );
    
    expect(screen.getByText('Select a dataset...')).toBeInTheDocument();
  });

  it('should render selected dataset name', () => {
    const onChange = vi.fn();
    render(
      <ChartDatasetSelector 
        datasets={['dataset1', 'dataset2']} 
        selected="dataset1" 
        onChange={onChange}
      />
    );
    
    expect(screen.getByText('dataset1')).toBeInTheDocument();
  });

  it('should show "No datasets available" message when datasets array is empty', () => {
    const onChange = vi.fn();
    render(
      <ChartDatasetSelector 
        datasets={[]} 
        selected={null} 
        onChange={onChange}
      />
    );
    
    expect(screen.getByText(/No datasets available/i)).toBeInTheDocument();
  });

  it('should call onChange when dataset is selected', () => {
    const onChange = vi.fn();
    render(
      <ChartDatasetSelector 
        datasets={['dataset1', 'dataset2']} 
        selected={null} 
        onChange={onChange}
      />
    );
    
    // Open dropdown
    const trigger = screen.getByText('Select a dataset...').closest('button');
    fireEvent.click(trigger);
    
    // Click dataset
    const dataset = screen.getByText('dataset1');
    fireEvent.click(dataset);
    
    expect(onChange).toHaveBeenCalledWith('dataset1');
  });

  it('should be disabled when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <ChartDatasetSelector 
        datasets={['dataset1']} 
        selected={null} 
        onChange={onChange}
        disabled={true}
      />
    );
    
    const trigger = screen.getByText('Select a dataset...').closest('button');
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveStyle({ opacity: '0.5' });
  });

  it('should not open dropdown when disabled', () => {
    const onChange = vi.fn();
    render(
      <ChartDatasetSelector 
        datasets={['dataset1']} 
        selected={null} 
        onChange={onChange}
        disabled={true}
      />
    );
    
    const trigger = screen.getByText('Select a dataset...').closest('button');
    fireEvent.click(trigger);
    
    // Dropdown should not appear
    expect(screen.queryByText('Select Dataset')).not.toBeInTheDocument();
  });

  it('should display database icon', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ChartDatasetSelector 
        datasets={['dataset1']} 
        selected={null} 
        onChange={onChange}
      />
    );
    
    // Check for Database icon (lucide-react)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should highlight selected dataset in dropdown', () => {
    const onChange = vi.fn();
    render(
      <ChartDatasetSelector 
        datasets={['dataset1', 'dataset2']} 
        selected="dataset1" 
        onChange={onChange}
      />
    );
    
    // Open dropdown
    const trigger = screen.getByText('dataset1').closest('button');
    fireEvent.click(trigger);
    
    // Check if selected dataset has checkmark
    const selectedOption = screen.getAllByText(/dataset1/)[1]; // Second one is in dropdown
    expect(selectedOption.textContent).toContain('✓');
  });

  it('should close dropdown after selection', () => {
    const onChange = vi.fn();
    render(
      <ChartDatasetSelector 
        datasets={['dataset1', 'dataset2']} 
        selected={null} 
        onChange={onChange}
      />
    );
    
    // Open dropdown
    const trigger = screen.getByText('Select a dataset...').closest('button');
    fireEvent.click(trigger);
    
    // Verify dropdown is open
    expect(screen.getByText('Select Dataset')).toBeInTheDocument();
    
    // Click dataset
    const dataset = screen.getByText('dataset1');
    fireEvent.click(dataset);
    
    // Dropdown header should be gone
    expect(screen.queryByText('Select Dataset')).not.toBeInTheDocument();
  });
});
