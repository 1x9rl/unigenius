import 'package:flutter_test/flutter_test.dart';
import 'package:unigenius/core/modules.dart';
import 'package:unigenius/core/subjects.dart';

void main() {
  test('7 subjects, unique ids, 3 labs', () {
    final r = SubjectRegistry.withDefaults();
    expect(r.all.length, 7);
    expect(r.all.map((s) => s.id).toSet().length, 7);
    expect(r.all.where((s) => s.isLab).length, 3);
  });

  test('duplicate subject is rejected; new subject needs no code change', () {
    final r = SubjectRegistry.withDefaults();
    expect(() => r.register(const Subject('ice', 'x', 'x')), throwsArgumentError);
    r.register(const Subject('thermo', 'Thermodynamics', 'الثرموداينمك'));
    expect(r.all.length, 8);
  });

  test('storage is separated per user and per subject', () {
    expect(SubjectRegistry.storagePath('mahdi', 'ice'),
        isNot(SubjectRegistry.storagePath('mahdi', 'gasdyn')));
    expect(SubjectRegistry.storagePath('mahdi', 'ice'),
        isNot(SubjectRegistry.storagePath('mustafa', 'ice')));
  });

  test('stubs are honest: not implemented, never fake output', () {
    for (final i in ModuleRegistry.phase1().diagnostics()) {
      expect(i.status, EngineStatus.notImplemented);
    }
    expect(() => const StubLlm().generate('hi'), throwsUnsupportedError);
  });
}
