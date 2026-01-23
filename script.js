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

/* EOX base map (Sentinel-2 cloudless) */
const EOX = "https://tiles.maps.eox.at/wmts?layer=s2cloudless-2020_3857&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}"

/* ===== Default Settings ===== */
const DEFAULT_COUNTRY = 'Zambia'; 
const DEFAULT_YEAR = '2024'; 

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
        maxzoom: 22 });
    }
    if (!map.getLayer(layerId)) {
      map.addLayer({ id: layerId, type: 'raster', source: sourceId });
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
  const entry = pmTilesSources[country];
  if (entry && typeof entry === 'object') return Object.keys(entry).sort();
  return [];
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
  await addLayer(country, 'pmtiles', year);
  
  // For landcover-only countries, also enable landcover
  if (isLandcoverOnlyCountry(country)) {
    landcoverVisible = true;
    toggleLandcoverForCountry(country, true);
    const lc = document.getElementById('layer-landcover');
    if (lc) lc.checked = true;
  }
}

function removeYearLayer(country, year) {
  removeLayer(country, 'pmtiles', year);
  
  // For landcover-only countries, also disable landcover
  if (isLandcoverOnlyCountry(country)) {
    toggleLandcoverForCountry(country, false);
    const lc = document.getElementById('layer-landcover');
    if (lc) lc.checked = false;
  }
}

let defaultsApplied = false;
let suppressAutoOpen = false; // prevents auto-opening panel during init

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

  // Mount panels
  document.body.appendChild(countryPanel);
  document.body.appendChild(yearPanel);
  document.body.appendChild(layerPanel);

  /* ---- Country Panel ---- */
  ['Congo', 'Zambia', 'Ghana','Tanzania'].forEach(country => {
    const row = document.createElement('div');
    row.className = 'panel-row';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `country-${country}`;
    input.checked = (country === DEFAULT_COUNTRY); 

    const label = document.createElement('label');
    label.setAttribute('for', input.id);
    label.textContent = country;

    input.addEventListener('change', async (e) => {
      if (e.target.checked) {
        activeCountry = country;
        await addCountryBase(country);

        if (country === DEFAULT_COUNTRY) {
        // turn Field Boundary on (globally)
        setFieldBoundaryVisibility(true);
        const fb = document.getElementById('layer-field');
        if (fb) fb.checked = true;

        // turn Landcover on
        landcoverVisible = true;
        toggleLandcoverForCountry(DEFAULT_COUNTRY, true);
        const lc = document.getElementById('layer-landcover');
        if (lc) lc.checked = true;

        // auto-open Year and check default year
        populateYearPanel(yearPanel);
        const yr = document.getElementById(`year-${DEFAULT_COUNTRY}-${DEFAULT_YEAR}`);
        if (yr && !yr.checked) {
          yr.checked = true;
          yr.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

        // zoom to country view (center/zoom)
        flyToCountry(country);

        // keep Landcover synced with active country when on
        if (landcoverVisible) toggleLandcoverForCountry(activeCountry, true);

        // auto-open Year for default country if desired
        if (country === DEFAULT_COUNTRY) {
          populateYearPanel(yearPanel);
          // only auto-open for user clicks, not during defaults init
          if (!suppressAutoOpen) {
            yearPanel.style.display = 'block';
            countryPanel.style.display = 'none';
          }

          // ensure default year is selected and its layer added
          const yrDefault = document.getElementById(`year-${DEFAULT_COUNTRY}-${DEFAULT_YEAR}`);
          if (yrDefault && !yrDefault.checked) {
            yrDefault.checked = true;
            yrDefault.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      } else {
        removeCountryAll(country);
        if (activeCountry === country) activeCountry = null;
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
          await addYearLayer(activeCountry, yr);
        } else {
          removeYearLayer(activeCountry, yr);
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
  lcCb.checked = true; // Changed to true for Tanzania
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
  
  /*=== Defaults ===*/
  if (!defaultsApplied) {
    suppressAutoOpen = true;       // block auto-opening Year panel during init
    
    // Trigger default country checkbox change to initialize everything
    const zcb = document.getElementById(`country-${DEFAULT_COUNTRY}`);
    if (zcb) {
      zcb.checked = true;
      zcb.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    suppressAutoOpen = false;
    defaultsApplied = true;
  }
}

/* ===== Boot ===== */
window.addEventListener('DOMContentLoaded', () => {
  // PMTiles protocol
  protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);
  
  map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      sources: {
        basemap: {
          type: 'raster',
          tiles: [EOX],
          tileSize: 256,
          attribution: 'Tiles © 2020 EOX IT Services GmbH, Sentinel-2 cloudless',
          maxzoom: 20
        }
      },
      layers: [{ id: 'basemap', type: 'raster', source: 'basemap' }]
    },
    center: [27.8,  -13.1], // Zambia 
    zoom: 5.5
  });

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left');

  // COG protocol   
  maplibregl.addProtocol('cog', MaplibreCOGProtocol.cogProtocol);

  map.on('load', async () => {
    // Build UI - handles all defaults (country, year, layers)
    buildUI();
  });

});
