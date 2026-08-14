# High resolution, annual cropland and landcover maps for African countries

## Table of Contents

- [Background](#background)
- [Datasets](#datasets)
- [Accessing data](#accessing-data)
  - [From S3](#from-s3)
  - [From OSF](#from-osf)
- [Viewing data](#viewing-data)
- [Usage](#usage)
- [Citation](#citation)
  - [Land cover](#land-cover)
  - [Field boundaries](#field-boundaries)
    - [Zambia](#zambia)
    - [Republic of the Congo](#republic-of-the-congo)
    - [All other countries](#all-other-countries)
- [Publications](#publications)

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

Note that field boundaries will often appear misaligned with the underlying imagery in the webmap. In some cases, this is due to model error (see [Usage](#usage) below), but often this reflects the fact that the model was applied to Planet imagery collected in a different year than the basemap imagery, when the fields themselves were different.

## Usage

Use of these maps is governed by the terms of the [Planet NICFI
participant license
agreement](https://planet.widen.net/s/zfdpf8qxwk/participantlicenseagreement_nicfi_2024).

Users should also be aware of these maps’ limitations, which are released “as-is” and contain errors. These include: 

- False positives; 
- Under-segmentation, where adjacent fields are grouped together, particularly in dense agricultural landscapes; 
- Inconsistent mapping of fields between years (fields missed, falsely predicted, or under- or over-segmented for the same location in different years). 

These errors can vary by region. Map users should undertake their own accuracy assessments that are relevant to their area and application of interest. To better understand the nature of such errors, how they can be detected, and in some cases, corrected, please refer to [Xiong et al (2026)](https://www.cabidigitallibrary.org/doi/10.31220/agriRxiv.2026.00464). The methods include details on how to use polygon shape metrics, which are provided with our geoparquets, to detect fields that are under-segmented and bias-correct their areas.   

## Citation  

If you use the these maps in a publication, report, or other research product, please cite according to these guidelines:

### Land cover
Please cite the following paper:

> Song, L., Estes, A.B. & Estes, L.D. (2023) [A super-ensemble approach to map land cover types with high resolution over data-sparse African savanna landscapes](https://www.sciencedirect.com/science/article/pii/S1569843222003405). *International Journal of Applied Earth Observation and Geoinformation*, 116, 103152.

### Field boundaries

Please cite the Mapping Africa dataset: 

> Estes, L.D., Essuman, G., Xiong, S., Abedi, R., Chakraborty, T. (2026). Mapping Africa: Annual high-resolution cropland field boundary maps. Agricultural Impacts Research Group, Clark University. https://github.com/agroimpacts/mapping-africa. Accessed [date]. 

In addition to citing the dataset citation above, please cite the publication(s) below, which differ by country as the model and production methods varied. 

#### Zambia 

For the current Zambia maps, please cite the following paper, which describes both the maps and the methods used to generate them: 

> Xiong, S., Li, W., Hadunka, P., Ross, G.D., Chakraborty, T., Khallaghi, S., Abedi, R., Daum, K., Xue, K., Yao, Y.-T., Chilenga, A., Rufin, P., Khan, A., Potapov, P., Baylis, K., Caylor, K. & Estes, L. (2026). High-resolution remote sensing reveals medium-scale farms at the frontiers of agricultural change in Africa. *agriRxiv*, 2026, 20260367814. 

#### Republic of the Congo 

> Khallaghi, S., Abedi, R., Abou Ali, H., Alemohammad, H., Dziedzorm Asipunu, M., Alatise, I., Ha, N., Luo, B., Mai, C., Song, L., Wussah, A.O., Xiong, S., Yao, Y.-T., Zhang, Q. & Estes, L.D. (2025) Generalization enhancement strategies to enable cross-year cropland mapping with convolutional neural networks trained using historical samples. *Remote Sensing*, 17, 474.  

#### All other countries 

The methods used to generate these maps are drawn from the following two papers: 

> Xiong, S., Li, W., Hadunka, P., Ross, G.D., Chakraborty, T., Khallaghi, S., Abedi, R., Daum, K., Xue, K., Yao, Y.-T., Chilenga, A., Rufin, P., Khan, A., Potapov, P., Baylis, K., Caylor, K. & Estes, L. (2026). High-resolution remote sensing reveals medium-scale farms at the frontiers of agricultural change in Africa. *agriRxiv*, 2026, 20260367814. 

> Muhawenayo, G., Robinson, C., Khanal, S., Fang, Z., Corley, I., Wollam, A., Gao, T., Strnad, L., Avery, R., Estes, L., Tárano, A., Jacobs, N. & Kerner, H. (2026). PRUE: A Practical Recipe for Field Boundary Segmentation at Scale. *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 6484–6495. 

## Publications

Estes, L.D., Wussah, A.O. & Asipinu, M.D. (2022a) [Final report - Phase 1: Creating open agricultural maps and ground truth data to better deliver farm extension services](https://cropanalytics.net/wp-content/uploads/2022/04/FarmerlineClark-Report-Feb-2022-002.pdf)

Estes, L.D., Ye, S., Song, L., Luo, B., Eastman, J.R., Meng, Z., Zhang, Q., McRitchie, D., Debats, S.R., Muhando, J., Amukoa, A.H., Kaloo, B.W., Makuru, J., Mbatia, B.K., Muasa, I.M., Mucha, J., Mugami, A.M., Mugami, J.M., Muinde, F.W., Mwawaza, F.M., Ochieng, J., Oduol, C.J., Oduor, P., Wanjiku, T., Wanyoike, J.G., Avery, R.B. & Caylor, K.K. (2022b) [High resolution, annual maps of field boundaries for smallholder-dominated croplands at national scales](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2021.744863/full). *Frontiers in Artificial Intelligence*, 4, 744863.

Khallaghi, S., Abedi, R., Abou Ali, H., Alemohammad, H., Dziedzorm Asipunu, M., Alatise, I., Ha, N., Luo, B., Mai, C., Song, L., Wussah, A.O., Xiong, S., Yao, Y.-T., Zhang, Q. & Estes, L.D. (2025) [Generalization enhancement strategies to enable cross-year cropland mapping with convolutional neural networks trained using historical samples](https://www.mdpi.com/2072-4292/17/3/474). *Remote Sensing*, 17, 474.  

Song, L., Estes, A.B. & Estes, L.D. (2023) [A super-ensemble approach to map land cover types with high resolution over data-sparse African savanna landscapes](https://www.sciencedirect.com/science/article/pii/S1569843222003405). *International Journal of Applied Earth Observation and Geoinformation*, 116, 103152.

Wussah, A.O., Asipinu, M.D. & Estes, L.D. (2022) [Final report - Phase 2: creating next generation field boundary and crop type maps: Rigorous multi-scale groundtruth provides sustainable extension services for smallholders](https://cropanalytics.net/wp-content/uploads/2022/11/Farmerline-Clark-Round-2-Report-V2-Nov-8-2022.pdf)

Xiong, S., Li, W., Hadunka, P., Ross, G.D., Chakraborty, T., Khallaghi, S., Abedi, R., Daum, K., Xue, K., Yao, Y.-T., Chilenga, A., Rufin, P., Khan, A., Potapov, P., Baylis, K., Caylor, K. & Estes, L. (2026). [High-resolution remote sensing reveals medium-scale farms at the frontiers of agricultural change in Africa](https://www.cabidigitallibrary.org/doi/10.31220/agriRxiv.2026.00464). agriRxiv, 2026, 20260367814. 
