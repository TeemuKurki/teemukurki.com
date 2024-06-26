# Personal website

Static site generated with [lume](https://lume.land/). Using [Musicbrainz](https://musicbrainz.org/) for music
collection catalog

## Develpment

Install [exiftool](https://exiftool.org/) and [Velociraptor](https://velociraptor.run)

ExifTool is used to strip all metadata from image assets so we don't accidentally publish unwanted information inside
image metadata.

```bash
#Install exiftool
brew install exiftool
```

Velociraptor is used to generate pre-commit hooks

```bash
#Install Velociraptor
deno install -qAn vr https://deno.land/x/velociraptor@1.5.0/cli.ts
```
