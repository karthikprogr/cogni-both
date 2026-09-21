/**
 * Chart Column Validation Logic
 * 
 * Provides validation functions to ensure selected columns are compatible
 * with the chosen chart type. Each chart type has specific requirements
 * for minimum/maximum columns and data types.
 */

/**
 * Column type constants
 */
export const COLUMN_TYPES = {
  NUMERIC: 'numeric',
  CATEGORICAL: 'categorical',
  DATETIME: 'datetime',
  ANY: 'any'
};

/**
 * Get column requirements for a specific chart type
 * 
 * @param {string} chartType - The chart type ID (e.g., "scatter", "bar", "3d_scatter")
 * @returns {Object} Requirements object with min, max columns and type constraints
 *   - min: minimum number of columns required
 *   - max: maximum number of columns allowed (null = unlimited)
 *   - types: array of column type requirements per column position
 *   - description: human-readable description of requirements
 */
export const getColumnRequirements = (chartType) => {
  const requirements = {
    // Basic Charts
    bar: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    line: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category/datetime column and 1 numeric column'
    },
    scatter: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 numeric columns'
    },
    pie: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    histogram: {
      min: 1,
      max: 1,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 numeric column'
    },
    box: {
      min: 1,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 numeric column, optionally 1 category column'
    },
    area: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category/datetime column and 1 numeric column'
    },
    bubble: {
      min: 3,
      max: 4,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 2-3 numeric columns (x, y, size), optionally 1 category column'
    },

    // Distribution Charts
    violin: {
      min: 1,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 numeric column, optionally 1 category column'
    },
    beeswarm: {
      min: 1,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 numeric column, optionally 1 category column'
    },
    ridgeline: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 numeric column and 1 category column'
    },
    hexbin: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 numeric columns'
    },
    histogram2d: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 numeric columns'
    },
    strip: {
      min: 1,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 numeric column, optionally 1 category column'
    },

    // Hierarchical Charts
    treemap: {
      min: 2,
      max: 4,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1-3 category columns (hierarchy) and 1 numeric column'
    },
    sunburst: {
      min: 2,
      max: 4,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1-3 category columns (hierarchy) and 1 numeric column'
    },
    sankey: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns (source, target) and 1 numeric column (value)'
    },
    network: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns (nodes), optionally 1 numeric column (weight)'
    },

    // Statistical Charts
    heatmap: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 or more numeric columns'
    },
    correlation: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 or more numeric columns'
    },
    boxplot: {
      min: 1,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 numeric column, optionally 1 category column'
    },
    violin_stat: {
      min: 1,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 numeric column, optionally 1 category column'
    },
    parallel: {
      min: 4,
      max: 10,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 4-10 numeric columns'
    },
    radar: {
      min: 3,
      max: 8,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 3-8 numeric columns'
    },
    bullet: {
      min: 2,
      max: 5,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 2-5 numeric columns (value, target, ranges)'
    },
    funnel: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },

    // Advanced Visualizations
    '3d_scatter': {
      min: 3,
      max: 4,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 3 numeric columns (x, y, z), optionally 1 category column'
    },
    '3d_surface': {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 3 numeric columns (x, y, z)'
    },
    waterfall: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    rose: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    gantt: {
      min: 3,
      max: 4,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.DATETIME, COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 task column, 2 datetime columns (start, end), optionally duration'
    },
    marimekko: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns and 1 numeric column'
    },
    chord: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns (source, target) and 1 numeric column'
    },
    small_multiples: {
      min: 3,
      max: 4,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 2 numeric columns and 1 category column (facet)'
    },
    contour: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 3 numeric columns (x, y, z)'
    },
    stream: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column, 1 category column, and 1 numeric column'
    },

    // Time-Based Charts
    timeseries: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column and 1 numeric column'
    },
    multi_timeseries: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column, 1 category column, and 1+ numeric columns'
    },
    streamgraph: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column, 1 category column, and 1 numeric column'
    },
    timeline: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.DATETIME, COLUMN_TYPES.DATETIME],
      description: 'Requires 1 event column and 1-2 datetime columns (start, end)'
    },

    // Specialized Charts
    table_sparklines: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.ANY],
      description: 'Requires 2 or more columns (any type)'
    },
    infographic: {
      min: 1,
      max: null,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 or more numeric columns'
    },
    stacked_bar: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column, 1 group column, and 1 numeric column'
    },
    stacked_area: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category/datetime column, 1 group column, and 1 numeric column'
    },
    network_graph: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns (nodes), optionally 1 numeric column (weight)'
    },
    flow: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns (source, target) and 1 numeric column'
    },
    alluvial: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2+ category columns (stages) and 1 numeric column'
    },
    word_cloud: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 text column and 1 numeric column (frequency)'
    },

    // Comparison Charts
    grouped_bar: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns and 1 numeric column'
    },
    stacked_bar_100: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column, 1 group column, and 1 numeric column'
    },
    diverging_bar: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1-2 numeric columns'
    },
    bullet_comparison: {
      min: 3,
      max: 5,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 2-4 numeric columns'
    },
    slope: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 2 numeric columns (start, end)'
    },
    dumbbell: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 2 numeric columns (low, high)'
    },
    range: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 2 numeric columns (min, max)'
    },
    parallel_sets: {
      min: 2,
      max: 6,
      types: [COLUMN_TYPES.ANY],
      description: 'Requires 2-6 categorical columns'
    },
    bump: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column, 1 time/period column, and 1 numeric column (rank)'
    },
    calendar_heatmap: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column and 1 numeric column'
    },
    candlestick: {
      min: 5,
      max: 5,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column and 4 numeric columns (open, high, low, close)'
    },
    ohlc: {
      min: 5,
      max: 5,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column and 4 numeric columns (open, high, low, close)'
    },
    dot_plot: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    lollipop: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    cleveland_dot: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },

    // Geographic Charts
    choropleth: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 location column, 1 numeric column, optionally 1 geo-code column'
    },
    scatter_map: {
      min: 3,
      max: 4,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 2 numeric columns (lat, lon), optionally size and category columns'
    },
    bubble_map: {
      min: 4,
      max: 5,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 2 numeric columns (lat, lon), 1 size column, optionally category'
    },
    heat_map: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 numeric columns (lat, lon) and 1 intensity column'
    },
    flow_map: {
      min: 5,
      max: 6,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 4 numeric columns (origin lat/lon, dest lat/lon) and 1 value column'
    },
    cartogram: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 location column and 1 numeric column'
    },
    hexbin_map: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 numeric columns (lat, lon) and 1 value column'
    },
    dot_density_map: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 numeric columns (lat, lon), optionally 1 count column'
    },

    // 3D Visualizations
    '3d_bar': {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns and 1 numeric column'
    },
    '3d_line': {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 3 numeric columns (x, y, z)'
    },
    '3d_scatter_advanced': {
      min: 3,
      max: 5,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 3 numeric columns (x, y, z), optionally size and category'
    },
    '3d_surface_advanced': {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 3 numeric columns (x, y, z)'
    },
    '3d_mesh': {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 3 numeric columns (x, y, z)'
    },
    '3d_ribbon': {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 3 numeric columns (x, y, z)'
    },
    '3d_cone': {
      min: 6,
      max: 6,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 6 numeric columns (x, y, z, u, v, w for vector field)'
    },
    '3d_streamtube': {
      min: 6,
      max: 6,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 6 numeric columns (x, y, z, u, v, w for flow field)'
    },

    // Matrix & Grid Charts
    matrix_plot: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.ANY],
      description: 'Requires 2 or more columns (any type)'
    },
    adjacency_matrix: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns (nodes), optionally 1 numeric column (weight)'
    },
    confusion_matrix: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY],
      description: 'Requires 2 category columns (actual, predicted)'
    },
    co_occurrence: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY],
      description: 'Requires 2 category columns'
    },
    paired_matrix: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 or more numeric columns'
    },
    scatterplot_matrix: {
      min: 3,
      max: 8,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 3-8 numeric columns'
    },
    correlogram: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 3 or more numeric columns'
    },
    mosaic: {
      min: 2,
      max: 4,
      types: [COLUMN_TYPES.ANY],
      description: 'Requires 2-4 categorical columns'
    },

    // Part-to-Whole Charts
    donut: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    nested_donut: {
      min: 3,
      max: 4,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2-3 category columns (hierarchy) and 1 numeric column'
    },
    pie_of_pie: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    waffle: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    pictogram: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    unit_chart: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    arc_diagram: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns, optionally 1 numeric column'
    },
    nightingale: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },

    // Ranking Charts
    bar_rank: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    horizontal_bar_rank: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    lollipop_rank: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    slope_rank: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 2 numeric columns (two time points)'
    },
    bump_rank: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column, 1 time column, and 1 numeric column'
    },
    table_rank: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1+ numeric columns'
    },
    dot_rank: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column and 1 numeric column'
    },
    bar_race: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category column, 1 time column, and 1 numeric column'
    },

    // Correlation & Relationship Charts
    scatter_correlation: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 2 numeric columns, optionally 1 category column'
    },
    bubble_correlation: {
      min: 3,
      max: 4,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 3 numeric columns (x, y, size), optionally 1 category'
    },
    connected_scatter: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 2 numeric columns, optionally 1 sequence column'
    },
    regression: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 numeric columns'
    },
    residual: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 numeric columns (predicted, actual)'
    },
    qq: {
      min: 1,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1-2 numeric columns'
    },
    lag: {
      min: 1,
      max: 1,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 numeric time series column'
    },
    joint: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 numeric columns'
    },

    // Financial Charts
    candlestick_advanced: {
      min: 5,
      max: 7,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime and 4 numeric (OHLC), optionally 2 indicators'
    },
    renko: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column and 1 price column'
    },
    kagi: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column and 1 price column'
    },
    point_figure: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column and 1 price column'
    },
    mountain: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column and 1 price column'
    },
    volume: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime column and 1 volume column'
    },
    range_bars: {
      min: 4,
      max: 4,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime and 3 numeric (high, low, close)'
    },
    heikin_ashi: {
      min: 5,
      max: 5,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime and 4 numeric (OHLC)'
    },

    // Scientific Charts
    quiver: {
      min: 4,
      max: 4,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 4 numeric columns (x, y, u, v vectors)'
    },
    streamline: {
      min: 4,
      max: 4,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 4 numeric columns (x, y, u, v flow field)'
    },
    dendrogram: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 or more numeric columns for clustering'
    },
    phylogenetic: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns (parent, child), optionally distance'
    },
    polar_scatter: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 2 numeric columns (angle, radius), optionally category'
    },
    ternary: {
      min: 3,
      max: 4,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 3 numeric columns (a, b, c components), optionally category'
    },
    smith_chart: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 numeric columns (real, imaginary impedance)'
    },
    manhattan: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category (chromosome), 2 numeric (position, p-value)'
    },
    volcano: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 2 numeric columns (fold-change, p-value), optionally labels'
    },
    bland_altman: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 numeric columns (method 1, method 2)'
    },

    // Annotation & Text Charts
    text_scatter: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 2 numeric columns (x, y) and 1 text column'
    },
    annotated_heatmap: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 or more numeric columns'
    },
    label_cloud: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 text column and 1 numeric column (frequency)'
    },
    annotated_timeline: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 datetime, 1 numeric, and 1 text annotation column'
    },
    callout_chart: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 category, 1 numeric, optionally 1 annotation column'
    },
    text_table: {
      min: 1,
      max: null,
      types: [COLUMN_TYPES.ANY],
      description: 'Requires 1 or more columns (any type)'
    },
    markdown_report: {
      min: 1,
      max: null,
      types: [COLUMN_TYPES.ANY],
      description: 'Requires 1 or more columns (any type)'
    },
    kpi_card: {
      min: 1,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 1-3 numeric columns (value, target, previous)'
    },

    // Animation & Interactive Charts
    animated_scatter: {
      min: 3,
      max: 4,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY, COLUMN_TYPES.ANY],
      description: 'Requires 2 numeric, 1 time column, optionally 1 category'
    },
    animated_bar: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 category, 1 numeric, and 1 time column'
    },
    animated_bubble: {
      min: 4,
      max: 5,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 2 numeric, 1 size, 1 time, optionally category'
    },
    slider_chart: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 1 category/datetime, 1 numeric, 1 time slider column'
    },
    brushable_scatter: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.ANY],
      description: 'Requires 2 numeric columns, optionally 1 category'
    },
    zoomable_timeseries: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime and 1 numeric column'
    },
    linked_views: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.ANY],
      description: 'Requires 3 or more columns for linked visualizations'
    },
    dashboard_grid: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.ANY],
      description: 'Requires 2 or more columns for dashboard panels'
    },

    // Uncertainty & Error Charts
    error_bar: {
      min: 3,
      max: 4,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category, 1 value, 1-2 error columns'
    },
    confidence_interval: {
      min: 3,
      max: 4,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 x-axis, 1 mean, 2 confidence bound columns'
    },
    fan_chart: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime, 1 forecast, and uncertainty percentiles'
    },
    prediction_band: {
      min: 4,
      max: 4,
      types: [COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires x, predicted, lower bound, upper bound'
    },
    quantile_plot: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 x-axis and multiple quantile columns'
    },
    bootstrap_dist: {
      min: 1,
      max: 1,
      types: [COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 numeric column for bootstrap sampling'
    },
    ensemble_plot: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 x-axis and multiple model prediction columns'
    },
    spaghetti_plot: {
      min: 2,
      max: null,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 x-axis and multiple trajectory columns'
    },

    // Composition Charts
    stacked_bar_diverging: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category, 1 group, and 1 numeric column'
    },
    stacked_area_100: {
      min: 3,
      max: null,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 x-axis, 1 group, and 1 numeric column'
    },
    spine_chart: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 category and 1 numeric column'
    },
    mekko: {
      min: 3,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 2 category columns and 1 numeric column'
    },
    waterfall_variance: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 component column and 1 numeric variance column'
    },
    decomposition: {
      min: 2,
      max: 5,
      types: [COLUMN_TYPES.DATETIME, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 datetime and 1-4 component columns'
    },
    bridge: {
      min: 2,
      max: 2,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 component column and 1 numeric change column'
    },
    tornado: {
      min: 2,
      max: 3,
      types: [COLUMN_TYPES.ANY, COLUMN_TYPES.NUMERIC, COLUMN_TYPES.NUMERIC],
      description: 'Requires 1 variable column and 1-2 numeric impact columns'
    }
  };

  // Return default requirements if chart type not found
  return requirements[chartType] || {
    min: 1,
    max: null,
    types: [COLUMN_TYPES.ANY],
    description: 'Requires at least 1 column'
  };
};

