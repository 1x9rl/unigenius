import 'package:flutter/material.dart';

ThemeData ugTheme(Brightness b) => ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF3D5AFE),
        brightness: b,
      ),
    );
