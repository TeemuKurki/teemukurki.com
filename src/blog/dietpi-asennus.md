---
title: Jellyfin media serveri
leadText: Asensin Jellyfin media serverin raspberry pi:lle
image: ../img/hifiberry_komponentit.jpeg
layout: layouts/blog.njk
createdAt: 2025-08-17T17:03:00+03:00
tags:
  - blog

draft: true
---

# Siirtyminen DietPi distroon

Päätin siitryä pois Moode Audiosta ja asentaa DietPi:in. Moode Audio toimi hyvin musiikki soittimena, mutta halusin
alkaa käyttämään Raspberry pi:tä myös media soittimena DVD ja Bluray elokuville ja sarjoille. Halusin käyttää Raspberry
pi:tä yleisenä media serverinä/soittimena ja DietPi tarjosi kevyen ja helpon OS:n tähän tarpeeseen.

## DietPi asennus

[DietPi](https://dietpi.com)

DietPi:llä on oma sovellus manageri jonka kautta voi asentaa sovelluksia jotka ovat konfattu ja optimoitu toimimaan
DietPi ympäristössä. Voi myös asentaa käyttämällä apt:ia, muuta siinä tapauksessa saatat joutua itse konffailemaan
enemmän

Asenna halutut sovellukset dietpi-software:lla

```bash
# 128 -> mpd
# 148 -> myMPD
# 178 -> jellyfin
dietpi-software install 128 148 178
```

Hyödyllisiä muttei välttämättömiä ohjelmia aptista

```bash
# exiftool -> Lue metatietoja tiedostoista.
# mpc -> Komenna mpd serveriä komentoriviltä. Auttaa selvittämään johtuuko ongelma mpd-clientistä (myMPD) vai serveristä
apt install exiftool mpc
```

Voit myös asettaa nämä ohjelmat automaattisesti asentuvaksi /boot/dietpi.txt tiedostosta

```txt
AUTO_SETUP_INSTALL_SOFTWARE_ID=128 148 178
AUTO_SETUP_APT_INSTALLS=exiftool mpc
```

### Äänikortin käyttöönotto

Helpoin tapa konffata ja ottaa ulkoinen äänikortti käyttöön on dietpi-config menun kautta

```bash
dietpi-config
```

Valitse "Audio Options" -> "Sound Card" -> Valiste listasta oma/omaa vastaava äänikortti

## Ulkoisen aseman mounttaus ja konffaus

```bash
# Etsi ulkoinen asema. Minulla se löytyi nimellä sda1
lsblk
# Luo kansion mihin ulkoinen asema mountataan
sudo mkdir /mnt/media
# Mountataan asema (/dev/sda1) kansioon (/media/Music)
sudo mount /dev/sda1 /mnt/media
# dietpi-drive_manager tallentaa mountin tiedot. Voit myös asettaa mountin /etc/fstab manuaalisesti
dietpi-drive_manager
# Valitse 'Exit'
# Katsotaan että albumit löytyvät
ls /mnt/media
```

## MPD conffaus

Päivitä mpd.conf tiedot. Varmista että 'music_directory' osoittaa musiikki hakemistoon esim. /mnt/media/Music

```bash
sudoedit /etc/mpd.conf
```

Jos haluat saada yhteyden sisäverkosta suoraan mpd serverille päivitä mpd.conf tiedostosta "bind_to_address localhost"
-> "bind_to_address 0.0.0.0". Varmista ettei portti 6600 ole reititimestä auki ulkoverkkoon.

Jos on ongelmia että osa biisistä ei näy mpd serverillä, ongelma saattaa johtua .cue tiedostoista.
[Cue tiedostot](https://en.wikipedia.org/wiki/Cue_sheet_(computing)) kertovat albumin rakenteen, mutta jos kappaleet on
ripattu yksittäisiksi tiedostoiksi, cue tiedostista ei usimmissa tapauksiissa hyötyä. Helpoin ratkaisu on poistaa .cue
tiedostot.

```bash
# Mene albumeiden juurikansioon
cd /mnt/media/Music
# Etsi ja poista kaikista albumeista .cue tiedostot
find -type f -name "*.cue" -delete
```

## MyMPD conffaus

### Aseta saavutettavaksi postista 80

```bash
# Ota http yhteys käyttöön
sudo sh -c 'echo "true" > /var/lib/mympd/config/http'
# Aseta http yhteys kuuntelemaan porttia 80
sudo sh -c 'echo "80" > /var/lib/mympd/config/http_port'

# Jos et halua ohjata https. Esim poistaaksesi varoitukset selaimesta
sudo sh -c 'echo "false" > /var/lib/mympd/config/ssl'
```

### Listenbrainz skriptit

Lisää kuunteluhistoria Listenbrainz palveluun. Käytettävät skriptit ja dokumentaatio:
https://github.com/jcorporation/mympd-scripts/tree/main/ListenBrainz

Hae oma Listenbrains User token [Listenbrainz:in asetuksista](https://listenbrainz.org/settings/) ja lisää se MyMPD
sivupalkista Variables:iin listenbrainz_token avaimelle. Kaikki Listenbrainz skriptit käyttävät tätä muuttujaa.

Lisää haluamasi skriptit MyMPD sivupalkista Scripts osiosta. Import lataa skriptit automaattisesti

Skriptit käyttävät musicbrainz tagejä mpd:ssä. Jos haluat varmistaa että ne on käytössä voit tarkistaa sen helposti
telnet:illä

```bash
# Ota yhteys mpd serveriin
telnet 192.168.1.114 6600 # <Rapsberry pi ip> <mpd port> 
tagtypes # Listaa kaikki käytössä olevat tagit
# Jos haluat lisätä esim MUSICBRAINZ_ALBUMARTISTID
tagtypes enable MUSICBRAINZ_ALBUMARTISTID
# Lopeta yhteys painamalla enter
```

## Jellyfin asennus Raspberry pi

- Avaa asennus velho portissa "8097" (esim. http://192.168.1.114:8097)
- Luo käyttäjä
- Lisää halutut kirjastot
  - Elokuvat (/mnt/media/Videos/Movies)
  - Sarjat (/mnt/media/Videos/Series)
  - Musiikki (/mnt/media/Music)
