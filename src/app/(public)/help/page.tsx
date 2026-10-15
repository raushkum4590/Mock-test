import { getUiLang } from "@/lib/i18n/server-lang";
import { BRAND, st } from "@/lib/i18n/site";

export const metadata = { title: "Help" };

const FAQ = {
  en: [
    ["How is the timer controlled?", "When you start a timed test, the server fixes your deadline (start time + duration). The countdown follows the server clock, so changing your computer's clock has no effect. When time runs out the server submits your test automatically, even if you have closed the browser."],
    ["What if my internet drops or I refresh the page?", "Every answer is saved to the server and marked “Saved” only after the server confirms it. Unsaved answers are kept in your browser and retried. If you refresh or reconnect, your test resumes with your answers and the remaining time. The clock keeps running while you are away."],
    ["Can I switch between Hindi and English?", "Yes, at any time during the test. Your selected answers do not change."],
    ["How is my score calculated?", "Score = marks for correct answers − negative marks for wrong answers, using the marking scheme shown on each test. Unanswered questions score zero. Answers marked for review are evaluated if an option is selected."],
    ["When do I see solutions?", "Most tests show the score and detailed solutions right after you submit. Some tests release results at a fixed time; this is shown on the test page."],
    ["How does the leaderboard work?", "Only each student's first attempt counts. Higher score ranks first; for equal scores, less time ranks first. Only display names are shown, and you can hide yours in your profile. This is a mock ranking, not an official rank."],
    ["I forgot my password.", "Use “Forgot password?” on the log-in page to receive a reset link valid for 30 minutes."],
  ],
  hi: [
    ["टाइमर कैसे नियंत्रित होता है?", "समयबद्ध टेस्ट शुरू करने पर सर्वर आपकी समय-सीमा (प्रारंभ समय + अवधि) तय करता है। उलटी गिनती सर्वर घड़ी के अनुसार चलती है, इसलिए कंप्यूटर की घड़ी बदलने से कोई प्रभाव नहीं पड़ता। समय समाप्त होने पर सर्वर आपका टेस्ट स्वतः जमा कर देता है, भले ही ब्राउज़र बंद हो।"],
    ["यदि इंटरनेट चला जाए या पेज रीफ़्रेश हो जाए तो?", "प्रत्येक उत्तर सर्वर पर सहेजा जाता है और सर्वर की पुष्टि के बाद ही “सहेजा गया” दिखता है। न सहेजे गए उत्तर ब्राउज़र में रखे जाते हैं और पुनः भेजे जाते हैं। रीफ़्रेश या पुनः जुड़ने पर आपका टेस्ट उत्तरों और शेष समय के साथ जारी रहता है। आपकी अनुपस्थिति में भी घड़ी चलती रहती है।"],
    ["क्या मैं हिंदी और अंग्रेज़ी के बीच बदल सकता हूँ?", "हाँ, टेस्ट के दौरान कभी भी। आपके चुने हुए उत्तर नहीं बदलते।"],
    ["मेरे अंक कैसे गिने जाते हैं?", "अंक = सही उत्तरों के अंक − गलत उत्तरों के ऋणात्मक अंक, प्रत्येक टेस्ट पर दिखाई गई अंकन योजना के अनुसार। अनुत्तरित प्रश्नों के अंक शून्य हैं। समीक्षा हेतु चिह्नित उत्तरों का मूल्यांकन होता है यदि विकल्प चुना गया हो।"],
    ["हल कब दिखते हैं?", "अधिकांश टेस्ट जमा करते ही अंक और विस्तृत हल दिखाते हैं। कुछ टेस्ट निश्चित समय पर परिणाम जारी करते हैं; यह टेस्ट पेज पर दिखाया जाता है।"],
    ["लीडरबोर्ड कैसे काम करता है?", "प्रत्येक विद्यार्थी का केवल पहला प्रयास गिना जाता है। अधिक अंक पहले; समान अंक पर कम समय पहले। केवल प्रदर्शन नाम दिखते हैं, और आप प्रोफ़ाइल में अपना नाम छिपा सकते हैं। यह मॉक रैंकिंग है, आधिकारिक रैंक नहीं।"],
    ["मैं अपना पासवर्ड भूल गया।", "लॉग-इन पेज पर “पासवर्ड भूल गए?” का उपयोग करें; 30 मिनट तक मान्य रीसेट लिंक मिलेगा।"],
  ],
} as const;

export default async function HelpPage() {
  const lang = await getUiLang();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">{st(lang, "helpTitle")}</h1>
      <div className="mt-6 space-y-3">
        {FAQ[lang].map(([q, a]) => (
          <details key={q} className="rounded-lg border border-border bg-surface p-4">
            <summary className="cursor-pointer font-medium">{q}</summary>
            <p className="mt-2 text-sm text-muted">{a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted">
        {lang === "hi"
          ? `संपर्क: अपने ${BRAND} व्यवस्थापक से संपर्क करें (संपर्क ईमेल व्यवस्थापक द्वारा कॉन्फ़िगर किया जाता है)।`
          : `Contact: reach your ${BRAND} administrator (the support address is configured by the site operator).`}
      </p>
    </div>
  );
}
