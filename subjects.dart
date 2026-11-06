/// A subject is data, not code: adding one never requires rewriting the app.
class Subject {
  final String id;
  final String nameEn;
  final String nameAr;
  final bool isLab;
  const Subject(this.id, this.nameEn, this.nameAr, {this.isLab = false});
}

class SubjectRegistry {
  final Map<String, Subject> _items = {};

  SubjectRegistry();

  factory SubjectRegistry.withDefaults() {
    final r = SubjectRegistry();
    for (final s in _defaults) {
      r.register(s);
    }
    return r;
  }

  void register(Subject s) {
    if (_items.containsKey(s.id)) {
      throw ArgumentError('Duplicate subject id: ${s.id}');
    }
    _items[s.id] = s;
  }

  List<Subject> get all => List.unmodifiable(_items.values);
  Subject? byId(String id) => _items[id];

  /// Every (user, subject) pair gets its own storage path, so subject
  /// content and user data are never mixed.
  static String storagePath(String userId, String subjectId) =>
      'users/$userId/kb/$subjectId';
}

const _defaults = <Subject>[
  Subject('manufacturing', 'Manufacturing Processes', 'عمليات التصنيع'),
  Subject('ice', 'Internal Combustion Engines', 'محركات الاحتراق الداخلي'),
  Subject('analysis', 'Mathematical Analysis', 'التحليل الرياضي'),
  Subject('gasdyn', 'Gas Dynamics', 'ديناميك الغازات'),
  Subject('manufacturing_lab', 'Manufacturing Lab', 'مختبر التصنيع', isLab: true),
  Subject('ice_lab', 'Engines Lab', 'مختبر المحركات', isLab: true),
  Subject('gasdyn_lab', 'Gas Dynamics Lab', 'مختبر ديناميك الغاز', isLab: true),
];
