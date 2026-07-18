"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────
// Údaje provozovatele (správce osobních údajů dle GDPR).
// ─────────────────────────────────────────────────────────────────────────
const CONTROLLER_NAME = "Modifive Studio";
const CONTROLLER_EMAIL = "modifivestudio@gmail.com";

const CONTENT = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: 2026",
    sections: [
      { h: "1. Who we are (Data Controller)", b:
        `The controller of your personal data is ${CONTROLLER_NAME}, contact: ${CONTROLLER_EMAIL}. If you have any questions about how your data is handled, please contact us at this address.` },
      { h: "2. What data we collect", b:
        "We collect: (a) your email address, used to create and secure your account; (b) your garden data – plants, garden beds, harvest log entries you create; (c) your progress in the FloraPlay idle game (in-game currency, unlocked slots, planted items, tutorial status); (d) basic profile info you choose to provide (city, preferred language); (e) messages and, if you choose to share them, photos of plants/pests you send to the Flora AI chat assistant. We do not collect payment data, as the app has no paid features." },
      { h: "3. Why we collect it (legal basis)", b:
        "We process this data to provide the service you signed up for – i.e. to run your account, save your garden and harvest records, keep track of your game progress, and answer your questions in the Flora AI chat. The legal basis is performance of a contract (Art. 6(1)(b) GDPR): without this data, we could not provide the app's core functionality." },
      { h: "4. Who processes your data (sub-processors)", b:
        "We use the following processors to run the app: Supabase (database, authentication and file storage), Vercel (application hosting), Google (Gemini API – processes the messages and, if you send any, the plant/pest photos you share with the Flora AI chat, in order to generate a reply), and OpenWeatherMap (turns the city you enter into a local weather forecast). All of these may store or process data on servers located outside your country; they are bound by data processing agreements and provide appropriate safeguards for international transfers." },
      { h: "5. How long we keep it", b:
        "We keep your data for as long as your account exists. If you delete your account, your data is permanently deleted, generally within a few minutes (see Section 7). Chat messages sent to the Flora AI assistant are processed by Google to generate a reply and are not stored by us for any other purpose beyond your visible chat history." },
      { h: "6. Cookies & local storage", b:
        "We use your browser's local storage to remember your language and theme preference. This is strictly functional and does not track you across other websites. We do not use third-party advertising or analytics cookies." },
      { h: "7. Your rights", b:
        "Under GDPR you have the right to: access the personal data we hold about you; request correction of inaccurate data; request erasure of your data (\"right to be forgotten\") – you can delete your account and all associated data at any time from Settings; request a copy of your data in a portable format; object to processing; and lodge a complaint with your local data protection authority. To exercise any of these rights, contact us at the email above." },
      { h: "8. Age requirement", b:
        "The App is not directed at children and is not intended for use by anyone under 16 years of age. We do not knowingly collect personal data from children under 16. If you believe a child has provided us with personal data, please contact us at the email above so we can delete it." },
      { h: "9. Changes to this policy", b:
        "We may update this policy from time to time. Material changes will be reflected by updating the date at the top of this page." },
    ],
  },
  cs: {
    title: "Zásady ochrany osobních údajů",
    updated: "Poslední aktualizace: 2026",
    sections: [
      { h: "1. Kdo jsme (správce údajů)", b:
        `Správcem vašich osobních údajů je ${CONTROLLER_NAME}, kontakt: ${CONTROLLER_EMAIL}. S jakýmikoli dotazy ohledně zpracování vašich údajů se na nás obraťte na uvedenou adresu.` },
      { h: "2. Jaká data sbíráme", b:
        "Sbíráme: (a) váš e-mail, který slouží k vytvoření a zabezpečení účtu; (b) vaše zahradní data – rostliny, záhony a záznamy o sklizni, které si sami vytvoříte; (c) váš postup v mini-hře FloraPlay (herní měnu, odemčené sloty, zasazené rostliny, stav tutoriálu); (d) základní údaje profilu, které dobrovolně vyplníte (město, preferovaný jazyk); (e) zprávy a případně fotky rostlin/škůdců, které dobrovolně pošlete do AI chatu s Florou. Nesbíráme platební údaje, aplikace nemá žádné placené funkce." },
      { h: "3. Proč data sbíráme (právní základ)", b:
        "Tato data zpracováváme za účelem poskytnutí služby, o kterou jste projevili zájem – tedy provoz vašeho účtu, uložení vašich zahradních a sklizňových záznamů, sledování herního postupu a zodpovězení vašich dotazů v AI chatu s Florou. Právním základem je plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR): bez těchto údajů bychom nemohli poskytnout základní funkčnost aplikace." },
      { h: "4. Kdo vaše data zpracovává (zpracovatelé)", b:
        "Pro provoz aplikace využíváme následující zpracovatele: Supabase (databáze, přihlašování a ukládání souborů), Vercel (hosting aplikace), Google (Gemini API – zpracovává zprávy a případné fotky rostlin/škůdců, které pošlete do AI chatu s Florou, aby mohl vygenerovat odpověď) a OpenWeatherMap (na základě zadaného města vytváří místní předpověď počasí). Všichni tito zpracovatelé mohou ukládat či zpracovávat data na serverech mimo vaši zemi; všichni jsou vázáni smlouvami o zpracování údajů a poskytují odpovídající záruky pro mezinárodní přenosy dat." },
      { h: "5. Jak dlouho data uchováváme", b:
        "Vaše data uchováváme po dobu existence vašeho účtu. Pokud účet smažete, vaše data se trvale odstraní, obvykle během několika minut (viz bod 7). Zprávy odeslané do AI chatu s Florou zpracovává Google pouze za účelem vygenerování odpovědi a my je jinak neukládáme mimo vaši viditelnou historii chatu." },
      { h: "6. Cookies a lokální úložiště", b:
        "Používáme lokální úložiště vašeho prohlížeče k zapamatování vašeho jazyka a barevného tématu. Jde čistě o funkční účel, nesledujeme vás pomocí toho na jiných webech. Nepoužíváme reklamní ani analytické cookies třetích stran." },
      { h: "7. Vaše práva", b:
        "Podle GDPR máte právo: na přístup k osobním údajům, které o vás vedeme; na opravu nepřesných údajů; na výmaz vašich údajů (\"právo být zapomenut\") – účet i všechna navázaná data si můžete kdykoli smazat v Nastavení; na přenositelnost údajů v strojově čitelném formátu; vznést námitku proti zpracování; a podat stížnost u místního úřadu pro ochranu osobních údajů. Pro uplatnění těchto práv nás kontaktujte na výše uvedeném e-mailu." },
      { h: "8. Věková hranice", b:
        "Aplikace není určena dětem a není zamýšlena pro použití osobami mladšími 16 let. Vědomě nesbíráme osobní údaje od dětí mladších 16 let. Pokud se domníváte, že nám dítě poskytlo osobní údaje, kontaktujte nás na výše uvedeném e-mailu, abychom je mohli smazat." },
      { h: "9. Změny těchto zásad", b:
        "Tyto zásady můžeme čas od času aktualizovat. Podstatné změny se projeví aktualizací data v horní části této stránky." },
    ],
  },
  de: {
    title: "Datenschutzerklärung",
    updated: "Zuletzt aktualisiert: 2026",
    sections: [
      { h: "1. Wer wir sind (Verantwortlicher)", b:
        `Verantwortlicher für Ihre personenbezogenen Daten ist ${CONTROLLER_NAME}, Kontakt: ${CONTROLLER_EMAIL}. Bei Fragen zur Verarbeitung Ihrer Daten kontaktieren Sie uns bitte unter dieser Adresse.` },
      { h: "2. Welche Daten wir sammeln", b:
        "Wir erheben: (a) Ihre E-Mail-Adresse zur Erstellung und Absicherung Ihres Kontos; (b) Ihre Gartendaten – Pflanzen, Beete und Ernteeinträge, die Sie selbst erstellen; (c) Ihren Fortschritt im Idle-Spiel FloraPlay (Spielwährung, freigeschaltete Plätze, gepflanzte Objekte, Tutorial-Status); (d) grundlegende Profilangaben, die Sie freiwillig machen (Stadt, bevorzugte Sprache); (e) Nachrichten und, falls Sie diese freiwillig teilen, Fotos von Pflanzen/Schädlingen, die Sie an den Flora-KI-Chat senden. Wir erheben keine Zahlungsdaten, da die App keine kostenpflichtigen Funktionen hat." },
      { h: "3. Warum wir Daten erheben (Rechtsgrundlage)", b:
        "Wir verarbeiten diese Daten, um den von Ihnen gewünschten Dienst bereitzustellen – also Ihr Konto zu betreiben, Ihre Garten- und Ernteeinträge zu speichern, Ihren Spielfortschritt zu verfolgen und Ihre Fragen im Flora-KI-Chat zu beantworten. Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO): ohne diese Daten könnten wir die Kernfunktionen der App nicht bereitstellen." },
      { h: "4. Wer Ihre Daten verarbeitet (Auftragsverarbeiter)", b:
        "Zum Betrieb der App nutzen wir folgende Auftragsverarbeiter: Supabase (Datenbank, Authentifizierung und Dateispeicherung), Vercel (App-Hosting), Google (Gemini API – verarbeitet die Nachrichten und ggf. die Pflanzen-/Schädlingsfotos, die Sie im Flora-KI-Chat teilen, um eine Antwort zu erzeugen) und OpenWeatherMap (erstellt aus der von Ihnen angegebenen Stadt eine lokale Wettervorhersage). Alle können Daten auf Servern außerhalb Ihres Landes speichern oder verarbeiten; alle sind durch Auftragsverarbeitungsverträge gebunden und bieten angemessene Garantien für internationale Datenübermittlungen." },
      { h: "5. Wie lange wir Daten speichern", b:
        "Wir speichern Ihre Daten, solange Ihr Konto besteht. Wenn Sie Ihr Konto löschen, werden Ihre Daten dauerhaft gelöscht, in der Regel innerhalb weniger Minuten (siehe Abschnitt 7). Nachrichten an den Flora-KI-Chat werden von Google ausschließlich zur Erzeugung einer Antwort verarbeitet und von uns darüber hinaus nicht gespeichert." },
      { h: "6. Cookies & lokaler Speicher", b:
        "Wir nutzen den lokalen Speicher Ihres Browsers, um Ihre Sprach- und Design-Einstellung zu merken. Dies dient rein funktionalen Zwecken und verfolgt Sie nicht auf anderen Websites. Wir verwenden keine Werbe- oder Analyse-Cookies von Drittanbietern." },
      { h: "7. Ihre Rechte", b:
        "Gemäß DSGVO haben Sie das Recht auf: Auskunft über die von uns gespeicherten Daten; Berichtigung unrichtiger Daten; Löschung Ihrer Daten (\"Recht auf Vergessenwerden\") – Sie können Ihr Konto und alle zugehörigen Daten jederzeit in den Einstellungen löschen; Datenübertragbarkeit in einem maschinenlesbaren Format; Widerspruch gegen die Verarbeitung; und Beschwerde bei Ihrer lokalen Datenschutzbehörde. Um eines dieser Rechte auszuüben, kontaktieren Sie uns unter der oben genannten E-Mail." },
      { h: "8. Altersgrenze", b:
        "Die App richtet sich nicht an Kinder und ist nicht für die Nutzung durch Personen unter 16 Jahren bestimmt. Wir erheben wissentlich keine personenbezogenen Daten von Kindern unter 16 Jahren. Falls Sie glauben, dass ein Kind uns personenbezogene Daten mitgeteilt hat, kontaktieren Sie uns bitte unter der oben genannten E-Mail, damit wir diese löschen können." },
      { h: "9. Änderungen dieser Richtlinie", b:
        "Wir können diese Richtlinie von Zeit zu Zeit aktualisieren. Wesentliche Änderungen spiegeln sich im Datum oben auf dieser Seite wider." },
    ],
  },
  pl: {
    title: "Polityka Prywatności",
    updated: "Ostatnia aktualizacja: 2026",
    sections: [
      { h: "1. Kim jesteśmy (Administrator danych)", b:
        `Administratorem Twoich danych osobowych jest ${CONTROLLER_NAME}, kontakt: ${CONTROLLER_EMAIL}. W razie pytań dotyczących przetwarzania Twoich danych prosimy o kontakt pod tym adresem.` },
      { h: "2. Jakie dane zbieramy", b:
        "Zbieramy: (a) Twój adres e-mail, służący do utworzenia i zabezpieczenia konta; (b) Twoje dane ogrodowe – rośliny, grządki i wpisy dziennika zbiorów, które sam tworzysz; (c) Twój postęp w grze idle FloraPlay (waluta w grze, odblokowane sloty, zasadzone rośliny, status samouczka); (d) podstawowe dane profilu, które dobrowolnie podajesz (miasto, preferowany język); (e) wiadomości oraz, jeśli zdecydujesz się je udostępnić, zdjęcia roślin/szkodników wysyłane do czatu AI z Florą. Nie zbieramy danych płatniczych, ponieważ aplikacja nie posiada żadnych funkcji płatnych." },
      { h: "3. Dlaczego zbieramy dane (podstawa prawna)", b:
        "Przetwarzamy te dane w celu świadczenia usługi, o którą wnioskowałeś – czyli obsługi Twojego konta, zapisywania danych ogrodowych i zbiorów, śledzenia postępu w grze oraz odpowiadania na Twoje pytania w czacie AI z Florą. Podstawą prawną jest wykonanie umowy (art. 6 ust. 1 lit. b RODO): bez tych danych nie moglibyśmy zapewnić podstawowej funkcjonalności aplikacji." },
      { h: "4. Kto przetwarza Twoje dane (podmioty przetwarzające)", b:
        "Do obsługi aplikacji korzystamy z następujących podmiotów przetwarzających: Supabase (baza danych, uwierzytelnianie i przechowywanie plików), Vercel (hosting aplikacji), Google (Gemini API – przetwarza wiadomości oraz ewentualne zdjęcia roślin/szkodników wysyłane w czacie AI z Florą, aby wygenerować odpowiedź) oraz OpenWeatherMap (na podstawie podanego miasta tworzy lokalną prognozę pogody). Wszystkie z nich mogą przechowywać lub przetwarzać dane na serwerach poza Twoim krajem; wszystkie są związane umowami powierzenia przetwarzania danych i zapewniają odpowiednie zabezpieczenia dla międzynarodowych transferów." },
      { h: "5. Jak długo przechowujemy dane", b:
        "Przechowujemy Twoje dane tak długo, jak istnieje Twoje konto. Jeśli usuniesz konto, Twoje dane zostaną trwale usunięte, zazwyczaj w ciągu kilku minut (patrz punkt 7). Wiadomości wysyłane do czatu AI z Florą są przetwarzane przez Google wyłącznie w celu wygenerowania odpowiedzi i poza tym nie są przez nas przechowywane." },
      { h: "6. Pliki cookie i pamięć lokalna", b:
        "Używamy lokalnej pamięci Twojej przeglądarki, aby zapamiętać wybrany język i motyw kolorystyczny. Ma to charakter wyłącznie funkcjonalny i nie śledzi Cię na innych stronach. Nie używamy reklamowych ani analitycznych plików cookie stron trzecich." },
      { h: "7. Twoje prawa", b:
        "Zgodnie z RODO masz prawo do: dostępu do swoich danych osobowych; sprostowania nieprawidłowych danych; usunięcia swoich danych (\"prawo do bycia zapomnianym\") – konto i wszystkie powiązane dane możesz usunąć w dowolnym momencie w Ustawieniach; przenoszenia danych w formacie nadającym się do odczytu maszynowego; sprzeciwu wobec przetwarzania; oraz wniesienia skargi do lokalnego organu ochrony danych osobowych. Aby skorzystać z tych praw, skontaktuj się z nami pod powyższym adresem e-mail." },
      { h: "8. Granica wieku", b:
        "Aplikacja nie jest skierowana do dzieci i nie jest przeznaczona do użytku przez osoby poniżej 16 roku życia. Świadomie nie zbieramy danych osobowych dzieci poniżej 16 roku życia. Jeśli uważasz, że dziecko przekazało nam dane osobowe, skontaktuj się z nami pod powyższym adresem e-mail, abyśmy mogli je usunąć." },
      { h: "9. Zmiany niniejszej polityki", b:
        "Możemy od czasu do czasu aktualizować niniejszą politykę. Istotne zmiany będą odzwierciedlone przez aktualizację daty na górze tej strony." },
    ],
  },
};

