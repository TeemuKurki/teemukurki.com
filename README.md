# Personal website

Static site generated with [lume](https://lume.land/). Using [Musicbrainz](https://musicbrainz.org/) for music
collection catalog

## Develpment

Install [exiftool](https://exiftool.org/) and [Velociraptor](https://velociraptor.run)

ExifTool is used to strip all metadata from image assets so we don't accidentally publish unwanted information inside
image metadata.

### Install exiftool

With brew

```bash
brew install exiftool
```

With apt

```bash
apt install exiftool
```

### Install Velociraptor

Velociraptor is used to generate pre-commit hooks

```bash
deno install -qAn vr https://deno.land/x/velociraptor@1.5.0/cli.ts

#Install pre-commit hook
vr
```
