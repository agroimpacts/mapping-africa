# A region-wide, multi-year set of crop field boundary and landcover maps for Africa


## Background

This site provides links to view and obtain High resolution cropland and
landcover maps developed by Clark University’s Agricultural Impacts
Research Group for various African countries
(https://agroimpacts.info/).

## Datasets

There are two types of data currently available:

1.  **cropland**: Field boundary polygon maps developed using different
    supervised and unsupervised deep learning models span the growth and
    changes of African agricultural activities since 2018.

2.  **landcover**: Maps generated using Random Forests model trained
    using the label data and predictors drawn from Sentinel-1,
    Sentinel-2, and PlanetScope data.

## Accessing data

### From S3

These datasets can be downloaded from this bucket by AWS account
holders. Data are stored under the following prefixes:

- croplands
  - pmtiles
  - mbtiles
- landcover/

These can be viewed using the AWS command line interface (CLI):

``` bash
aws s3 ls s3://mappingafrica/ --request-payer
```

    PRE croplands/pmtiles/
    PRE croplands/mbtiles/
    PRE landcover/

To download a dataset, here’s an example command:

``` bash
aws s3 cp \
s3://mappingafrica/landcover/tanzania_2019.tif \
~/Desktop/ --request-payer
```

    download: s3://mappingafrica/landcover/tanzania_2019.tif to ../../..
    /Desktop/tanzania_2019.tif

That will download a map of predicted landcover for Tanzania for the
year 2019 to your desktop (you might need to replace ~/ with the full
path to your home directory).

### From Box

The data may also be downloaded from a \[public Box folder\]
(https://airg.box.com/s/s9vhe5zy39e7oljc233n4bc3fxcow5fe).

## Viewing data

An example of how to view the data (using a Jupyter notebook) is
available [here](https://github.com/agroimpacts/webmapper.git).

## Publications

- [High resolution, annual maps of field boundaries for
  smallholder-dominated croplands at national
  scales](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2021.744863/full),
  Estes et al.

- [A super-ensemble approach to map land cover types with high
  resolution over data-sparse African savanna
  landscapes](https://www.sciencedirect.com/science/article/pii/S1569843222003405),
  Song et al.

- [Creating open agricultural maps and ground truth data to better
  deliver farm extension
  services](https://cropanalytics.net/wp-content/uploads/2022/04/FarmerlineClark-Report-Feb-2022-002.pdf),
  Este et al.

- [Creating next generation field boundary and crop type maps rigorous
  multi-scale groundtruth provides sustainable extension services for
  smallholders](https://cropanalytics.net/wp-content/uploads/2022/11/Farmerline-Clark-Round-2-Report-V2-Nov-8-2022.pdf),
  Wussah et al.
