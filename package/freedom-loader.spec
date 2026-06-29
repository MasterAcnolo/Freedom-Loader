Name:           freedom-loader
Version:        __VERSION__
Release:        1%{?dist}
Summary:        GUI for yt-dlp media downloads
License:        GPL-3.0-only
Source0:        freedom-loader-__VERSION__.x86_64.rpm
BuildArch:      x86_64
Requires:       glibc, gtk3, nss, libXScrnSaver

%description
GUI for yt-dlp media downloads.

%install
rpm2cpio %{SOURCE0} | (cd %{buildroot} && cpio -idmv)
mkdir -p %{buildroot}/usr/bin
ln -sf "/opt/Freedom Loader/freedom-loader" %{buildroot}/usr/bin/freedom-loader

%files
/opt/*
/usr/bin/freedom-loader
/usr/share/applications/*
/usr/share/metainfo/*
/usr/share/icons/hicolor

%changelog