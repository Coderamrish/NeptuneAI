DROP TABLE IF EXISTS oceanbench_data;
CREATE TABLE oceanbench_data (
    "file" TEXT,
    "date" TEXT, 
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ocean" TEXT,
    "profiler_code" BIGINT,
    "institution_code" TEXT,
    "date_update" TEXT,
    "wmo" BIGINT,
    "cyc" BIGINT,
    "institution" TEXT,
    "dac" TEXT,
    "profiler" TEXT,
    "Month" TEXT,
    "Region" TEXT
);
CREATE INDEX idx_month ON oceanbench_data("Month");
CREATE INDEX idx_region ON oceanbench_data("Region");
CREATE INDEX idx_date ON oceanbench_data("date");
CREATE INDEX idx_profiler ON oceanbench_data("profiler");
CREATE INDEX idx_institution ON oceanbench_data("institution");
CREATE INDEX idx_ocean ON oceanbench_data("ocean");
CREATE INDEX idx_lat_lon ON oceanbench_data("latitude", "longitude");
COMMENT ON TABLE oceanbench_data IS 'Oceanographic profiler deployment metadata from various institutions';
COMMENT ON COLUMN oceanbench_data."file" IS 'Path to the original NetCDF profiler data file';
COMMENT ON COLUMN oceanbench_data."date" IS 'Date and time of profiler measurement';
COMMENT ON COLUMN oceanbench_data."profiler" IS 'Type and description of profiling instrument used';
COMMENT ON COLUMN oceanbench_data."institution" IS 'Institution responsible for the profiler deployment';
COMMENT ON COLUMN oceanbench_data."Month" IS 'Month name extracted from date for temporal analysis';
COMMENT ON COLUMN oceanbench_data."Region" IS 'Ocean region classification for spatial analysis';