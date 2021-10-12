# Prototypes

This folder contains:

- a simple Web server that supports bundle preloading with subsetting
- a polyfill implementation of bundle preloading in JS
- several examples of bundle preloading in use

Note that, for simplicity, the server maintains a 1 to 1 correspondence between a bundle and the folder containing the same resources. For example, `https://example.com/media.wbn` would contain the same resources as the folder `https://example.com/media.wbn`. This relationship is not a strict requirement but it simplifies prototyping and quick testing.