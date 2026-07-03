---
title: QMK:n konfigurointi ja VIA tuki GMMK Pro näppäimistölle Linux Mintillä
layout: layouts/blog.njk
leadText: VIA ei tunnista minun uutta hienoa GMMK näppäimistöäni? Missä vika?
draft: true
---

## Esittely

Käyn tässä kirjoituksessa läpi kuinka QMK saa asennettua ja aktivoitua VIA tuen Glorious GMMK Pro mekaaniselle
näppäimistölle

QMK on avoimen lähdekoodin firmware (laiteohjelma) millä pystyy uudeleen ohjelmoimaan näppäimistön näppäimiä,
valaistusta ja paljon muuta. Voit lukea lisää QMK:sta heidän [dokumentaatiostaan](https://docs.qmk.fm/)

Mikä ihmeen VIA? [VIA](https://www.caniusevia.com/) on helppokäyttöinen avoimen lähdekoodin graafinen käyttöliittymä QMK
tuettujen näppäimistöjen konfigurointiin. Sillä pystyy tekemeen pitkälti kaikki perussäätämiset näppäimistön hallintaan

Mitä perkelettä me sit käytetään vaivaa QMK:n asennukseen jos VIA:lla hoitaa homman paljon helpommin? Jos VIA tunnistaa
sun näppäimistön samantien [https://usevia.app](https://usevia.app) UI:lla et melko varmasti tarvitse alkaa säätämään
QMK:ta, mutta jos ei tunnista, tässä on mahdollinen ratkaisu ongelmaan. Tai jos muuten vaan kiinnostaa :)

## Minun laitteeni

Minä käytän käyttöjärjestelmänä Linux Minttiä. Muilla käyttöjärjestelmillä komennot saattavat olla hieman eri. Katso
tarkemmat ohjeet QMK dokumentaatiosta.

Minun näppäimistöni on Gloriouksen GMMK Pro. Jos seuraat mun esimerkkiä ja sulla on joku eri näppäimistö varmista että
se on yhteensopiva QMK:n kanssa (Voit tarkistaa oman näppäimistön QMK yhteensopivuuden täältä
[https://browse.qmk.fm](https://browse.qmk.fm)) ja muista vaihtaa näppäimistön malli vaadittavissa komennoissa. Mä
varoitan pitkin kirjoitusta kohdissa missä asiat voi mennä pieleen. Nonni eiköhän lähetä sit vaan toimiin.

## QMK:n asennus

Asennetaan alkuun QMK CLI työkalu. QMK CLI Asennus skripti löytyy
[QMK:n virallisista ohjeista.](https://docs.qmk.fm/newbs_getting_started#set-up-your-environment)

CLI työkalun asennuksen jälkeen voidaan alustaa QMK kehitys ympäristö omalle koneelle. Seuraava komenta lataa
tarvittavat tiedostot QMK firmwarelle kotihakemistoon `./qmk_firmware` kansioon.

```bash
qmk setup
```

### Oma QMK työtila

Ennen kun lähetään muokkaamaan QMK asetuksia luodaan oma työtila. Tämä vaihe on vapaaehtoinen ja vaatii Github
tunnuksen, mutta tämä selkeyttää omaa työtilaa ja saat helpoommin tallennettua omat muutokset versionhallintaan
halutessasi.

Aloitetaan forkkaamalla [qmk_userspace github repository](https://github.com/qmk/qmk_userspace). Voit myös suoraan
kloonata ilman forkkaamista
