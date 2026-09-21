/**
 * Chart Types Configuration
 * 
 * Defines 150+ chart types organized into 8 categories for the Charts page.
 * Each type includes:
 * - id: unique identifier for API calls
 * - name: display name for UI
 * - description: brief explanation of chart purpose
 */

export const CHART_TYPES = [
  {
    category: "Basic Charts",
    types: [
      { id: "bar", name: "Bar Chart", description: "Compare values across categories with rectangular bars" },
      { id: "line", name: "Line Chart", description: "Show trends and changes over continuous data" },
      { id: "scatter", name: "Scatter Plot", description: "Display relationships between two numeric variables" },
      { id: "pie", name: "Pie Chart", description: "Show proportions of a whole with circular segments" },
      { id: "histogram", name: "Histogram", description: "Display distribution of a single numeric variable" },
      { id: "box", name: "Box Plot", description: "Visualize statistical distribution with quartiles" },
      { id: "area", name: "Area Chart", description: "Show cumulative totals over time or categories" },
      { id: "bubble", name: "Bubble Chart", description: "Three-variable scatter plot with sized bubbles" }
    ]
  },
  {
    category: "Distribution",
    types: [
      { id: "violin", name: "Violin Plot", description: "Combine box plot with kernel density estimation" },
      { id: "beeswarm", name: "Beeswarm Plot", description: "Show individual data points without overlap" },
      { id: "ridgeline", name: "Ridgeline Plot", description: "Compare distributions across multiple categories" },
      { id: "hexbin", name: "Hexbin Plot", description: "Density plot using hexagonal bins" },
      { id: "histogram2d", name: "2D Histogram", description: "Bivariate distribution with rectangular bins" },
      { id: "strip", name: "Strip Plot", description: "One-dimensional scatter plot showing distribution" }
    ]
  },
  {
    category: "Hierarchical",
    types: [
      { id: "treemap", name: "Treemap", description: "Nested rectangles showing hierarchical proportions" },
      { id: "sunburst", name: "Sunburst Chart", description: "Circular treemap with hierarchical rings" },
      { id: "sankey", name: "Sankey Diagram", description: "Flow diagram showing quantity distribution" },
      { id: "network", name: "Network Graph", description: "Node-link diagram showing relationships" }
    ]
  },
  {
    category: "Statistical",
    types: [
      { id: "heatmap", name: "Heatmap", description: "Color-coded matrix showing values or correlations" },
      { id: "correlation", name: "Correlation Matrix", description: "Heatmap showing variable correlations" },
      { id: "boxplot", name: "Box Plot", description: "Statistical summary with median and quartiles" },
      { id: "violin_stat", name: "Violin Plot", description: "Density plot combined with box plot features" },
      { id: "parallel", name: "Parallel Coordinates", description: "Multi-dimensional data on parallel axes" },
      { id: "radar", name: "Radar Chart", description: "Multivariate data on radial axes" },
      { id: "bullet", name: "Bullet Chart", description: "Performance measure against targets" },
      { id: "funnel", name: "Funnel Chart", description: "Show progressive reduction through stages" }
    ]
  },
  {
    category: "Advanced",
    types: [
      { id: "3d_scatter", name: "3D Scatter Plot", description: "Three-dimensional scatter visualization" },
      { id: "3d_surface", name: "3D Surface Plot", description: "Three-dimensional continuous surface" },
      { id: "waterfall", name: "Waterfall Chart", description: "Show cumulative effect of sequential values" },
      { id: "rose", name: "Rose Chart", description: "Circular chart with radial bars" },
      { id: "gantt", name: "Gantt Chart", description: "Project timeline with task durations" },
      { id: "marimekko", name: "Marimekko Chart", description: "Stacked bar with variable widths" },
      { id: "chord", name: "Chord Diagram", description: "Circular flow between entities" },
      { id: "small_multiples", name: "Small Multiples", description: "Grid of similar charts for comparison" },
      { id: "contour", name: "Contour Plot", description: "Topographic-style level curves" },
      { id: "stream", name: "Stream Graph", description: "Stacked area with flowing appearance" }
    ]
  },
  {
    category: "Time-Based",
    types: [
      { id: "timeseries", name: "Time Series", description: "Temporal data with date/time axis" },
      { id: "multi_timeseries", name: "Multi-Series", description: "Multiple time series on one chart" },
      { id: "streamgraph", name: "Stream Graph", description: "Flowing stacked area over time" },
      { id: "timeline", name: "Timeline", description: "Events plotted along time axis" }
    ]
  },
  {
    category: "Specialized",
    types: [
      { id: "table_sparklines", name: "Table with Sparklines", description: "Data table with embedded mini-charts" },
      { id: "infographic", name: "Infographic Summary", description: "Statistical summary with visual elements" },
      { id: "stacked_bar", name: "Stacked Bar Chart", description: "Bar chart with stacked segments" },
      { id: "stacked_area", name: "Stacked Area Chart", description: "Area chart with stacked series" },
      { id: "network_graph", name: "Network Graph", description: "Connected nodes showing relationships" },
      { id: "flow", name: "Flow Diagram", description: "Directional flow between categories" },
      { id: "alluvial", name: "Alluvial Diagram", description: "Flow over multiple stages or time" },
      { id: "word_cloud", name: "Word Cloud", description: "Text frequency visualization" }
    ]
  },
  {
    category: "Comparison",
    types: [
      { id: "grouped_bar", name: "Grouped Bar Chart", description: "Side-by-side bars for comparison" },
      { id: "stacked_bar_100", name: "100% Stacked Bar", description: "Stacked bars normalized to 100%" },
      { id: "diverging_bar", name: "Diverging Bar Chart", description: "Bars extending from center baseline" },
      { id: "bullet_comparison", name: "Bullet Comparison", description: "Multiple bullet charts for benchmarking" },
      { id: "slope", name: "Slope Chart", description: "Show change between two time points" },
      { id: "dumbbell", name: "Dumbbell Chart", description: "Show differences between two values" },
      { id: "range", name: "Range Plot", description: "Display min-max ranges for categories" },
      { id: "parallel_sets", name: "Parallel Sets", description: "Categorical parallel coordinates" },
      { id: "bump", name: "Bump Chart", description: "Show ranking changes over time" },
      { id: "calendar_heatmap", name: "Calendar Heatmap", description: "Values mapped to calendar grid" },
      { id: "candlestick", name: "Candlestick Chart", description: "Financial OHLC data visualization" },
      { id: "ohlc", name: "OHLC Chart", description: "Open-high-low-close bars" },
      { id: "dot_plot", name: "Dot Plot", description: "Values shown as positioned dots" },
      { id: "lollipop", name: "Lollipop Chart", description: "Dot plot with connecting lines" },
      { id: "cleveland_dot", name: "Cleveland Dot Plot", description: "Sorted dot plot for comparison" }
    ]
  },
  {
    category: "Geographic",
    types: [
      { id: "choropleth", name: "Choropleth Map", description: "Color-coded regions on map" },
      { id: "scatter_map", name: "Scatter Map", description: "Points plotted on geographic coordinates" },
      { id: "bubble_map", name: "Bubble Map", description: "Sized bubbles on geographic map" },
      { id: "heat_map", name: "Heat Map (Geographic)", description: "Density heatmap on geographic area" },
      { id: "flow_map", name: "Flow Map", description: "Directional flows between locations" },
      { id: "cartogram", name: "Cartogram", description: "Distorted map based on data values" },
      { id: "hexbin_map", name: "Hexbin Map", description: "Geographic area divided into hexagons" },
      { id: "dot_density_map", name: "Dot Density Map", description: "Each dot represents data quantity" }
    ]
  },
  {
    category: "3D Visualizations",
    types: [
      { id: "3d_bar", name: "3D Bar Chart", description: "Three-dimensional bar visualization" },
      { id: "3d_line", name: "3D Line Chart", description: "Three-dimensional line plot" },
      { id: "3d_scatter_advanced", name: "3D Scatter (Advanced)", description: "Enhanced 3D scatter with features" },
      { id: "3d_surface_advanced", name: "3D Surface (Advanced)", description: "Detailed 3D surface with contours" },
      { id: "3d_mesh", name: "3D Mesh Plot", description: "Three-dimensional mesh surface" },
      { id: "3d_ribbon", name: "3D Ribbon Plot", description: "Three-dimensional ribbon visualization" },
      { id: "3d_cone", name: "3D Cone Plot", description: "Vector field visualization" },
      { id: "3d_streamtube", name: "3D Streamtube", description: "Flow tubes in 3D space" }
    ]
  },
  {
    category: "Matrix & Grid",
    types: [
      { id: "matrix_plot", name: "Matrix Plot", description: "Grid-based data matrix" },
      { id: "adjacency_matrix", name: "Adjacency Matrix", description: "Network connections in matrix form" },
      { id: "confusion_matrix", name: "Confusion Matrix", description: "Classification results matrix" },
      { id: "co_occurrence", name: "Co-occurrence Matrix", description: "Item co-occurrence patterns" },
      { id: "paired_matrix", name: "Paired Matrix", description: "Pairwise relationships grid" },
      { id: "scatterplot_matrix", name: "Scatterplot Matrix", description: "Grid of scatter plots" },
      { id: "correlogram", name: "Correlogram", description: "Correlation visualization grid" },
      { id: "mosaic", name: "Mosaic Plot", description: "Multi-way contingency table" }
    ]
  },
  {
    category: "Part-to-Whole",
    types: [
      { id: "donut", name: "Donut Chart", description: "Pie chart with center hole" },
      { id: "nested_donut", name: "Nested Donut", description: "Multiple concentric donut rings" },
      { id: "pie_of_pie", name: "Pie of Pie", description: "Detailed breakout from main pie" },
      { id: "waffle", name: "Waffle Chart", description: "Grid of squares showing proportions" },
      { id: "pictogram", name: "Pictogram", description: "Icon-based proportion visualization" },
      { id: "unit_chart", name: "Unit Chart", description: "Individual units representing values" },
      { id: "arc_diagram", name: "Arc Diagram", description: "Proportions as arcs or semi-circles" },
      { id: "nightingale", name: "Nightingale Rose", description: "Radial stacked bar chart" }
    ]
  },
  {
    category: "Ranking",
    types: [
      { id: "bar_rank", name: "Ranked Bar Chart", description: "Bars sorted by value" },
      { id: "horizontal_bar_rank", name: "Horizontal Ranked Bar", description: "Horizontal bars sorted by value" },
      { id: "lollipop_rank", name: "Ranked Lollipop", description: "Lollipop chart sorted by value" },
      { id: "slope_rank", name: "Slope Ranking", description: "Rank changes between periods" },
      { id: "bump_rank", name: "Bump Ranking", description: "Rank evolution over time" },
      { id: "table_rank", name: "Ranked Table", description: "Tabular ranking with visuals" },
      { id: "dot_rank", name: "Dot Ranking", description: "Dots positioned by rank" },
      { id: "bar_race", name: "Bar Chart Race", description: "Animated ranking over time" }
    ]
  },
  {
    category: "Correlation & Relationship",
    types: [
      { id: "scatter_correlation", name: "Correlation Scatter", description: "Scatter with correlation metrics" },
      { id: "bubble_correlation", name: "Correlation Bubble", description: "Three-variable correlation" },
      { id: "connected_scatter", name: "Connected Scatter", description: "Scatter points with connecting lines" },
      { id: "regression", name: "Regression Plot", description: "Scatter with regression line" },
      { id: "residual", name: "Residual Plot", description: "Model residuals visualization" },
      { id: "qq", name: "Q-Q Plot", description: "Quantile-quantile comparison" },
      { id: "lag", name: "Lag Plot", description: "Time series autocorrelation" },
      { id: "joint", name: "Joint Plot", description: "Scatter with marginal distributions" }
    ]
  },
  {
    category: "Financial",
    types: [
      { id: "candlestick_advanced", name: "Candlestick (Advanced)", description: "Enhanced OHLC with indicators" },
      { id: "renko", name: "Renko Chart", description: "Price movement in fixed increments" },
      { id: "kagi", name: "Kagi Chart", description: "Time-independent price chart" },
      { id: "point_figure", name: "Point & Figure", description: "X and O price chart" },
      { id: "mountain", name: "Mountain Chart", description: "Area chart for stock prices" },
      { id: "volume", name: "Volume Chart", description: "Trading volume bars" },
      { id: "range_bars", name: "Range Bars", description: "Price range-based bars" },
      { id: "heikin_ashi", name: "Heikin-Ashi", description: "Modified candlestick chart" }
    ]
  },
  {
    category: "Scientific",
    types: [
      { id: "quiver", name: "Quiver Plot", description: "2D vector field visualization" },
      { id: "streamline", name: "Streamline Plot", description: "Flow field streamlines" },
      { id: "dendrogram", name: "Dendrogram", description: "Hierarchical clustering tree" },
      { id: "phylogenetic", name: "Phylogenetic Tree", description: "Evolutionary relationship tree" },
      { id: "polar_scatter", name: "Polar Scatter", description: "Scatter in polar coordinates" },
      { id: "ternary", name: "Ternary Plot", description: "Three-component composition plot" },
      { id: "smith_chart", name: "Smith Chart", description: "Impedance/admittance visualization" },
      { id: "manhattan", name: "Manhattan Plot", description: "Genomic association visualization" },
      { id: "volcano", name: "Volcano Plot", description: "Statistical significance vs magnitude" },
      { id: "bland_altman", name: "Bland-Altman Plot", description: "Method comparison agreement" }
    ]
  },
  {
    category: "Annotation & Text",
    types: [
      { id: "text_scatter", name: "Text Scatter", description: "Scatter plot with text labels" },
      { id: "annotated_heatmap", name: "Annotated Heatmap", description: "Heatmap with cell values" },
      { id: "label_cloud", name: "Label Cloud", description: "Text labels sized by frequency" },
      { id: "annotated_timeline", name: "Annotated Timeline", description: "Timeline with text annotations" },
      { id: "callout_chart", name: "Callout Chart", description: "Chart with highlighted annotations" },
      { id: "text_table", name: "Text Table", description: "Formatted data table" },
      { id: "markdown_report", name: "Markdown Report", description: "Rich text data report" },
      { id: "kpi_card", name: "KPI Card", description: "Single metric with context" }
    ]
  },
  {
    category: "Animation & Interactive",
    types: [
      { id: "animated_scatter", name: "Animated Scatter", description: "Time-animated scatter plot" },
      { id: "animated_bar", name: "Animated Bar", description: "Bar chart with time animation" },
      { id: "animated_bubble", name: "Animated Bubble", description: "Bubble chart with animation" },
      { id: "slider_chart", name: "Slider Chart", description: "Chart with time slider control" },
      { id: "brushable_scatter", name: "Brushable Scatter", description: "Interactive selection scatter" },
      { id: "zoomable_timeseries", name: "Zoomable Time Series", description: "Time series with zoom controls" },
      { id: "linked_views", name: "Linked Views", description: "Multiple synchronized charts" },
      { id: "dashboard_grid", name: "Dashboard Grid", description: "Grid of coordinated charts" }
    ]
  },
  {
    category: "Uncertainty & Error",
    types: [
      { id: "error_bar", name: "Error Bar Chart", description: "Values with error ranges" },
      { id: "confidence_interval", name: "Confidence Interval", description: "Mean with confidence bands" },
      { id: "fan_chart", name: "Fan Chart", description: "Forecast with uncertainty" },
      { id: "prediction_band", name: "Prediction Band", description: "Model predictions with bands" },
      { id: "quantile_plot", name: "Quantile Plot", description: "Multiple quantile curves" },
      { id: "bootstrap_dist", name: "Bootstrap Distribution", description: "Resampled distribution" },
      { id: "ensemble_plot", name: "Ensemble Plot", description: "Multiple model predictions" },
      { id: "spaghetti_plot", name: "Spaghetti Plot", description: "Multiple trajectory lines" }
    ]
  },
  {
    category: "Composition",
    types: [
      { id: "stacked_bar_diverging", name: "Diverging Stacked Bar", description: "Stacked bars from center" },
      { id: "stacked_area_100", name: "100% Stacked Area", description: "Normalized stacked area" },
      { id: "spine_chart", name: "Spine Chart", description: "Vertical stacked segments" },
      { id: "mekko", name: "Mekko Chart", description: "Variable-width stacked bars" },
      { id: "waterfall_variance", name: "Variance Waterfall", description: "Contribution to variance" },
      { id: "decomposition", name: "Decomposition Chart", description: "Additive/multiplicative breakdown" },
      { id: "bridge", name: "Bridge Chart", description: "Value change components" },
      { id: "tornado", name: "Tornado Chart", description: "Sensitivity analysis bars" }
    ]
  }
];

/**
 * Get all chart types as a flat array
 */
export const getAllChartTypes = () => {
  return CHART_TYPES.flatMap(category => 
    category.types.map(type => ({
      ...type,
      category: category.category
    }))
  );
};

/**
 * Get chart type by ID
 */
export const getChartTypeById = (id) => {
  for (const category of CHART_TYPES) {
    const type = category.types.find(t => t.id === id);
    if (type) {
      return {
        ...type,
        category: category.category
      };
    }
  }
  return null;
};

/**
 * Get category by name
 */
export const getCategoryByName = (categoryName) => {
  return CHART_TYPES.find(cat => cat.category === categoryName);
};

/**
 * Get total count of chart types
 */
export const getChartTypeCount = () => {
  return CHART_TYPES.reduce((sum, category) => sum + category.types.length, 0);
};