/**
 * Validate if selected columns are compatible with chart type
 * 
 * @param {string} chartType - The chart type ID
 * @param {Array<{name: string, type: string}>} selectedColumns - Array of selected column objects
 * @returns {Object} Validation result
 *   - valid: boolean indicating if selection is valid
 *   - message: string describing validation result or error
 */
export const validateColumnSelection = (chartType, selectedColumns) => {
  if (!chartType) {
    return {
      valid: false,
      message: 'Please select a chart type first'
    };
  }

  if (!selectedColumns || selectedColumns.length === 0) {
    return {
      valid: false,
      message: 'Please select at least one column'
    };
  }

  const requirements = getColumnRequirements(chartType);
  const columnCount = selectedColumns.length;

  // Check minimum columns
  if (columnCount < requirements.min) {
    return {
      valid: false,
      message: `${requirements.description}. You selected ${columnCount} column${columnCount !== 1 ? 's' : ''}, but need at least ${requirements.min}.`
    };
  }

  // Check maximum columns
  if (requirements.max !== null && columnCount > requirements.max) {
    return {
      valid: false,
      message: `${requirements.description}. You selected ${columnCount} column${columnCount !== 1 ? 's' : ''}, but maximum allowed is ${requirements.max}.`
    };
  }

  // Check column types if specific types are required
  if (requirements.types && requirements.types.length > 0) {
    const typeRequirements = requirements.types.slice(0, columnCount);
    
    for (let i = 0; i < typeRequirements.length; i++) {
      const requiredType = typeRequirements[i];
      const column = selectedColumns[i];
      
      if (!column) continue;
      
      // Skip 'any' type requirements
      if (requiredType === COLUMN_TYPES.ANY) continue;
      
      // Check if column type matches requirement
      const columnType = column.type || COLUMN_TYPES.ANY;
      
      if (requiredType === COLUMN_TYPES.NUMERIC && columnType !== COLUMN_TYPES.NUMERIC) {
        return {
          valid: false,
          message: `Column ${i + 1} (${column.name}) must be numeric. ${requirements.description}`
        };
      }
      
      if (requiredType === COLUMN_TYPES.CATEGORICAL && columnType === COLUMN_TYPES.NUMERIC) {
        return {
          valid: false,
          message: `Column ${i + 1} (${column.name}) must be categorical. ${requirements.description}`
        };
      }
      
      if (requiredType === COLUMN_TYPES.DATETIME && columnType !== COLUMN_TYPES.DATETIME) {
        return {
          valid: false,
          message: `Column ${i + 1} (${column.name}) must be a datetime column. ${requirements.description}`
        };
      }
    }
  }

  return {
    valid: true,
    message: `Valid selection: ${columnCount} column${columnCount !== 1 ? 's' : ''} selected for ${chartType} chart`
  };
};

/**
 * Get a human-readable summary of column requirements
 * 
 * @param {string} chartType - The chart type ID
 * @returns {string} Human-readable requirements description
 */
export const getRequirementsSummary = (chartType) => {
  const requirements = getColumnRequirements(chartType);
  return requirements.description;
};
