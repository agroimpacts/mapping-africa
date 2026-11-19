/* pmtiles and protocol, UMD build*/
const { PMTiles, Protocol } = window.pmtiles;

let map;
let layers = {};  // key -> {sourceId, fillLayerId, lineLayerId, sourceLayerName}
let protocol;     // hold new Protocol()

/*detect source layer for pmtiles*/ 
// cache layer ids per pmtile so only fetch metadata once
const sourceLayerCache = new Map();

async function detectSourceLayer(url) {
  if (sourceLayerCache.has(url)) return sourceLayerCache.get(url);

  const p = new PMTiles(url);
  // share instance with the protocol/renderer cache for performance
  if (protocol && typeof protocol.add === 'function') protocol.add(p);

  const md = await p.getMetadata().catch(() => null);
  const candidate =
    md?.vector_layers?.[0]?.id ||       // tippecanoe layer id
    md?.name ||                    // generic name field
    'tiles';                       // fallback
  sourceLayerCache.set(url, candidate);
  return candidate;
}

/* pmtiles sources (from config.js) */
const pmTilesSources = window.MA_CONFIG?.pmTilesSources;

/* Country view (from config.js) */
const countryViews = window.MA_CONFIG?.countryViews;

/* landcover sources (from config.js) */
const landcoverSources = window.MA_CONFIG?.landcoverSources;

/* Default Settings (from config.js) */
const DEFAULT_COUNTRY = window.MA_CONFIG?.defaultCountry; 
const DEFAULT_YEAR = window.MA_CONFIG?.defaultYear; 

/* ===== URL deep linking ===== */
const urlParams = new URLSearchParams(window.location.search);

const requestedCountry = urlParams.get('country');
const requestedYear = urlParams.get('year');

const validCountry = requestedCountry &&
    countryViews[requestedCountry]
        ? requestedCountry
        : DEFAULT_COUNTRY;

const validYear = requestedYear &&
    pmTilesSources?.[validCountry]?.[requestedYear]
        ? requestedYear
        : null;

function getUrlNumber(name, fallback, min, max) {
    const raw = urlParams.get(name);
    if (raw === null || raw.trim() === '') return fallback;

    const value = Number(raw);
    return Number.isFinite(value) && value >= min && value <= max
        ? value
        : fallback;
}

const initialCenter = [
    getUrlNumber('lon', 27.8, -180, 180),
    getUrlNumber('lat', -13.1, -90, 90)
];

const initialZoom = getUrlNumber('zoom', 5.5, 0, 22);

/* Maptiler base map */
const maptiler_apiKey= window.MAPTILER_APIKEY;
const maptiler = `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${maptiler_apiKey}`;

/* ===== Basemaps: EOX Sentinel-2 Cloudless (by year) + MapTiler from zoom 14 ===== */
const S2_CONFIG = window.MA_CONFIG?.s2cloudless;
const S2_YEARS = S2_CONFIG?.years ?? [];
const MAPTILER_MIN_ZOOM = window.MA_CONFIG?.maptilerMinZoom ?? 14;
const S2_SOURCE_ID = 'basemap-s2';
const S2_LAYER_ID = 'basemap-s2';
const MAPTILER_SOURCE_ID = 'basemap-maptiler';
const MAPTILER_LAYER_ID = 'basemap-maptiler';

// Ending each basemap credit with this exact string keeps the basemap credit first and MapLibre
// last; with no basemap shown, MapLibre still appears on its own.
const MAPLIBRE_ATTRIBUTION = '<a href="https://maplibre.org/" target="_blank">MapLibre</a>';

// User's basemap choice (kept for the session)
let s2On = true;        // Sentinel-2 checkbox
let maptilerOn = true;  // MapTiler checkbox: on = switch to MapTiler from MAPTILER_MIN_ZOOM up

const pickS2Year = (year) => (S2_YEARS.includes(year) ? year : null);

// Start on the deep-linked year, else the latest year of the starting country
const initialCountryYears = listYearsForCountry(validCountry);
let basemapYear =
  pickS2Year(validYear || initialCountryYears[initialCountryYears.length - 1]) ??
  S2_YEARS[S2_YEARS.length - 1];

