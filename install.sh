#!/bin/bash -e

dir=~/.local/share/gnome-shell/extensions/respect-do-not-disturb@farodriguess

glib-compile-schemas ./schemas/

if [ -d $dir ]; then
  rm -rf $dir
else
  echo "brand-new install..."
fi
mkdir -p $dir
cp -R . $dir

echo "installed:"
ls -al $dir
