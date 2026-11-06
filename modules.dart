/// Module contracts. Each engine is replaceable behind its interface.
/// In Phase 1 every engine is an honest stub: it reports notImplemented
/// and never returns made-up output.
enum EngineStatus { notImplemented, ready, failed }

class EngineInfo {
  final String name;
  final EngineStatus status;
  final String note;
  const EngineInfo(this.name, this.status, [this.note = '']);
}

abstract class UgModule {
  EngineInfo get info;
}

class Citation {
  final String file;
  final int page;
  const Citation(this.file, this.page);
}

abstract class LocalLlmEngine implements UgModule {
  Stream<String> generate(String prompt);
}

abstract class OcrEngine implements UgModule {
  Future<String> recognize(String imagePath);
}

abstract class VisionEngine implements UgModule {
  Future<String> analyze(String imagePath, String question);
}

abstract class KnowledgeBase implements UgModule {
  Future<List<Citation>> search(String subjectId, String query);
}

abstract class CalcEngine implements UgModule {
  /// Deterministic math only; the LLM never computes numbers.
  Future<Map<String, Object>> solve(String formulaId, Map<String, double> given);
}

class _Stub implements UgModule {
  final String name;
  const _Stub(this.name);
  @override
  EngineInfo get info =>
      EngineInfo(name, EngineStatus.notImplemented, 'Not built yet');
  Never no() => throw UnsupportedError('$name is not implemented yet');
}

class StubLlm extends _Stub implements LocalLlmEngine {
  const StubLlm() : super('LocalLlmEngine');
  @override
  Stream<String> generate(String prompt) => no();
}

class StubOcr extends _Stub implements OcrEngine {
  const StubOcr() : super('OcrEngine');
  @override
  Future<String> recognize(String imagePath) => no();
}

class StubVision extends _Stub implements VisionEngine {
  const StubVision() : super('VisionEngine');
  @override
  Future<String> analyze(String imagePath, String question) => no();
}

class StubKb extends _Stub implements KnowledgeBase {
  const StubKb() : super('KnowledgeBase');
  @override
  Future<List<Citation>> search(String subjectId, String query) => no();
}

class StubCalc extends _Stub implements CalcEngine {
  const StubCalc() : super('CalcEngine');
  @override
  Future<Map<String, Object>> solve(
          String formulaId, Map<String, double> given) =>
      no();
}

/// Diagnostics module: one place that says what really works.
class ModuleRegistry {
  final List<UgModule> modules;
  const ModuleRegistry(this.modules);

  factory ModuleRegistry.phase1() => const ModuleRegistry(
      [StubLlm(), StubOcr(), StubVision(), StubKb(), StubCalc()]);

  List<EngineInfo> diagnostics() => modules.map((m) => m.info).toList();
}
