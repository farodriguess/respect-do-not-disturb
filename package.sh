#!/bin/bash -e

glib-compile-schemas ./schemas/
zip -r 'respect-do-not-disturb@farodriguess.zip' . -x ".git/*"