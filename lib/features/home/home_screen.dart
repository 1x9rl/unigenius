
import 'package:flutter/material.dart';
import '../../data/subjects.dart';

enum AnswerMode { quick, study, professor }

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.isArabic,
    required this.onToggleLang,
    required this.onToggleTheme,
  });

  final bool isArabic;
  final VoidCallback onToggleLang;
  final VoidCallback onToggleTheme;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _registry = SubjectRegistry.withDefaults();
  late String _subjectId = _registry.all.first.id;
  AnswerMode _mode = AnswerMode.quick;

  String _t(String en, String ar) => widget.isArabic ? ar : en;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('UNI GENIUS'),
        actions: [
          IconButton(
            onPressed: widget.onToggleTheme,
            icon: const Icon(Icons.brightness_6),
          ),
          TextButton(
            onPressed: widget.onToggleLang,
            child: Text(widget.isArabic ? 'EN' : 'عربي'),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            SizedBox(
              height: 52,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: [
                  for (final s in _registry.all)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: ChoiceChip(
                        label: Text(
                          widget.isArabic ? s.nameAr : s.nameEn,
                        ),
                        selected: s.id == _subjectId,
                        onSelected: (_) {
                          setState(() => _subjectId = s.id);
                        },
                      ),
                    ),
                ],
              ),
            ),
            Expanded(
              child: Container(
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(24),
                ),
                alignment: Alignment.center,
                padding: const EdgeInsets.all(24),
                child: Text(
                  _t(
                    'Camera not connected yet (Phase 3)',
                    'الكاميرا غير مربوطة بعد (المرحلة 3)',
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
            SegmentedButton<AnswerMode>(
              segments: [
                ButtonSegment(
                  value: AnswerMode.quick,
                  label: Text(_t('Quick', 'سريع')),
                ),
                ButtonSegment(
                  value: AnswerMode.study,
                  label: Text(_t('Study', 'دراسة')),
                ),
                ButtonSegment(
                  value: AnswerMode.professor,
                  label: Text(_t('Professor', 'بروفيسور')),
                ),
              ],
              selected: {_mode},
              onSelectionChanged: (v) {
                setState(() => _mode = v.first);
              },
            ),
            const SizedBox(height: 16),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                IconButton.filledTonal(
                  onPressed: null,
                  iconSize: 36,
                  icon: Icon(Icons.mic),
                ),
                IconButton.filled(
                  onPressed: null,
                  iconSize: 48,
                  icon: Icon(Icons.camera_alt),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
