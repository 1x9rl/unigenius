export type CalcResult={title:string;formula:string;steps:string[];result:string;unit:string;warning?:string};
const n=(v:string)=>{const x=Number(v);if(!Number.isFinite(x))throw new Error('تأكد من إدخال أرقام صحيحة في كل الحقول.');return x};
export function solve(kind:string,raw:Record<string,string>):CalcResult{
 if(kind==='density'){const m=n(raw.mass),v=n(raw.volume);if(v<=0)throw new Error('الحجم يجب أن يكون أكبر من صفر.');const r=m/v;return{title:'الكثافة',formula:'ρ = m / V',steps:[`الكتلة m = ${m} kg`,`الحجم V = ${v} m³`,`ρ = ${m} ÷ ${v}`],result:r.toFixed(5),unit:'kg/m³'}}
 if(kind==='ideal-gas'){const p=n(raw.pressure),v=n(raw.volume),t=n(raw.temperature);if(t<=0)throw new Error('درجة الحرارة المطلقة يجب أن تكون أكبر من صفر كلفن.');const r=p*v/(8.314462618*t);return{title:'كمية المادة من قانون الغاز المثالي',formula:'n = PV / (RT)',steps:[`P = ${p} Pa`,`V = ${v} m³`,`T = ${t} K`,`n = (${p} × ${v}) / (8.314462618 × ${t})`],result:r.toFixed(6),unit:'mol',warning:'تأكد من إدخال الضغط بالباسكال والحجم بالمتر المكعب ودرجة الحرارة بالكلفن.'}}
 if(kind==='compression'){const v1=n(raw.v1),v2=n(raw.v2);if(v1<=0||v2<=0)throw new Error('الأحجام يجب أن تكون موجبة.');const r=v1/v2;return{title:'نسبة الانضغاط',formula:'r = V₁ / V₂',steps:[`الحجم قبل الانضغاط V₁ = ${v1}`,`الحجم بعد الانضغاط V₂ = ${v2}`,`r = ${v1} ÷ ${v2}`],result:r.toFixed(4),unit:': 1'}}
 if(kind==='mach'){const u=n(raw.velocity),a=n(raw.sound);if(a<=0)throw new Error('سرعة الصوت يجب أن تكون أكبر من صفر.');const r=u/a;return{title:'عدد ماخ',formula:'Ma = V / a',steps:[`سرعة الجريان V = ${u} m/s`,`سرعة الصوت a = ${a} m/s`,`Ma = ${u} ÷ ${a}`],result:r.toFixed(5),unit:'—'}}
 if(kind==='heat'){const m=n(raw.mass),cp=n(raw.cp),dt=n(raw.delta);const r=m*cp*dt;return{title:'الحرارة المحسوسة',formula:'Q = m cₚ ΔT',steps:[`m = ${m} kg`,`cₚ = ${cp} J/(kg·K)`,`ΔT = ${dt} K`,`Q = ${m} × ${cp} × ${dt}`],result:r.toFixed(3),unit:'J'}}
 throw new Error('هذه المعادلة غير متاحة بعد.');
}
