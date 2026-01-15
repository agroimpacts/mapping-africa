window.MA_CONFIG = {
  pmTilesSources: {
    Congo: 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/congo_2022_v1.pmtiles',
    Zambia: {
      '2018': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2018_v4.pmtiles',
      '2019': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2019_v4.pmtiles',
      '2020': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2020_v4.pmtiles',
      '2021': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2021_v4.pmtiles',
      '2022': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2022_v4.pmtiles',
      '2023': 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/zambia_2023_v4.pmtiles'
    },
    Ghana: 'https://mappingafrica.s3.us-west-2.amazonaws.com/croplands/pmtiles/ghana_2018_v1.pmtiles'
  },

  landcoverSources: {
    Tanzania: "https://mappingafrica.s3.us-west-2.amazonaws.com/landcover/tanzania_2019_cog.tif"
  },

  countryViews: {
    Congo:    { center: [15.275, 0.181],  zoom: 5 },
    Zambia:   { center: [27.8,  -13.1],   zoom: 5.5 },
    Ghana:    { center: [-1.027, 7.858],  zoom: 6 },
    Tanzania: { center: [34.8955, -6.373], zoom: 7 }
  },

};
