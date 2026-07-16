"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";

export const dynamic = "force-dynamic";

const CONTENT = {
  en: {
    title: "Terms of Use",
    updated: "Last updated: 2026",
    sections: [
      { h: "1. Acceptance of terms", b:
        "By creating an account or using Florimy (\"the App\"), you agree to these Terms of Use. If you do not agree, please do not use the App." },
      { h: "2. Provided \"as is\"", b:
        "The App, including its gardening assistant, calendar, garden bed planner, harvest log and the FloraPlay idle game, is provided \"as is\" and \"as available\", without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, or non-infringement. We do not guarantee the App will be uninterrupted, error-free, or free of harmful components." },
      { h: "3. No liability for data loss", b:
        "While we take reasonable steps to keep your data safe, we do not guarantee against data loss resulting from technical failures, database downtime, third-party service outages (e.g. our hosting or database providers), bugs, or force majeure. To the maximum extent permitted by law, the developer/operator of this App is not liable for any loss of data, garden records, harvest logs, or in-game progress." },
      { h: "4. No financial compensation", b:
        "The App is provided free of charge and has no paid features at this time. As such, no user is entitled to any financial compensation, refund, or damages of any kind arising from use of, or inability to use, the App, including but not limited to loss of data, loss of in-game progress or currency, or any indirect, incidental, or consequential damages." },
      { h: "5. User responsibilities", b:
        "You are responsible for keeping your account credentials confidential and for all activity under your account. You agree not to misuse the App, attempt to disrupt its operation, or use it for any unlawful purpose." },
      { h: "6. Account termination", b:
        "You may delete your account at any time from the Settings page, which permanently removes your account and all associated data. We may also suspend or terminate accounts that violate these Terms." },
      { h: "7. Changes to the App and these Terms", b:
        "We may modify, suspend, or discontinue any part of the App at any time, and may update these Terms from time to time. Continued use of the App after changes constitutes acceptance of the updated Terms." },
      { h: "8. Governing law", b:
        "These Terms are governed by the laws of the Czech Republic, without regard to conflict of law principles, unless mandatory consumer protection laws of your country of residence provide otherwise." },
    ],
  },
  cs: {
    title: "Podmínky užití",
    updated: "Poslední aktualizace: 2026",
    sections: [
      { h: "1. Přijetí podmínek", b:
        "Vytvořením účtu nebo používáním aplikace Florimy (\"Aplikace\") souhlasíte s těmito Podmínkami užití. Pokud s nimi nesouhlasíte, Aplikaci prosím nepoužívejte." },
      { h: "2. Poskytováno \"tak, jak je\"", b:
        "Aplikace, včetně zahradního asistenta, kalendáře, plánovače záhonů, záznamu sklizně a mini-hry FloraPlay, je poskytována \"tak, jak je\" (as is) a \"jak je dostupná\", bez jakýchkoli záruk, výslovných či předpokládaných, včetně (nikoli však výhradně) záruk prodejnosti, vhodnosti pro určitý účel, přesnosti nebo neporušování práv třetích stran. Nezaručujeme, že Aplikace bude nepřetržitě dostupná, bezchybná nebo prostá škodlivých komponent." },
      { h: "3. Vyloučení odpovědnosti za ztrátu dat", b:
        "Ačkoli podnikáme přiměřené kroky k ochraně vašich dat, nezaručujeme jejich ochranu proti ztrátě způsobené technickým selháním, výpadkem databáze, výpadkem služeb třetích stran (např. našeho poskytovatele hostingu či databáze), chybami v softwaru nebo vyšší mocí. V maximálním rozsahu povoleném zákonem neručí vývojář/provozovatel této Aplikace za žádnou ztrátu dat, zahradních záznamů, záznamů o sklizni ani herního postupu." },
      { h: "4. Žádná finanční kompenzace", b:
        "Aplikace je poskytována zdarma a v současné době nemá žádné placené funkce. Žádnému uživateli proto nevzniká nárok na jakoukoli finanční kompenzaci, náhradu škody či vrácení peněz v souvislosti s používáním Aplikace nebo nemožností ji používat, včetně (nikoli však výhradně) ztráty dat, ztráty herního postupu či herní měny, ani na jakékoli nepřímé, náhodné nebo následné škody." },
      { h: "5. Odpovědnost uživatele", b:
        "Odpovídáte za zachování důvěrnosti přihlašovacích údajů ke svému účtu a za veškerou aktivitu pod tímto účtem. Zavazujete se Aplikaci nezneužívat, nenarušovat její provoz ani ji nepoužívat k žádnému protiprávnímu účelu." },
      { h: "6. Zrušení účtu", b:
        "Svůj účet můžete kdykoli smazat na stránce Nastavení, čímž se trvale odstraní účet i všechna navázaná data. Účty porušující tyto Podmínky můžeme rovněž pozastavit nebo zrušit." },
      { h: "7. Změny Aplikace a těchto Podmínek", b:
        "Kteroukoli část Aplikace můžeme kdykoli upravit, pozastavit nebo ukončit a tyto Podmínky můžeme čas od času aktualizovat. Další používání Aplikace po provedení změn představuje souhlas s aktualizovanými Podmínkami." },
      { h: "8. Rozhodné právo", b:
        "Tyto Podmínky se řídí právním řádem České republiky, bez ohledu na kolizní normy, pokud kogentní právní předpisy na ochranu spotřebitele ve vaší zemi bydliště nestanoví jinak." },
    ],
  },
  de: {
    title: "Nutzungsbedingungen",
    updated: "Zuletzt aktualisiert: 2026",
    sections: [
      { h: "1. Annahme der Bedingungen", b:
        "Durch die Erstellung eines Kontos oder die Nutzung von Florimy (\"die App\") stimmen Sie diesen Nutzungsbedingungen zu. Wenn Sie nicht einverstanden sind, nutzen Sie die App bitte nicht." },
      { h: "2. Bereitstellung \"wie besehen\"", b:
        "Die App, einschließlich Gartenassistent, Kalender, Beetplaner, Ernte-Log und dem Idle-Spiel FloraPlay, wird \"wie besehen\" und \"wie verfügbar\" bereitgestellt, ohne jegliche ausdrückliche oder stillschweigende Gewährleistung, einschließlich, aber nicht beschränkt auf Gewährleistungen der Marktgängigkeit, Eignung für einen bestimmten Zweck, Richtigkeit oder Nichtverletzung von Rechten Dritter. Wir garantieren nicht, dass die App unterbrechungsfrei, fehlerfrei oder frei von schädlichen Komponenten ist." },
      { h: "3. Haftungsausschluss für Datenverlust", b:
        "Obwohl wir angemessene Maßnahmen zum Schutz Ihrer Daten ergreifen, garantieren wir keinen Schutz vor Datenverlust durch technische Ausfälle, Datenbank-Ausfallzeiten, Ausfälle von Drittanbieterdiensten (z. B. unserer Hosting- oder Datenbankanbieter), Softwarefehler oder höhere Gewalt. Im gesetzlich zulässigen Umfang haftet der Entwickler/Betreiber dieser App nicht für den Verlust von Daten, Gartenaufzeichnungen, Ernteprotokollen oder Spielfortschritt." },
      { h: "4. Keine finanzielle Entschädigung", b:
        "Die App wird kostenlos bereitgestellt und hat derzeit keine kostenpflichtigen Funktionen. Daher hat kein Nutzer Anspruch auf finanzielle Entschädigung, Rückerstattung oder Schadensersatz jeglicher Art im Zusammenhang mit der Nutzung oder Nichtnutzbarkeit der App, einschließlich, aber nicht beschränkt auf Datenverlust, Verlust von Spielfortschritt oder Spielwährung, sowie keine indirekten, zufälligen oder Folgeschäden." },
      { h: "5. Pflichten des Nutzers", b:
        "Sie sind dafür verantwortlich, Ihre Kontodaten vertraulich zu behandeln und für sämtliche Aktivitäten unter Ihrem Konto. Sie verpflichten sich, die App nicht zu missbrauchen, ihren Betrieb nicht zu stören und sie nicht für rechtswidrige Zwecke zu nutzen." },
      { h: "6. Kontobeendigung", b:
        "Sie können Ihr Konto jederzeit in den Einstellungen löschen, wodurch Ihr Konto und alle zugehörigen Daten dauerhaft entfernt werden. Wir können auch Konten sperren oder beenden, die gegen diese Bedingungen verstoßen." },
      { h: "7. Änderungen der App und dieser Bedingungen", b:
        "Wir können jederzeit Teile der App ändern, aussetzen oder einstellen und diese Bedingungen von Zeit zu Zeit aktualisieren. Die fortgesetzte Nutzung der App nach Änderungen gilt als Zustimmung zu den aktualisierten Bedingungen." },
      { h: "8. Anwendbares Recht", b:
        "Diese Bedingungen unterliegen dem Recht der Tschechischen Republik, unter Ausschluss des Kollisionsrechts, sofern zwingende Verbraucherschutzvorschriften Ihres Wohnsitzlandes nichts anderes vorsehen." },
    ],
  },
  pl: {
    title: "Regulamin",
    updated: "Ostatnia aktualizacja: 2026",
    sections: [
      { h: "1. Akceptacja regulaminu", b:
        "Tworząc konto lub korzystając z aplikacji Florimy (\"Aplikacja\"), akceptujesz niniejszy Regulamin. Jeśli się nie zgadzasz, prosimy nie korzystać z Aplikacji." },
      { h: "2. Udostępniane \"tak jak jest\"", b:
        "Aplikacja, w tym asystent ogrodniczy, kalendarz, planer grządek, dziennik zbiorów oraz gra idle FloraPlay, jest udostępniana \"tak jak jest\" i \"w miarę dostępności\", bez jakichkolwiek gwarancji, wyraźnych ani dorozumianych, w tym między innymi gwarancji przydatności handlowej, przydatności do określonego celu, dokładności czy nienaruszania praw osób trzecich. Nie gwarantujemy, że Aplikacja będzie działać nieprzerwanie, bezbłędnie ani bez szkodliwych elementów." },
      { h: "3. Wyłączenie odpowiedzialności za utratę danych", b:
        "Choć podejmujemy rozsądne kroki w celu ochrony Twoich danych, nie gwarantujemy ochrony przed ich utratą wynikającą z awarii technicznych, przestojów bazy danych, awarii usług stron trzecich (np. naszego dostawcy hostingu lub bazy danych), błędów oprogramowania czy siły wyższej. W maksymalnym zakresie dozwolonym przez prawo twórca/operator tej Aplikacji nie ponosi odpowiedzialności za utratę danych, wpisów ogrodowych, dziennika zbiorów ani postępu w grze." },
      { h: "4. Brak rekompensaty finansowej", b:
        "Aplikacja jest udostępniana bezpłatnie i obecnie nie posiada żadnych funkcji płatnych. W związku z tym żaden użytkownik nie ma prawa do jakiejkolwiek rekompensaty finansowej, zwrotu środków ani odszkodowania jakiegokolwiek rodzaju wynikającego z korzystania lub niemożności korzystania z Aplikacji, w tym między innymi utraty danych, utraty postępu w grze lub waluty w grze, ani żadnych szkód pośrednich, przypadkowych lub wtórnych." },
      { h: "5. Obowiązki użytkownika", b:
        "Odpowiadasz za zachowanie poufności danych logowania do swojego konta oraz za wszelką aktywność w jego ramach. Zobowiązujesz się nie nadużywać Aplikacji, nie zakłócać jej działania ani nie wykorzystywać jej do celów niezgodnych z prawem." },
      { h: "6. Zakończenie działania konta", b:
        "Możesz usunąć swoje konto w dowolnym momencie w Ustawieniach, co trwale usuwa konto i wszystkie powiązane dane. Możemy również zawiesić lub zamknąć konta naruszające niniejszy Regulamin." },
      { h: "7. Zmiany Aplikacji i niniejszego Regulaminu", b:
        "Możemy w dowolnym momencie modyfikować, zawieszać lub wycofywać dowolną część Aplikacji oraz aktualizować niniejszy Regulamin. Dalsze korzystanie z Aplikacji po wprowadzeniu zmian oznacza akceptację zaktualizowanego Regulaminu." },
      { h: "8. Prawo właściwe", b:
        "Niniejszy Regulamin podlega prawu Republiki Czeskiej, z pominięciem norm kolizyjnych, chyba że bezwzględnie obowiązujące przepisy o ochronie konsumentów kraju Twojego zamieszkania stanowią inaczej." },
    ],
  },
};

