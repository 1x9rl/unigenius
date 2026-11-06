import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'app/theme.dart';
import 'features/home/home_screen.dart';

void main() => runApp(const UniGeniusApp());

class UniGeniusApp extends StatefulWidget {
  const UniGeniusApp({super.key});
  @override
  State<UniGeniusApp> createState() => _UniGeniusAppState();
}

class _UniGeniusAppState extends State<UniGeniusApp> {
  bool _arabic = true;
  ThemeMode _mode = ThemeMode.dark;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UNI GENIUS',
      debugShowCheckedModeBanner: false,
      theme: ugTheme(Brightness.light),
      darkTheme: ugTheme(Brightness.dark),
      themeMode: _mode,
      locale: Locale(_arabic ? 'ar' : 'en'),
      supportedLocales: const [Locale('ar'), Locale('en')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: HomeScreen(
        isArabic: _arabic,
        onToggleLang: () => setState(() => _arabic = !_arabic),
        onToggleTheme: () => setState(() =>
            _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark),
      ),
    );
  }
}
