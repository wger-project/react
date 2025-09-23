# react components for wger

This repository contains the React components for the wger app. Note that this
React app is not supposed to be used by itself, but rather as a library of
components that are then used in wger.

# Getting Started

Our goal is to build an awesome and flexible fitness and nutrition manager,
along with a comprehensive list of exercises and ingredients, all released
under a free license.

For this, we’d love your help! Whether it’s code, translations, exercises or
reporting issues and ideas, check out our
[contribution guide](https://wger.readthedocs.io/en/latest/contributing.html)
to get started.

A huge thank you to everyone who has contributed so far! ❤️ See the full list
in [AUTHORS.md](AUTHORS.md).

**TLDR**

```bash
# with node > 22

cp .env.TEMPLATE .env.development
vim .env.development
yarn config set --home enableTelemetry 0
yarn install
yarn start 
```

This is a regular react application, so there's no magic. You will need a backend
for this, so feel free to use the test server for this (the db is reset daily):

* URL: `https://wger-master.rge.uber.space`
* key: `31e2ea0322c07b9df583a9b6d1e794f7139e78d4`
* username: `user`
* password: `flutteruser`

## Translation

Translate the app to your language on [Weblate](https://hosted.weblate.org/engage/wger/).

[![translation status](https://hosted.weblate.org/widgets/wger/-/frontend/multi-blue.svg)](https://hosted.weblate.org/engage/wger/)

## Contact

Feel free to contact us if you found this useful or if there was something that didn't behave as you expected. We can't
fix what we don't know about, so please report liberally. If you're not sure if something is a bug or not, feel free to
file a bug anyway.

* **Discord:** <https://discord.gg/rPWFv6W>
* **Issue tracker:** <https://github.com/wger-project/react/issues>
* **Mastodon:** <https://fosstodon.org/@wger>

## License

The application is licensed under the Affero GNU General Public License 3 or later (AGPL 3+).