function s2SourceSpec(year) {
  return {
    type: 'raster',
    tiles: [S2_CONFIG.urlTemplate.replace('{year}', year)],
    tileSize: 256,
    maxzoom: S2_CONFIG.maxzoom ?? 16,
    attribution: `${year} <a href="https://s2maps.eu" target="_blank" rel="noopener">Sentinel-2 cloudless</a> by EOX IT Services GmbH (Contains modified Copernicus Sentinel data ${year}) | ${MAPLIBRE_ATTRIBUTION}`
  };
}

function s2LayerSpec(visible) {
  return {
    id: S2_LAYER_ID,
    type: 'raster',
    source: S2_SOURCE_ID,
    layout: { visibility: visible ? 'visible' : 'none' }
  };
}

const s2Label = (year) => `${year} Sentinel-2 Cloudless Basemap`;

// Swap the Sentinel-2 mosaic to another year. Source is re-added (not setTiles) so the
// footer attribution picks up the new year.
function setBasemapYear(year) {
  const y = pickS2Year(year);
  if (!y || y === basemapYear) return;
  basemapYear = y;

  const visible = map.getLayoutProperty(S2_LAYER_ID, 'visibility') !== 'none';
  if (map.getLayer(S2_LAYER_ID)) map.removeLayer(S2_LAYER_ID);
  if (map.getSource(S2_SOURCE_ID)) map.removeSource(S2_SOURCE_ID);
  map.addSource(S2_SOURCE_ID, s2SourceSpec(y));
  map.addLayer(s2LayerSpec(visible), MAPTILER_LAYER_ID);  // stay below MapTiler and data layers

  const lbl = document.querySelector('label[for="layer-s2"]');
  if (lbl) lbl.textContent = s2Label(y);
}

function setLayerVisible(id, visible) {
  const v = visible ? 'visible' : 'none';
  if (map.getLayer(id) && map.getLayoutProperty(id, 'visibility') !== v) {
    map.setLayoutProperty(id, 'visibility', v);
  }
}

// Apply the basemap choice for the current zoom. Hidden layers are not requested and not
// credited, so the footer only shows the basemap on screen.
function syncBasemaps() {
  const zoomedIn = map.getZoom() >= MAPTILER_MIN_ZOOM;
  const maptilerActive = maptilerOn && zoomedIn;
  const s2Active = s2On && !maptilerActive;

  setLayerVisible(MAPTILER_LAYER_ID, maptilerActive);
  setLayerVisible(S2_LAYER_ID, s2Active);

  const s2Cb = document.getElementById('layer-s2');
  if (s2Cb) s2Cb.checked = s2Active;
  const mtCb = document.getElementById('layer-maptiler');
  if (mtCb) mtCb.checked = maptilerOn;
  const mtRow = document.getElementById('layer-maptiler-row');
  if (mtRow) mtRow.style.display = zoomedIn ? '' : 'none';
}

/* ===== UI State ===== */
let activeCountry = null;          // current selected country for Year panel
let fieldBoundaryVisible = false;  // changed to false for Tanzania default
let landcoverVisible = false;      // global landcover toggle (for active country)



/* ===== Layer helpers ===== */
function layerKey(country, layerType, year) {
  return `${country}-${layerType}-${year}`;
}

