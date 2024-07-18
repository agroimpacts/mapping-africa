mapping_africa
================


This site provides links to view and obtain High resolution cropland and
landcover maps developed by Clark University's Agricultural Impacts Research
Group for various African countries (https://agroimpacts.info/).

## Datasets

There are two types of data currently available:

1.  cropland: Field boundary polygon maps developed using different supervised 
and unsupervised deep learning models spans the growth and changes of 
African agricultural activities since 2018.

2.  landcover: Maps generated using Random Forests                 //ask Lyndon
    model trained using the label data and predictors drawn from
    Sentinel-1, Sentinel-2, and PlanetScope data.

## Accessing data

### From S3

These datasets can be downloaded from this bucket by AWS account
holders. Data are stored under the following prefixes:

-   croplands
        - pmtiles
        - mbtiles
-   landcover/

These can be viewed using the AWS command line interface (CLI):

``` bash
aws s3 ls s3://mappingafrica/ --request-payer
```

    PRE croplands/pmtiles/           //ask Lyndon
    PRE croplands/mbtiles/
    PRE landcover/

To download a dataset, here’s an example command:

``` bash
aws s3 cp \
s3://mappingafrica/landcover/tanzania_2019.tif \
~/Desktop/ --request-payer
```

    download: s3://mappingafrica/landcover/tanzania_2019.tif to ../../../Desktop/tanzania_2019.tif

That will download a map of predicted landcover for tanzania for the
year 2019 to your desktop (you might need to replace \~/ with the full
path to your home directory).

### From Box

The data may also be downloaded from a [public Box
folder](https://airg.box.com/s/s9vhe5zy39e7oljc233n4bc3fxcow5fe). //ask Lyndon

## Viewing data

An example of how to view the data (using a jupyter notebook) is
available [here](notebooks/map_viewer.ipynb).