const BACK_LABEL = { en: "Back", cs: "Zpět", de: "Zurück", pl: "Wstecz" };

export default function TermsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const c = CONTENT[lang as keyof typeof CONTENT] ?? CONTENT.en;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-5 py-8 safe-top" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 40px)" }}>
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-forest-600 dark:text-forest-400 mb-6 font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {BACK_LABEL[lang as keyof typeof BACK_LABEL] ?? BACK_LABEL.en}
        </button>

        <h1 className="font-display text-3xl font-bold text-bark-900 dark:text-gray-100 mb-1">{c.title}</h1>
        <p className="text-xs text-stone-400 dark:text-gray-600 mb-8">{c.updated}</p>

        <div className="space-y-6">
          {c.sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-display font-bold text-base text-bark-900 dark:text-gray-100 mb-1.5">{s.h}</h2>
              <p className="text-sm text-stone-600 dark:text-gray-400 leading-relaxed">{s.b}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-stone-400 dark:text-gray-600 mt-10">
          {lang === "cs" ? "Viz také naše" : lang === "de" ? "Siehe auch unsere" : lang === "pl" ? "Zobacz również naszą" : "See also our"}{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2">
            {lang === "cs" ? "Zásady ochrany osobních údajů" : lang === "de" ? "Datenschutzerklärung" : lang === "pl" ? "Politykę Prywatności" : "Privacy Policy"}
          </Link>.
        </p>
      </div>
    </div>
  );
}
