window.MA_CONFIG = {
  defaultCountry: 'Zambia',
  defaultYear: '2024',
  
  pmTilesSources: {
    Angola: {
    '2018': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/angola_2018_v4.pmtiles',
    '2019': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/angola_2019_v4.pmtiles',
    '2020': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/angola_2020_v4.pmtiles',
    '2021': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/angola_2021_v4.pmtiles',
    '2022': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/angola_2022_v4.pmtiles',
    '2023': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/angola_2023_v4.pmtiles',
    '2024': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/angola_2024_v4.pmtiles' 

  },
    Congo: {
      '2022': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/congo_2022_v1.pmtiles'
    },
    Zambia: {
      '2018': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2018_v4.pmtiles',
      '2019': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2019_v4.pmtiles',
      '2020': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2020_v4.pmtiles',
      '2021': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2021_v4.pmtiles',
      '2022': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2022_v4.pmtiles',
      '2023': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2023_v4.pmtiles',
      '2024': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2024_v4.pmtiles'
    },
    Ghana: {
      '2018': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/ghana_2018_v4.pmtiles',
      '2019': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/ghana_2019_v4.pmtiles',
      '2020': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/ghana_2020_v4.pmtiles',
      '2022': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/ghana_2022_v4.pmtiles',
      '2023': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/ghana_2023_v4.pmtiles',
       
    },
    Tanzania: {
      '2018': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/tanzania_2018_v4.pmtiles',
      '2019': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/tanzania_2019_v4.pmtiles',
      '2020': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/tanzania_2020_v4.pmtiles',
      '2021': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/tanzania_2021_v4.pmtiles',
      '2022': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/tanzania_2022_v4.pmtiles',
      '2023': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/tanzania_2023_v4.pmtiles',
    
    },
    Nigeria: {
       '2018': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/nigeria_2018_v4.pmtiles',
       '2019': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/nigeria_2019_v4.pmtiles',
       '2020': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/nigeria_2020_v4.pmtiles',
       '2021': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/nigeria_2021_v4.pmtiles', 
       '2022': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/nigeria_2022_v4.pmtiles',
       '2023': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/nigeria_2023_v4.pmtiles',
       '2024': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/nigeria_2024_v4.pmtiles'
    }
  },

  // EOX Sentinel-2 Cloudless basemap: one mosaic per year, year follows the Year panel
  s2cloudless: {
    years: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
    urlTemplate: 'https://tiles.maps.eox.at/wmts?layer=s2cloudless-{year}_3857&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}',
    maxzoom: 16
  },

  // MapTiler takes over as the basemap from this zoom level up
  maptilerMinZoom: 14,

  landcoverSources: {
    Tanzania: {
      '2019': "https://mappingafrica.s3.us-west-2.amazonaws.com/landcover/tanzania_2019_cog.tif"
    }
  },

  countryViews: {
    Angola:   { center: [17.8739, -11.2027], zoom: 5 },
    Congo:    { center: [15.275, 0.181],  zoom: 5 },
    Zambia:   { center: [27.8,  -13.1],   zoom: 5.5 },
    Ghana:    { center: [-1.027, 7.858],  zoom: 6 },
    Tanzania: { center: [34.8955, -6.373], zoom: 9 },
    Nigeria:  { center: [9.081999, 8.675277], zoom: 5 },

  },
};
