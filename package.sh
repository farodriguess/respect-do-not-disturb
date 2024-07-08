#!/bin/bash -e

glib-compile-schemas ./schemas/
rm 'respect-do-not-disturb@farodriguess.zip'
zip -r 'respect-do-not-disturb@farodriguess.zip' . -x ".git/*" -x ".gitignore" -x "install.sh" -x "package.sh" -x "README.md"