async function addLayer(country, layerType, year) {
  // resolve URL from pmTilesSources (all countries now use { year: url } format)
  const entry = pmTilesSources[country];
  const sourceUrl = entry?.[year];
  if (!sourceUrl) {
    throw new Error(`Missing source URL for ${country} ${year ?? ''}`);
  }

  const key = layerKey(country, layerType, year);
  if (layers[key]) return; 

  const sourceId = `src-${key}`;
  const fillLayerId = `fill-${key}`;
  const lineLayerId = `line-${key}`;

  try {
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, { type: 'vector', url: `pmtiles://${sourceUrl}` });
    }
    const srcLayer = await detectSourceLayer(sourceUrl);

    if (!map.getLayer(fillLayerId)) {
      map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        'source-layer': srcLayer,
        paint: { 'fill-color': 'rgba(0,0,0,0)', 'fill-outline-color': 'rgba(0,0,0,0)' },
        layout: { visibility: fieldBoundaryVisible ? 'visible' : 'none' }
      });
    }
    if (!map.getLayer(lineLayerId)) {
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        'source-layer': srcLayer,
        paint: { 'line-color': 'lightblue', 'line-width': 1 },
        layout: { visibility: fieldBoundaryVisible ? 'visible' : 'none' }
      });
    }
    layers[key] = { sourceId, fillLayerId, lineLayerId, sourceLayerName: srcLayer };
  } catch (err) {
    console.error(`Error creating ${layerType} layer for ${country} ${year ?? ''}:`, err);
  }
}

function removeLayer(country, layerType, year) {
  const key = layerKey(country, layerType, year);
  const entry = layers[key];
  if (!entry) return;

  if (map.getLayer(entry.lineLayerId)) map.removeLayer(entry.lineLayerId);
  if (map.getLayer(entry.fillLayerId)) map.removeLayer(entry.fillLayerId);
  if (map.getSource(entry.sourceId))   map.removeSource(entry.sourceId);
  delete layers[key];
}

function setFieldBoundaryVisibility(visible) {
  fieldBoundaryVisible = visible;
  Object.values(layers).forEach(({ fillLayerId, lineLayerId }) => {
    if (map.getLayer(fillLayerId)) map.setLayoutProperty(fillLayerId, 'visibility', visible ? 'visible' : 'none');
    if (map.getLayer(lineLayerId)) map.setLayoutProperty(lineLayerId, 'visibility', visible ? 'visible' : 'none');
  });
}

// remember the last URL used per country
const landcoverUrlCache = new Map();  // key: country, val: cogUrl

function toggleLandcoverForCountry(country, on, year = null) {
  if (!country) return;
  const entry = landcoverSources[country];
  if (!entry) return;

  // If target year not specified, use the latest available year
  const availableYears = Object.keys(entry).sort();
  const targetYear = year || availableYears[availableYears.length - 1];
  const rawUrl = entry[targetYear];
  if (!rawUrl) return;

  // build a COG styled URL. 
  const cogUrl = `cog://${rawUrl}`;

  const sourceId = `landcover-${country}`;
  const layerId  = sourceId;

  if (on) {
    const prev = landcoverUrlCache.get(country);

    // only replace when URL changed
    if (prev && prev !== cogUrl) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    }

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, { type: 'raster', url: cogUrl, tileSize: 256, minzoom: 0, 
        maxzoom: 15 });
    }
    if (!map.getLayer(layerId)) {
      map.addLayer({ id: layerId, type: 'raster', source: sourceId,
        minzoom: 0,
        maxzoom: 22,
        paint: { 'raster-fade-duration': 0 }
      });
    }

    landcoverUrlCache.set(country, cogUrl);
  } else {
    if (map.getLayer(layerId))  map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
    landcoverUrlCache.delete(country); 
  }
}


/* Country add/remove  */
async function addCountryBase(country) {
  const entry = pmTilesSources[country];
  if (!entry) return;
}

function removeCountryAll(country) {
  const entry = pmTilesSources[country];
  if (!entry) return;

  // Remove all year layers for the country
  Object.keys(entry).forEach(yr => removeLayer(country, 'pmtiles', yr));

  // remove landcover for that country
  toggleLandcoverForCountry(country, false);
}

/* ===== Year button ===== */
function listYearsForCountry(country) {
  const pmEntry = pmTilesSources?.[country];
  const lcEntry = landcoverSources?.[country];
  
  // Combine years from both pmtiles and landcover sources
  const yearsSet = new Set();
  if (pmEntry && typeof pmEntry === 'object') {
    Object.keys(pmEntry).forEach(yr => yearsSet.add(yr));
  }
  if (lcEntry && typeof lcEntry === 'object') {
    Object.keys(lcEntry).forEach(yr => yearsSet.add(yr));
  }
  
  return Array.from(yearsSet).sort();
}