const BACK_LABEL = { en: "Back", cs: "Zpět", de: "Zurück", pl: "Wstecz" };

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const { lang } = useLang();
  const c = CONTENT[lang as keyof typeof CONTENT] ?? CONTENT.en;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-5 py-8 safe-top font-serif" style={{ paddingTop: "calc(env(safe-area-inset-top) + 28px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 40px)" }}>
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-forest-600 dark:text-forest-400 mb-6 font-sans font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {BACK_LABEL[lang as keyof typeof BACK_LABEL] ?? BACK_LABEL.en}
        </button>

        <h1 className="text-3xl font-bold text-bark-900 dark:text-gray-100 mb-1">{c.title}</h1>
        <p className="text-xs text-stone-400 dark:text-gray-600 mb-8 font-sans">{c.updated}</p>

        <div className="space-y-6">
          {c.sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-bold text-base text-bark-900 dark:text-gray-100 mb-1.5">{s.h}</h2>
              <p className="text-sm text-stone-600 dark:text-gray-400 leading-relaxed">{s.b}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-stone-400 dark:text-gray-600 mt-10 font-sans">
          {lang === "cs" ? "Viz také naše" : lang === "de" ? "Siehe auch unsere" : lang === "pl" ? "Zobacz również nasz" : "See also our"}{" "}
          <Link href="/terms" className="underline underline-offset-2">
            {lang === "cs" ? "Podmínky užití" : lang === "de" ? "Nutzungsbedingungen" : lang === "pl" ? "Regulamin" : "Terms of Use"}
          </Link>.
        </p>
      </div>
    </div>
  );
}
