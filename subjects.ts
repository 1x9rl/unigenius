export type Subject = {id:string; en:string; ar:string; lab?:boolean; description:string; icon:string};
// Preserved from the original Flutter SubjectRegistry: same seven subject IDs and names.
export const subjects:Subject[]=[
{id:'manufacturing',en:'Manufacturing Processes',ar:'عمليات التصنيع',description:'عمليات التشغيل والتشكيل والمواد وخواصها.',icon:'⚙️'},
{id:'ice',en:'Internal Combustion Engines',ar:'محركات الاحتراق الداخلي',description:'دورات المحركات، الأداء، الاحتراق والانبعاثات.',icon:'🔥'},
{id:'analysis',en:'Mathematical Analysis',ar:'التحليل الرياضي',description:'التفاضل والتكامل والمعادلات والتطبيقات الهندسية.',icon:'∫'},
{id:'gasdyn',en:'Gas Dynamics',ar:'ديناميك الغازات',description:'الجريان الانضغاطي والموجات الصدمية والفوهات.',icon:'🌬️'},
{id:'manufacturing_lab',en:'Manufacturing Lab',ar:'مختبر التصنيع',lab:true,description:'التجارب والقياسات وتقارير مختبر التصنيع.',icon:'🧪'},
{id:'ice_lab',en:'Engines Lab',ar:'مختبر المحركات',lab:true,description:'تجارب المحركات وحسابات الأداء.',icon:'🔬'},
{id:'gasdyn_lab',en:'Gas Dynamics Lab',ar:'مختبر ديناميك الغاز',lab:true,description:'تجارب الجريان الانضغاطي وتحليل النتائج.',icon:'📈'}];