function yearLayerKey(country, year) {
  return `${country}-pmtiles-${year}`;
}

function yearLayerExists(country, year) {
  return !!layers[yearLayerKey(country, year)];
}

// Check if country has landcover but no pmtiles (landcover-only country)
function isLandcoverOnlyCountry(country) {
  return landcoverSources?.[country] && !pmTilesSources?.[country];
}

async function addYearLayer(country, year) {
  // Only add pmtiles layer if the country has pmtiles data
  if (pmTilesSources?.[country]?.[year]) {
    await addLayer(country, 'pmtiles', year);
  }
  
  // For landcover-only countries, also enable landcover
  if (isLandcoverOnlyCountry(country)) {
    landcoverVisible = true;
    toggleLandcoverForCountry(country, true, year);
    const lc = document.getElementById('layer-landcover');
    if (lc) lc.checked = true;
  }
}

function removeYearLayer(country, year) {
  // Only remove pmtiles layer if the country has pmtiles data
  if (pmTilesSources?.[country]?.[year]) {
    removeLayer(country, 'pmtiles', year);
  }
  
  // For landcover-only countries, also disable landcover
  if (isLandcoverOnlyCountry(country)) {
    toggleLandcoverForCountry(country, false);
    const lc = document.getElementById('layer-landcover');
    if (lc) lc.checked = false;
  }
}

let defaultsApplied = false;

let firstInit = true; 

function flyToCountry(country, opts = {}) {
  if (firstInit) { firstInit = false; return; } // keep initial map center/zoom
  const view = countryViews[country];
  if (!view) return;
  map.flyTo({ center: view.center, zoom: view.zoom, speed: 1.5 });
}

