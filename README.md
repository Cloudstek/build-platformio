# PlatformIO build provider for Atom [![Donate for PlatformIO.Org](https://img.shields.io/donate/PlatformIO.png)](http://platformio.org/donate)

This is the stand-alone stripped down PlatformIO build service provider for Atom from the `platformio-ide` package. It's modified to reduce the number of needed libraries and therefore has no integration with `platformio-ide-terminal` nor does it ship with the platformio cli tools. See the [official documentation](http://docs.platformio.org/en/latest/installation.html) on how to install the cli tools on your platform.

Use this package if you only require the build tools integration. If you want to use all features please disable this package and install the `platformio-ide` package.

## Requirements

* PlatformIO CLI tools
* atom-build

## Troubleshooting

### Build fails, .o files not found
The problem is most likely caused by Atom not using the correct environment PATH variable. This is a common problem on Mac OSX when launching Atom as application instead of from the terminal. Make sure your init.coffee doesn't mess with your `process.env.PATH` setting.

### Command platformio not found
Please install the PlatformIO CLI files (see the [official documentation](http://docs.platformio.org/en/latest/installation.html) on how to do this). Make sure that after installation your PATH is set correctly and you can execute `platformio` in your terminal.

## Bugs
Please do not post bugs related to PlatformIO. This is only a build service provider invoking the platformio command and has nothing to do with the working of PlatformIO itself. Please see the official [PlatformIO website](http://platformio.org/) if you think you've found a bug in PlatformIO.
