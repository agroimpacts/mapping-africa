# High resolution, annual cropland and landcover maps for African countries


## Background

This site provides links to view and obtain high resolution cropland and
landcover maps developed by [Clark University](https://clarku.edu)’s
[Agricultural Impacts Research Group](https://agroimpacts.info/) for
selected African countries using various machine learning approaches
applied to Planet imagery.

## Datasets

There are two types of data currently available:

1.  **cropland**: Annual (beginning in year 2018) crop field boundary
    maps of several African countries, developed using several different
    modeling approaches applied to Planet imagery (Estes et al, 2022a;
    Estes et al, 2022b; Wussah et al, 2023). Data are provided as
    vectorized boundaries, in both pmtile and geoparquet formats. These
    datasets are under active development, and more countries and annual
    maps are updated as they are created.

2.  **land cover**: A 2018 multi-class land cover map for Tanzania
    developed using U-Net applied to Planet imagery and Sentinel-1 time
    series derivatives (Song et al, 2023). See
    [here](https://lleisong.github.io/website//projects/reconcile_human_elephants/)
    for more detail on the methods and larger project (led by Dr. Lei
    Song) for which this map was created.

## Accessing data

### From S3

These datasets can be downloaded from this bucket by AWS account
holders. Data are stored under the following prefixes:

    └── mappingafrica/
        ├── croplands/
        │   ├── pmtiles
        │   └── geoparquet
        └── landcover

These can be viewed using the AWS command line interface (CLI):

``` bash
aws s3 ls s3://mappingafrica/ 
```

``` bash
PRE croplands/pmtiles/
PRE croplands/mbtiles/
PRE landcover/
```

To download a dataset, please use the following an example command:

``` bash
aws s3 cp \
s3://mappingafrica/landcover/tanzania_2018.tif \
~/Desktop/ 
```

``` bash
download: s3://mappingafrica/landcover/tanzania_2018.tif to ../../..
/Desktop/tanzania_2018.tif
```

That will download a map of predicted land cover for Tanzania for the
year 2019 to your desktop (you might need to replace ~/ with the full
path to your home directory).

### From OSF

The land cover map and ancillary data can also be downloaded from the
[Open Science Foundation](https://osf.io/4qj36/), and model code is
[here](https://github.com/LLeiSong/hrlcm).

## Viewing data

The datasets can be viewed through the [web
map](https://agroimpacts.github.io/mapping-africa/) hosted here (and
accessible from [here](https://mappingafrica.io)).

Maps can also be loaded and displayed using a Jupyter notebook (see the
example
[here](https://github.com/agroimpacts/mapping-africa/blob/main/notebooks/map_viewer.ipynb).

## Usage

Use of these maps is governed by the terms of the [Planet NICFI
participant license
agreement](https://assets.planet.com/docs/Planet_ParticipantLicenseAgreement_NICFI.pdf)

## Publications

Estes, L.D., Wussah, A.O. & Asipinu, M.D. (2022a) [Final report - Phase
1: Creating open agricultural maps and ground truth data to better
deliver farm extension
services](https://cropanalytics.net/wp-content/uploads/2022/04/FarmerlineClark-Report-Feb-2022-002.pdf)

Estes, L.D., Ye, S., Song, L., Luo, B., Eastman, J.R., Meng, Z., Zhang,
Q., McRitchie, D., Debats, S.R., Muhando, J., Amukoa, A.H., Kaloo, B.W.,
Makuru, J., Mbatia, B.K., Muasa, I.M., Mucha, J., Mugami, A.M., Mugami,
J.M., Muinde, F.W., Mwawaza, F.M., Ochieng, J., Oduol, C.J., Oduor, P.,
Wanjiku, T., Wanyoike, J.G., Avery, R.B. & Caylor, K.K. (2022b) [High
resolution, annual maps of field boundaries for smallholder-dominated
croplands at national
scales](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2021.744863/full).
*Frontiers in Artificial Intelligence*, 4, 744863.

Song, L., Estes, A.B. & Estes, L.D. (2023) [A super-ensemble approach to
map land cover types with high resolution over data-sparse African
savanna
landscapes](https://www.sciencedirect.com/science/article/pii/S1569843222003405).
*International Journal of Applied Earth Observation and Geoinformation*,
116, 103152.

Wussah, A.O., Asipinu, M.D. & Estes, L.D. (2022) [Final report - Phase
2: creating next generation field boundary and crop type maps: Rigorous
multi-scale groundtruth provides sustainable extension services for
smallholders](https://cropanalytics.net/wp-content/uploads/2022/11/Farmerline-Clark-Round-2-Report-V2-Nov-8-2022.pdf)