/* ===== UI: build Country / Year / Layer panels ===== */
async function buildUI() {
  const toolbar = document.getElementById('toolbar');

  // Panels
  const countryPanel = document.createElement('div');
  countryPanel.className = 'toolbar-panel';
  const yearPanel = document.createElement('div');
  yearPanel.className = 'toolbar-panel';
  const layerPanel = document.createElement('div');
  layerPanel.className = 'toolbar-panel';

  // Buttons
  const countryBtn = document.createElement('button');
  countryBtn.className = 'toolbar-btn';
  countryBtn.textContent = 'Country';
  countryBtn.addEventListener('click', () => {
    const show = countryPanel.style.display !== 'block';
    countryPanel.style.display = show ? 'block' : 'none';
    yearPanel.style.display = 'none';
    layerPanel.style.display = 'none';
  });

  const yearBtn = document.createElement('button');
  yearBtn.className = 'toolbar-btn';
  yearBtn.textContent = 'Year';
  yearBtn.addEventListener('click', () => {
    populateYearPanel(yearPanel);
    const show = yearPanel.style.display !== 'block';
    yearPanel.style.display = show ? 'block' : 'none';
    countryPanel.style.display = 'none';
    layerPanel.style.display = 'none';
  });

  const layerBtn = document.createElement('button');
  layerBtn.className = 'toolbar-btn';
  layerBtn.textContent = 'Layer';
  layerBtn.addEventListener('click', () => {
    const show = layerPanel.style.display !== 'block';
    layerPanel.style.display = show ? 'block' : 'none';
    countryPanel.style.display = 'none';
    yearPanel.style.display = 'none';
  });

  // Mount buttons
  toolbar.appendChild(countryBtn);
  toolbar.appendChild(yearBtn);
  toolbar.appendChild(layerBtn);

  /* ===== Current zoom readout ===== */
  const zoomReadout = document.createElement('span');
  zoomReadout.className = 'toolbar-btn zoom-readout';
  const updateZoom = () => {
    zoomReadout.textContent = `Zoom: ${map.getZoom().toFixed(2)}`;
  };
  map.on('zoom', updateZoom);
  map.on('zoom', syncBasemaps);  // auto-switch to MapTiler at MAPTILER_MIN_ZOOM

  // When zooming in past MAPTILER_MIN_ZOOM, swap the Year panel for the Layer panel so the
  // basemap choice is visible. Fires only on the crossing, not on every zoom event.
  let wasZoomedIn = map.getZoom() >= MAPTILER_MIN_ZOOM;
  map.on('zoom', () => {
    const zoomedIn = map.getZoom() >= MAPTILER_MIN_ZOOM;
    if (zoomedIn && !wasZoomedIn) {
      yearPanel.style.display = 'none';
      countryPanel.style.display = 'none';
      layerPanel.style.display = 'block';
    }
    wasZoomedIn = zoomedIn;
  });
  updateZoom();
  toolbar.appendChild(zoomReadout);

  /* ===== Copy Map Link button ===== */
  const shareBtn = document.createElement('button');
  shareBtn.className = 'toolbar-btn';
  shareBtn.textContent = 'Copy Map Link';
  
  shareBtn.addEventListener('click', async () => {
  
      const center = map.getCenter();
      const zoom = map.getZoom();
  
      const url = new URL(window.location.href);
  
      url.searchParams.set('lat', center.lat.toFixed(6));
      url.searchParams.set('lon', center.lng.toFixed(6));
      url.searchParams.set('zoom', zoom.toFixed(2));
  
      if (activeCountry) {
          url.searchParams.set('country', activeCountry);
  
          // Find which years are currently loaded
          const selectedYears = Object.keys(
              pmTilesSources[activeCountry] || {}
          ).filter(year => yearLayerExists(activeCountry, year));
  
          if (selectedYears.length === 1) {
              url.searchParams.set('year', selectedYears[0]);
          } else {
              url.searchParams.delete('year');
          }
      }
  
      try {
          await navigator.clipboard.writeText(url.toString());
  
          shareBtn.textContent = 'Copied!';
          setTimeout(() => {
              shareBtn.textContent = 'Copy Map Link';
          }, 2000);
  
      } catch (err) {
          console.error('Could not copy map link:', err);
          window.prompt('Copy this map URL:', url.toString());
      }
  });

  toolbar.appendChild(shareBtn);

  // Mount panels
  document.body.appendChild(countryPanel);
  document.body.appendChild(yearPanel);
  document.body.appendChild(layerPanel);

  /* ---- Country Panel ---- */
  Object.keys(window.MA_CONFIG.countryViews).forEach(country => {
    const row = document.createElement('div');
    row.className = 'panel-row';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `country-${country}`;
    // input.checked = (country === DEFAULT_COUNTRY); 
    input.checked = (country === validCountry);

    const label = document.createElement('label');
    label.setAttribute('for', input.id);
    label.textContent = country;

    input.addEventListener('change', async (e) => {
      if (e.target.checked) {
        activeCountry = country;
        await addCountryBase(country);

        // turn Field Boundary on (globally)
        setFieldBoundaryVisibility(true);
        const fb = document.getElementById('layer-field');
        if (fb) fb.checked = true;

        // turn Landcover on only for countries that have a landcover COG (landcoverSources in config.js)
        landcoverVisible = !!landcoverSources?.[country];
        toggleLandcoverForCountry(country, landcoverVisible);
        const lc = document.getElementById('layer-landcover');
        if (lc) lc.checked = landcoverVisible;

        // zoom to country view (center/zoom)
        flyToCountry(country);

        // keep Landcover synced with active country when on
        if (landcoverVisible) toggleLandcoverForCountry(activeCountry, true);

        // auto-open Year panel and check latest year for all countries
        populateYearPanel(yearPanel);
        
        // always auto-open Year panel when a country is selected
        yearPanel.style.display = 'block';
        countryPanel.style.display = 'none';

        // auto-select the latest year for this country
        const years = listYearsForCountry(country);
        if (years.length > 0) {
          // const latestYear = years[years.length - 1]; // years are sorted, last is latest
          const latestYear =
            country === validCountry && validYear
                ? validYear
                : years[years.length - 1];
                  const yrCheckbox = document.getElementById(`year-${country}-${latestYear}`);
          if (yrCheckbox && !yrCheckbox.checked) {
            yrCheckbox.checked = true;
            yrCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      } else {
        removeCountryAll(country);
        if (activeCountry === country) {
          activeCountry = null;
        }
      }
      // respect Field Boundary visibility
      setFieldBoundaryVisibility(fieldBoundaryVisible);
    });

    row.appendChild(input);
    row.appendChild(label);
    countryPanel.appendChild(row);
  });

  const cHint = document.createElement('div');
  cHint.className = 'panel-hint';
  cHint.textContent = 'Turn countries on/off';
  countryPanel.appendChild(cHint);

  /* ---- Year Panel ---- */
  function populateYearPanel(host) {
    host.innerHTML = '';
    if (!activeCountry) {
      const msg = document.createElement('div');
      msg.className = 'panel-hint';
      msg.textContent = 'Choose a country first.';
      host.appendChild(msg);
      return;
    }

    const years = listYearsForCountry(activeCountry);
    if (years.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'panel-hint';
      msg.textContent = `No year options for ${activeCountry}.`;
      host.appendChild(msg);
      return;
    }

    years.forEach(yr => {
      const row = document.createElement('div');
      row.className = 'panel-row';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `year-${activeCountry}-${yr}`;
      input.checked = yearLayerExists(activeCountry, yr);

      const label = document.createElement('label');
      label.setAttribute('for', input.id);
      label.textContent = yr;

      input.addEventListener('change', async (e) => {
        if (e.target.checked) {
          setBasemapYear(yr);  // most recently checked year drives the basemap
          await addYearLayer(activeCountry, yr);
        } else {
          removeYearLayer(activeCountry, yr);
          // fall back to the latest year still checked (keep current year if none)
          const remaining = listYearsForCountry(activeCountry)
            .filter(y => yearLayerExists(activeCountry, y));
          if (remaining.length) setBasemapYear(remaining[remaining.length - 1]);
        }
        setFieldBoundaryVisibility(fieldBoundaryVisible);
        if (landcoverVisible) toggleLandcoverForCountry(activeCountry, true);
      });

      row.appendChild(input);
      row.appendChild(label);
      host.appendChild(row);
    });

    const hint = document.createElement('div');
    hint.className = 'panel-hint';
    if (activeCountry === 'Zambia') hint.textContent = 'Zambia: 2018–2024.';
    if (activeCountry === 'Congo')  hint.textContent = 'Congo: 2022.';
    if (activeCountry === 'Ghana')  hint.textContent = 'Ghana: 2018.';
    if (activeCountry === 'Tanzania')  hint.textContent = 'Tanzania: 2019.';
    host.appendChild(hint);
  }

  /* ---- Layer Panel ---- */
  // Field Boundary
  const fieldRow = document.createElement('div');
  fieldRow.className = 'panel-row';
  const fieldCb = document.createElement('input');
  fieldCb.type = 'checkbox';
  fieldCb.id = 'layer-field';
  fieldCb.checked = false; // Changed to false for Tanzania
  const fieldLbl = document.createElement('label');
  fieldLbl.setAttribute('for', 'layer-field');
  fieldLbl.textContent = 'Field Boundary';
  fieldCb.addEventListener('change', (e) => setFieldBoundaryVisibility(e.target.checked));
  fieldRow.appendChild(fieldCb);
  fieldRow.appendChild(fieldLbl);
  layerPanel.appendChild(fieldRow);

  // Landcover
  const lcRow = document.createElement('div');
  lcRow.className = 'panel-row';
  const lcCb = document.createElement('input');
  lcCb.type = 'checkbox';
  lcCb.id = 'layer-landcover';
  lcCb.checked = false; // set per country when a country is chosen (only countries with landcover)
  const lcLbl = document.createElement('label');
  lcLbl.setAttribute('for', 'layer-landcover');
  lcLbl.textContent = 'Landcover';
  lcCb.addEventListener('change', (e) => {
    landcoverVisible = e.target.checked;
    toggleLandcoverForCountry(activeCountry, landcoverVisible);
  });
  lcRow.appendChild(lcCb);
  lcRow.appendChild(lcLbl);
  layerPanel.appendChild(lcRow);

  // Sentinel-2 Cloudless basemap (label shows the year in use)
  const s2Row = document.createElement('div');
  s2Row.className = 'panel-row';
  const s2Cb = document.createElement('input');
  s2Cb.type = 'checkbox';
  s2Cb.id = 'layer-s2';
  const s2Lbl = document.createElement('label');
  s2Lbl.setAttribute('for', 'layer-s2');
  s2Lbl.textContent = s2Label(basemapYear);
  s2Cb.addEventListener('change', (e) => {
    s2On = e.target.checked;
    // choosing Sentinel-2 at zoom 14+ overrides MapTiler; below 14 it leaves the auto-switch alone
    if (s2On && map.getZoom() >= MAPTILER_MIN_ZOOM) maptilerOn = false;
    syncBasemaps();
  });
  s2Row.appendChild(s2Cb);
  s2Row.appendChild(s2Lbl);
  layerPanel.appendChild(s2Row);

  // MapTiler basemap (row only shown from MAPTILER_MIN_ZOOM up)
  const mtRow = document.createElement('div');
  mtRow.className = 'panel-row';
  mtRow.id = 'layer-maptiler-row';
  const mtCb = document.createElement('input');
  mtCb.type = 'checkbox';
  mtCb.id = 'layer-maptiler';
  const mtLbl = document.createElement('label');
  mtLbl.setAttribute('for', 'layer-maptiler');
  mtLbl.textContent = 'MapTiler Basemap';
  mtCb.addEventListener('change', (e) => {
    maptilerOn = e.target.checked;
    syncBasemaps();
  });
  mtRow.appendChild(mtCb);
  mtRow.appendChild(mtLbl);
  layerPanel.appendChild(mtRow);

  syncBasemaps();  // set checkbox states and row visibility for the starting zoom
  

  /*=== Defaults / URL initialization ===*/
  if (!defaultsApplied) {
  
      const countryCb = document.getElementById(
          `country-${validCountry}`
      );
  
      if (countryCb) {
          countryCb.checked = true;
          countryCb.dispatchEvent(
              new Event('change', { bubbles: true })
          );
      }
  
      defaultsApplied = true;
  }
}


/* ===== Boot ===== */
window.addEventListener('DOMContentLoaded', () => {
  // PMTiles protocol
  protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);

  // Start on the basemap that suits the initial zoom, so no tiles are loaded only to be hidden
  const startOnMaptiler = maptilerOn && initialZoom >= MAPTILER_MIN_ZOOM;
  const startOnS2 = s2On && !startOnMaptiler;

  map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      sources: {
        [S2_SOURCE_ID]: s2SourceSpec(basemapYear),
        [MAPTILER_SOURCE_ID]: {
          type: 'raster',
          tiles: [maptiler],
          tileSize: 512,
          attribution: `© MapTiler © OpenStreetMap contributors | ${MAPLIBRE_ATTRIBUTION}`,
          minzoom: MAPTILER_MIN_ZOOM,
          maxzoom: 16
        }
      },
      layers: [
        s2LayerSpec(startOnS2),
        {
          id: MAPTILER_LAYER_ID,
          type: 'raster',
          source: MAPTILER_SOURCE_ID,
          minzoom: MAPTILER_MIN_ZOOM,
          layout: { visibility: startOnMaptiler ? 'visible' : 'none' }
        }
      ]
    },
    center: initialCenter,
    zoom: initialZoom,
    attributionControl: { compact: true, customAttribution: MAPLIBRE_ATTRIBUTION }
  });

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left');

  // COG protocol   
  maplibregl.addProtocol('cog', MaplibreCOGProtocol.cogProtocol);
  
  map.on('load', async () => {
    // Build UI - handles all defaults (country, year, layers)
    buildUI();
  });

});
