export interface PlantInfo {
  cs: string; en: string; de: string; pl: string;
}

export interface PlantCatalogItem {
  id: string;
  emoji: string;
  names: Record<string, string>;
  sowMonths: number[];
  harvestMonths: number[];
  waterDays: number;
  careLevel: "easy" | "medium" | "hard";
  // Detailní informace o rostlině
  details: {
    soilPrep:    PlantInfo; // příprava záhonu
    whenToPlant: PlantInfo; // kdy zasadit
    spray:       PlantInfo; // postřik
    fertilize:   PlantInfo; // hnojení
    watering:    PlantInfo; // jak zalévat
    care:        PlantInfo; // péče o rostlinu
    harvest:     PlantInfo; // doba sklizně
    afterHarvest:PlantInfo; // péče po sklizni
  };
}

export const PLANT_CATALOG: PlantCatalogItem[] = [
  {
    id: "tomato", emoji: "🍅",
    names: { cs: "Rajče", en: "Tomato", de: "Tomate", pl: "Pomidor" },
    sowMonths: [3,4], harvestMonths: [7,8,9], waterDays: 2, careLevel: "medium",
    details: {
      soilPrep:    { cs:"Hluboce překopejte záhon (30 cm), přidejte kompost nebo zralý hnůj. Rajčata milují výživnou, propustnou půdu s pH 6–6,8.", en:"Dig deeply (30 cm), add compost or mature manure. Tomatoes love rich, well-drained soil with pH 6–6.8.", de:"Tief umgraben (30 cm), Kompost oder reifen Mist zugeben. Tomaten mögen nährstoffreichen, durchlässigen Boden mit pH 6–6,8.", pl:"Głęboko przekopać (30 cm), dodać kompost lub dojrzały obornik. Pomidory lubią żyzną, przepuszczalną glebę o pH 6–6,8." },
      whenToPlant: { cs:"Sazenice sázejte ven po 15. května (po posledních mrazech). Předpěstujte na okně od března.", en:"Plant seedlings outdoors after May 15 (after last frost). Start indoors from March.", de:"Setzlinge nach dem 15. Mai ins Freie setzen (nach dem letzten Frost). Ab März auf der Fensterbank vorziehen.", pl:"Sadzonki wysadzać na zewnątrz po 15 maja (po ostatnich przymrozkach). Hodować na parapecie od marca." },
      spray:       { cs:"Preventivně stříkejte přípravkem na plíseň (Ridomil, měďnaté přípravky) každé 2 týdny od června. Po dešti vždy opakujte.", en:"Spray preventively against blight (copper-based products) every 2 weeks from June. Always repeat after rain.", de:"Vorbeugend alle 2 Wochen ab Juni gegen Krautfäule spritzen (kupferhaltige Mittel). Nach Regen immer wiederholen.", pl:"Profilaktycznie opryskiwać środkami na zarazę (preparaty miedziowe) co 2 tygodnie od czerwca. Powtarzać po deszczu." },
      fertilize:   { cs:"Při výsadbě zapravte pomalu uvolňující hnojivo. Poté každé 2 týdny tekutým hnojivem bohatým na draslík (podpoří plodnost).", en:"Work in slow-release fertilizer at planting. Then every 2 weeks with potassium-rich liquid fertilizer (boosts fruiting).", de:"Bei der Pflanzung Langzeitdünger einarbeiten. Danach alle 2 Wochen mit kaliumreichem Flüssigdünger (fördert Fruchtbildung).", pl:"Przy sadzeniu wmieszać nawóz wolno działający. Potem co 2 tygodnie nawozem płynnym bogatym w potas (wspiera owocowanie)." },
      watering:    { cs:"Zalévejte pravidelně každé 2 dny u kořene, ne na listy. Nestejnoměrná zálivka způsobuje praskání plodů. Mulčujte pro udržení vlhkosti.", en:"Water regularly every 2 days at the base, not on leaves. Uneven watering causes fruit cracking. Mulch to retain moisture.", de:"Regelmäßig alle 2 Tage an der Wurzel gießen, nicht auf die Blätter. Unregelmäßiges Gießen verursacht Fruchtplatzen. Mulchen zur Feuchtigkeitsspeicherung.", pl:"Podlewać regularnie co 2 dni przy korzeniu, nie na liście. Nierównomierne podlewanie powoduje pękanie owoców. Mulczować dla utrzymania wilgoci." },
      care:        { cs:"Odstraňujte výhonky z paždí listů (zálistky). Vyšší odrůdy vyvazujte ke kůlu. Odlistujte spodní listy pro lepší cirkulaci vzduchu.", en:"Remove shoots from leaf axils (suckers). Tie taller varieties to a stake. Remove lower leaves for better air circulation.", de:"Ausgeizen (Seitentriebe aus den Blattachseln entfernen). Höhere Sorten an einen Pfahl binden. Untere Blätter entfernen für bessere Luftzirkulation.", pl:"Usuwać pędy boczne (wilki). Wyższe odmiany przywiązywać do palika. Usuwać dolne liście dla lepszej cyrkulacji powietrza." },
      harvest:     { cs:"Sklízejte červenec–září dle odrůdy. Plody jsou zralé, když jsou plně zbarvené a lehce povolí pod tlakem prstu.", en:"Harvest July–September depending on variety. Fruits are ripe when fully colored and slightly yield to finger pressure.", de:"Ernte Juli–September je nach Sorte. Früchte sind reif, wenn sie voll gefärbt sind und leicht auf Fingerdruck nachgeben.", pl:"Zbiory lipiec–wrzesień zależnie od odmiany. Owoce dojrzałe gdy są w pełni wybarwione i lekko ustępują pod naciskiem palca." },
      afterHarvest:{ cs:"Po sklizni vytrhněte celé rostliny i s kořeny. Přidejte kompost a záhon překopejte. Nesázejte rajčata na stejné místo 3 roky (rotace plodin).", en:"After harvest, pull out entire plants with roots. Add compost and dig over the bed. Do not plant tomatoes in the same spot for 3 years (crop rotation).", de:"Nach der Ernte gesamte Pflanzen mit Wurzeln herausziehen. Kompost zugeben und Beet umgraben. Tomaten 3 Jahre nicht an denselben Platz pflanzen (Fruchtfolge).", pl:"Po zbiorach wyrwać całe rośliny z korzeniami. Dodać kompost i przekopać grządkę. Nie sadzić pomidorów w tym samym miejscu przez 3 lata (zmianowanie)." },
    },
  },
  {
    id: "cucumber", emoji: "🥒",
    names: { cs: "Okurka", en: "Cucumber", de: "Gurke", pl: "Ogórek" },
    sowMonths: [4,5], harvestMonths: [7,8,9], waterDays: 2, careLevel: "medium",
    details: {
      soilPrep:    { cs:"Záhon obohaťte kompostem, okurky mají rády teplou, humusovitou půdu. Ideální pH 6–7. Připravte oporu (tyčky, síť).", en:"Enrich with compost, cucumbers like warm, humus-rich soil. Ideal pH 6–7. Prepare support (stakes, net).", de:"Mit Kompost anreichern, Gurken mögen warmen, humusreichen Boden. Ideales pH 6–7. Stütze vorbereiten (Stäbe, Netz).", pl:"Wzbogacić kompostem, ogórki lubią ciepłą, próchniczą glebę. Idealne pH 6–7. Przygotować podporę (tyczki, siatka)." },
      whenToPlant: { cs:"Sázejte po 15. května, okurky jsou velmi citlivé na mráz. Teplota půdy musí být min. 15 °C.", en:"Plant after May 15, cucumbers are very frost-sensitive. Soil temperature must be at least 15°C.", de:"Nach dem 15. Mai pflanzen, Gurken sind sehr frostempfindlich. Bodentemperatur muss mindestens 15°C betragen.", pl:"Sadzić po 15 maja, ogórki są bardzo wrażliwe na mróz. Temperatura gleby musi wynosić min. 15°C." },
      spray:       { cs:"Při výskytu plísně nebo mšic použijte neemový olej nebo insekticidní mýdlo. Preventivně stříkejte měďnatými přípravky.", en:"If mildew or aphids appear, use neem oil or insecticidal soap. Spray preventively with copper-based products.", de:"Bei Mehltau oder Blattläusen Neemöl oder Insektizidseife verwenden. Vorbeugend mit kupferhaltigen Mitteln spritzen.", pl:"Przy wystąpieniu mączniaka lub mszyc użyć oleju neem lub mydła insektobójczego. Profilaktycznie opryskiwać preparatami miedzianymi." },
      fertilize:   { cs:"Před výsadbou přidejte pomalu uvolňující hnojivo. V průběhu vegetace každé 3 týdny tekutým dusíkatým hnojivem.", en:"Add slow-release fertilizer before planting. During growing season every 3 weeks with liquid nitrogen fertilizer.", de:"Vor der Pflanzung Langzeitdünger zugeben. Während der Vegetation alle 3 Wochen mit flüssigem Stickstoffdünger.", pl:"Przed sadzeniem dodać nawóz wolno działający. W trakcie wegetacji co 3 tygodnie nawozem płynnym azotowym." },
      watering:    { cs:"Zalévejte vydatně každé 2 dny. Okurky obsahují 95 % vody a potřebují stálou vlhkost. Nikdy nelijte studenou vodou.", en:"Water generously every 2 days. Cucumbers are 95% water and need constant moisture. Never use cold water.", de:"Alle 2 Tage reichlich gießen. Gurken bestehen zu 95% aus Wasser und brauchen konstante Feuchtigkeit. Nie kaltes Wasser verwenden.", pl:"Podlewać obficie co 2 dni. Ogórki zawierają 95% wody i potrzebują stałej wilgoci. Nigdy nie używać zimnej wody." },
      care:        { cs:"Přivazujte k opoře. Hlavní výhon přišpuntujte nad 5. listem pro hustší větvení. Odstraňujte žluté listy.", en:"Tie to support. Pinch the main shoot above the 5th leaf for denser branching. Remove yellow leaves.", de:"An Stütze binden. Haupttrieb über dem 5. Blatt entspitzen für dichteren Wuchs. Gelbe Blätter entfernen.", pl:"Przywiązywać do podpory. Szczypać główny pęd nad 5. liściem dla gęstszego rozgałęzienia. Usuwać żółte liście." },
      harvest:     { cs:"Sklízejte denně nebo obden od července. Plody netrhejte ale stříhejte. Přezrálé okurky zpomalují tvorbu nových.", en:"Harvest daily or every other day from July. Cut fruits, don't pull. Overripe cucumbers slow new fruit formation.", de:"Ab Juli täglich oder jeden zweiten Tag ernten. Früchte schneiden, nicht reißen. Überreife Gurken verlangsamen neue Fruchtbildung.", pl:"Zbierać codziennie lub co drugi dzień od lipca. Owoce odcinać, nie wyrywać. Przejrzałe ogórki spowalniają tworzenie nowych." },
      afterHarvest:{ cs:"Rostliny odstraňte i s kořeny. Záhon prohnojte kompostem. Okurky a rajčata sázejte střídavě pro zdraví půdy.", en:"Remove plants with roots. Fertilize bed with compost. Alternate cucumbers and tomatoes for soil health.", de:"Pflanzen mit Wurzeln entfernen. Beet mit Kompost düngen. Gurken und Tomaten abwechseln für Bodengesundheit.", pl:"Usunąć rośliny z korzeniami. Nawieźć grządkę kompostem. Naprzemiennie sadzić ogórki i pomidory dla zdrowia gleby." },
    },
  },
  {
    id: "carrot", emoji: "🥕",
    names: { cs: "Mrkev", en: "Carrot", de: "Karotte", pl: "Marchew" },
    sowMonths: [3,4,5], harvestMonths: [8,9,10], waterDays: 3, careLevel: "easy",
    details: {
      soilPrep:    { cs:"Půdu hluboce prokypřte (40 cm), odstraňte kameny a hroudy. Mrkev potřebuje kyprou, písčitou půdu bez překážek. Nepřidávejte čerstvý hnůj.", en:"Deeply loosen soil (40 cm), remove stones and clods. Carrots need loose, sandy soil without obstacles. Do not add fresh manure.", de:"Boden tief lockern (40 cm), Steine und Klumpen entfernen. Möhren brauchen lockeren, sandigen Boden ohne Hindernisse. Keinen frischen Mist zugeben.", pl:"Głęboko spulchnić glebę (40 cm), usunąć kamienie i grudki. Marchew potrzebuje luźnej, piaszczystej gleby bez przeszkód. Nie dodawać świeżego obornika." },
      whenToPlant: { cs:"Sějte přímo do záhonu od března do května. Semena vyklijí za 2–3 týdny. Možný i srpnový výsev na zimní sklizeň.", en:"Sow directly in the bed from March to May. Seeds germinate in 2–3 weeks. August sowing also possible for winter harvest.", de:"Ab März bis Mai direkt ins Beet säen. Samen keimen in 2–3 Wochen. Augustaussaat für Winterernte möglich.", pl:"Siać bezpośrednio do grządki od marca do maja. Nasiona kiełkują za 2–3 tygodnie. Możliwy sierpniowy wysiew na zimowe zbiory." },
      spray:       { cs:"Hlavní škůdce je mrkvoň mrkevní. Překryjte netkanouvinou nebo použijte přípravky na bázi pyrethrinu při výskytu.", en:"Main pest is carrot fly. Cover with fleece or use pyrethrin-based products when detected.", de:"Hauptschädling ist die Möhrenfliege. Mit Vlies abdecken oder Pyrethrin-Präparate bei Befall verwenden.", pl:"Głównym szkodnikiem jest połyśnica marchwianka. Przykryć agrowłókniną lub użyć preparatów na bazie pyretrum przy wystąpieniu." },
      fertilize:   { cs:"Při výsevu zapravte hnojivo s nízkým obsahem dusíku a vyšším draslíku a fosforu. Přehnojení dusíkem způsobuje větvení kořenů.", en:"At sowing work in fertilizer with low nitrogen and higher potassium and phosphorus. Over-fertilizing with nitrogen causes forked roots.", de:"Bei der Aussaat Dünger mit niedrigem Stickstoff- und höherem Kalium- und Phosphorgehalt einarbeiten. Überdüngung mit Stickstoff verursacht Wurzelverzweigung.", pl:"Przy wysiewie wmieszać nawóz z niską zawartością azotu i wyższą potasu i fosforu. Przenawożenie azotem powoduje rozgałęzianie korzeni." },
      watering:    { cs:"Zalévejte každé 3 dny, pravidelně a mírně. Náhlá vydatná zálivka po suchu způsobuje praskání kořenů.", en:"Water every 3 days, regularly and moderately. Sudden heavy watering after drought causes root cracking.", de:"Alle 3 Tage regelmäßig und mäßig gießen. Plötzliches starkes Gießen nach Trockenheit verursacht Wurzelrisse.", pl:"Podlewać co 3 dni, regularnie i umiarkowanie. Nagłe obfite podlewanie po suszy powoduje pękanie korzeni." },
      care:        { cs:"Prořeďte rostliny na 5 cm rozestup po vyklíčení. Plečkujte mezi řádky. Přihrnujte zeminu ke kořenům, aby nezelenaly.", en:"Thin plants to 5 cm spacing after germination. Hoe between rows. Hill soil around roots to prevent greening.", de:"Nach dem Keimen auf 5 cm Abstand ausdünnen. Zwischen den Reihen hacken. Erde an Wurzeln anhäufeln, damit sie nicht grün werden.", pl:"Po kiełkowaniu przetrzebić do rozstawy 5 cm. Plewić między rzędami. Obsypywać korzenie ziemią, aby nie zieleniały." },
      harvest:     { cs:"Sklízejte od srpna do října. Kořen by měl mít průměr 1–2 cm. Lze sklízet postupně dle potřeby.", en:"Harvest from August to October. Root should be 1–2 cm in diameter. Can harvest gradually as needed.", de:"Ernte von August bis Oktober. Wurzel sollte 1–2 cm Durchmesser haben. Kann schrittweise nach Bedarf geerntet werden.", pl:"Zbiory od sierpnia do października. Korzeń powinien mieć średnicę 1–2 cm. Można zbierać stopniowo według potrzeb." },
      afterHarvest:{ cs:"Zbytky rostlin zakompostujte. Záhon překopejte a přidejte kompost. Mrkev střídejte s cibulí nebo pórkem.", en:"Compost plant remains. Dig over bed and add compost. Rotate carrots with onions or leeks.", de:"Pflanzenreste kompostieren. Beet umgraben und Kompost zugeben. Möhren mit Zwiebeln oder Porree abwechseln.", pl:"Resztki roślin skompostować. Przekopać grządkę i dodać kompost. Naprzemiennie uprawiać marchew z cebulą lub porem." },
    },
  },
  {
    id: "lettuce", emoji: "🥬",
    names: { cs: "Hlávkový salát", en: "Lettuce", de: "Kopfsalat", pl: "Sałata" },
    sowMonths: [3,4,8], harvestMonths: [5,6,9,10], waterDays: 2, careLevel: "easy",
    details: {
      soilPrep:    { cs:"Lehká, vlhká půda s pH 6–7. Přidejte kompost. Salát nesnáší těžkou, jílovitou půdu.", en:"Light, moist soil with pH 6–7. Add compost. Lettuce doesn't tolerate heavy, clay soil.", de:"Leichter, feuchter Boden mit pH 6–7. Kompost zugeben. Salat verträgt keinen schweren, lehmigen Boden.", pl:"Lekka, wilgotna gleba o pH 6–7. Dodać kompost. Sałata nie toleruje ciężkiej, gliniastej gleby." },
      whenToPlant: { cs:"Jarní výsev od března (pod folií dříve), podzimní od srpna. Salát snese lehký mráz do -3 °C.", en:"Spring sowing from March (under cover earlier), autumn from August. Lettuce tolerates light frost to -3°C.", de:"Frühjahrsaussaat ab März (unter Folie früher), Herbst ab August. Salat verträgt leichten Frost bis -3°C.", pl:"Wiosenny wysiew od marca (pod folią wcześniej), jesienny od sierpnia. Sałata toleruje lekki mróz do -3°C." },
      spray:       { cs:"Hlavní škůdci jsou slimáci – použijte granule na slimáky nebo lapáky. Mšice ošetřete insekticidním mýdlem.", en:"Main pests are slugs – use slug pellets or traps. Treat aphids with insecticidal soap.", de:"Hauptschädlinge sind Schnecken – Schneckenkorn oder Fallen verwenden. Blattläuse mit Insektizidseife behandeln.", pl:"Główne szkodniki to ślimaki – użyć granulatu na ślimaki lub pułapek. Mszyce zwalczać mydłem insektobójczym." },
      fertilize:   { cs:"Před výsadbou přidejte pomalu uvolňující hnojivo. Salát roste rychle a nepotřebuje příliš živin.", en:"Add slow-release fertilizer before planting. Lettuce grows fast and doesn't need many nutrients.", de:"Vor der Pflanzung Langzeitdünger zugeben. Salat wächst schnell und benötigt nicht viele Nährstoffe.", pl:"Przed sadzeniem dodać nawóz wolno działający. Sałata rośnie szybko i nie potrzebuje wielu składników odżywczych." },
      watering:    { cs:"Zalévejte každé 2 dny ráno. Mokré listy v noci podporují hnilobu hlávky.", en:"Water every 2 days in the morning. Wet leaves at night promote head rot.", de:"Jeden 2. Tag morgens gießen. Nasse Blätter nachts fördern Kopffäule.", pl:"Podlewać co 2 dni rano. Mokre liście w nocy sprzyjają gniciu główki." },
      care:        { cs:"Prořeďte na 20–25 cm. Plečkujte opatrně – mělké kořeny. Při horku salát rychle vytahuje do stonku (kvete).", en:"Thin to 20–25 cm. Hoe carefully – shallow roots. In heat, lettuce quickly bolts (flowers).", de:"Auf 20–25 cm ausdünnen. Vorsichtig hacken – flache Wurzeln. Bei Hitze schießt Salat schnell (blüht).", pl:"Przetrzebić do 20–25 cm. Plewić ostrożnie – płytkie korzenie. W upale sałata szybko wybija w głąbik (kwitnie)." },
      harvest:     { cs:"Sklízejte dle potřeby – celé hlávky nebo jen vnější listy. Nejlepší ráno, kdy je hlávka turgidní.", en:"Harvest as needed – whole heads or just outer leaves. Best in the morning when head is turgid.", de:"Nach Bedarf ernten – ganze Köpfe oder nur äußere Blätter. Am besten morgens, wenn der Kopf turgeszent ist.", pl:"Zbierać wg potrzeb – całe główki lub tylko zewnętrzne liście. Najlepiej rano, gdy główka jest turgorowa." },
      afterHarvest:{ cs:"Zbytky zakompostujte. Záhon přihnojte a připravte na další výsev. Salát lze pěstovat 3× do roka.", en:"Compost remains. Fertilize bed and prepare for next sowing. Lettuce can be grown 3x per year.", de:"Reste kompostieren. Beet nachdüngen und für die nächste Aussaat vorbereiten. Salat kann 3× pro Jahr angebaut werden.", pl:"Resztki skompostować. Nawieźć grządkę i przygotować do kolejnego wysiewu. Sałatę można uprawiać 3× w roku." },
    },
  },
  {
    id: "pepper", emoji: "🫑",
    names: { cs: "Paprika", en: "Bell pepper", de: "Paprika", pl: "Papryka" },
    sowMonths: [2,3], harvestMonths: [8,9], waterDays: 2, careLevel: "medium",
    details: {
      soilPrep:    { cs:"Teplá, výživná půda s pH 6–6,5. Přidejte kompost a popel pro draslík. Záhon umístěte na nejteplejší místo.", en:"Warm, nutritious soil with pH 6–6.5. Add compost and ash for potassium. Place bed in warmest spot.", de:"Warmer, nährstoffreicher Boden mit pH 6–6,5. Kompost und Asche für Kalium zugeben. Beet an wärmsten Platz stellen.", pl:"Ciepła, żyzna gleba o pH 6–6,5. Dodać kompost i popiół dla potasu. Grządkę umieścić w najcieplejszym miejscu." },
      whenToPlant: { cs:"Předpěstujte od února–března. Ven sázejte až po 20. května. Paprika potřebuje min. 20 °C.", en:"Start indoors February–March. Plant outdoors after May 20. Peppers need min. 20°C.", de:"Ab Februar–März im Haus vorziehen. Nach dem 20. Mai ins Freie setzen. Paprika braucht min. 20°C.", pl:"Hodować w domu od lutego–marca. Na zewnątrz sadzić po 20 maja. Papryka potrzebuje min. 20°C." },
      spray:       { cs:"Ošetřujte proti mšicím a sviluškám (drobní červení roztoči). Použijte neemový olej nebo akaricidy.", en:"Treat against aphids and spider mites (tiny red mites). Use neem oil or acaricides.", de:"Gegen Blattläuse und Spinnmilben (kleine rote Milben) behandeln. Neemöl oder Akarizide verwenden.", pl:"Chronić przed mszycami i przędziorkami (drobne czerwone roztocza). Użyć oleju neem lub akarycydów." },
      fertilize:   { cs:"Každé 2 týdny draselno-fosforečné hnojivo. Dusík omezte – způsobuje bujný růst na úkor plodů.", en:"Every 2 weeks potassium-phosphorus fertilizer. Limit nitrogen – causes lush growth at expense of fruits.", de:"Alle 2 Wochen Kalium-Phosphor-Dünger. Stickstoff begrenzen – verursacht üppiges Wachstum auf Kosten der Früchte.", pl:"Co 2 tygodnie nawóz potasowo-fosforowy. Ograniczyć azot – powoduje bujny wzrost kosztem owoców." },
      watering:    { cs:"Zalévejte každé 2 dny pravidelně. Paprika nemá ráda ani sucho, ani přemokření. Teplá voda.", en:"Water every 2 days regularly. Peppers dislike both drought and waterlogging. Use warm water.", de:"Alle 2 Tage regelmäßig gießen. Paprika mag weder Trockenheit noch Staunässe. Warmes Wasser verwenden.", pl:"Podlewać regularnie co 2 dni. Papryka nie lubi ani suszy, ani zalania. Używać ciepłej wody." },
      care:        { cs:"Vyvazujte ke kůlu. Odstraňte první květy pro silnější rostlinu. Přišpuntujte výhony nad 3. rozvětvením.", en:"Tie to stake. Remove first flowers for stronger plant. Pinch shoots above 3rd branching.", de:"An Pfahl binden. Erste Blüten für stärkere Pflanze entfernen. Triebe über der 3. Verzweigung entspitzen.", pl:"Przywiązywać do palika. Usuwać pierwsze kwiaty dla silniejszej rośliny. Szczypać pędy nad 3. rozgałęzieniem." },
      harvest:     { cs:"Sklízejte srpen–září. Zelené papriky sklízejte dřív (sladší), červené nechte dozrát déle.", en:"Harvest August–September. Pick green peppers earlier (sweeter), let red ones ripen longer.", de:"Ernte August–September. Grüne Paprika früher ernten (süßer), rote länger reifen lassen.", pl:"Zbiory sierpień–wrzesień. Zielone papryki zbierać wcześniej (słodsze), czerwone zostawić do dłuższego dojrzewania." },
      afterHarvest:{ cs:"Rostliny vytrhněte i s kořeny. Záhon prohnojte. Paprika patří do rotace s rajčaty a lilkem.", en:"Pull out plants with roots. Fertilize bed. Peppers belong in rotation with tomatoes and eggplant.", de:"Pflanzen mit Wurzeln herausziehen. Beet nachdüngen. Paprika gehört in die Fruchtfolge mit Tomaten und Auberginen.", pl:"Wyrwać rośliny z korzeniami. Nawieźć grządkę. Papryka należy do zmianowania z pomidorami i bakłażanem." },
    },
  },
  {
    id: "zucchini", emoji: "🥦",
    names: { cs: "Cuketa", en: "Zucchini", de: "Zucchini", pl: "Cukinia" },
    sowMonths: [4,5], harvestMonths: [7,8,9], waterDays: 3, careLevel: "easy",
    details: {
      soilPrep:    { cs:"Bohatá, vlhká půda s kompostem. Cukety jsou nenasytné – přidejte hodně zralého hnoje.", en:"Rich, moist soil with compost. Zucchini are heavy feeders – add plenty of mature manure.", de:"Reicher, feuchter Boden mit Kompost. Zucchini sind Starkzehrer – viel reifen Mist zugeben.", pl:"Żyzna, wilgotna gleba z kompostem. Cukinie są intensywnym poborcami składników – dodać dużo dojrzałego obornika." },
      whenToPlant: { cs:"Sázejte po 15. května. Jedna rostlina zabere 1 m². Sázejte na kopce pro lepší odtok.", en:"Plant after May 15. One plant takes 1 m². Plant on mounds for better drainage.", de:"Nach dem 15. Mai pflanzen. Eine Pflanze braucht 1 m². Auf Hügel pflanzen für bessere Drainage.", pl:"Sadzić po 15 maja. Jedna roślina zajmuje 1 m². Sadzić na kopczykach dla lepszego odpływu wody." },
      spray:       { cs:"Moučnatá rosa je hlavní problém. Postříkejte sodou bicarbonátovou (1 lžíce na litr vody) nebo fungicidem.", en:"Powdery mildew is the main problem. Spray with baking soda (1 tbsp per liter) or fungicide.", de:"Echter Mehltau ist das Hauptproblem. Mit Natron (1 EL pro Liter Wasser) oder Fungizid spritzen.", pl:"Mączniak prawdziwy to główny problem. Opryskiwać sodą oczyszczoną (1 łyżka na litr wody) lub fungicydem." },
      fertilize:   { cs:"Přihnojujte každé 3 týdny dusíkatým hnojivem na začátku, pak přejděte na draselné pro plody.", en:"Fertilize every 3 weeks with nitrogen fertilizer at start, then switch to potassium for fruits.", de:"Zu Beginn alle 3 Wochen mit Stickstoffdünger, dann für Früchte auf Kaliumdünger umstellen.", pl:"Na początku nawozić co 3 tygodnie nawozem azotowym, potem przejść na potasowy dla owoców." },
      watering:    { cs:"Zalévejte vydatně každé 3 dny přímo k patě rostliny. Mokré listy vedou k plísni.", en:"Water generously every 3 days directly at the base. Wet leaves lead to mildew.", de:"Alle 3 Tage reichlich direkt an der Pflanzenbasis gießen. Nasse Blätter führen zu Mehltau.", pl:"Podlewać obficie co 3 dni bezpośrednio przy podstawie rośliny. Mokre liście prowadzą do mączniaka." },
      care:        { cs:"Odstraňujte staré listy pro lepší ventilaci. Opylování podpořte ručním přenesením pylu.", en:"Remove old leaves for better ventilation. Support pollination by hand-transferring pollen.", de:"Alte Blätter für bessere Belüftung entfernen. Bestäubung durch manuellen Pollentransfer unterstützen.", pl:"Usuwać stare liście dla lepszej wentylacji. Wspomagać zapylanie ręcznym przenoszeniem pyłku." },
      harvest:     { cs:"Sklízejte při délce 15–20 cm. Přezrálé cukety jsou dřevnaté. Sklízejte každé 2–3 dny!", en:"Harvest at 15–20 cm length. Overripe zucchini become woody. Harvest every 2–3 days!", de:"Bei 15–20 cm Länge ernten. Überreife Zucchini werden holzig. Alle 2–3 Tage ernten!", pl:"Zbierać przy długości 15–20 cm. Przejrzałe cukinie drewnieją. Zbierać co 2–3 dni!" },
      afterHarvest:{ cs:"Celé rostliny odstraňte do kompostu. Záhon nechte odpočinout nebo osejte zeleným hnojením.", en:"Remove entire plants to compost. Let bed rest or sow green manure.", de:"Gesamte Pflanzen zum Kompost entfernen. Beet ruhen lassen oder Gründüngung aussäen.", pl:"Całe rośliny usunąć do kompostu. Dać grządce odpocząć lub posiać zielony nawóz." },
    },
  },
  {
    id: "strawberry", emoji: "🍓",
    names: { cs: "Jahoda", en: "Strawberry", de: "Erdbeere", pl: "Truskawka" },
    sowMonths: [3,4], harvestMonths: [6,7], waterDays: 2, careLevel: "easy",
    details: {
      soilPrep:    { cs:"Kyselá až mírně kyselá půda (pH 5,5–6,5), bohatá na humus. Přidejte rašelinu pro okyselení.", en:"Acidic to slightly acidic soil (pH 5.5–6.5), rich in humus. Add peat moss to acidify.", de:"Saurer bis leicht saurer Boden (pH 5,5–6,5), humusreich. Torf zugeben zum Ansäuern.", pl:"Gleba kwaśna do lekko kwaśnej (pH 5,5–6,5), bogata w próchnicę. Dodać torf dla zakwaszenia." },
      whenToPlant: { cs:"Sázejte v srpnu–září pro sklizeň příští rok, nebo v březnu–dubnu. Korunka musí být nad zemí.", en:"Plant August–September for harvest next year, or March–April. Crown must be above ground.", de:"August–September für Ernte nächstes Jahr pflanzen, oder März–April. Krone muss über der Erde sein.", pl:"Sadzić sierpień–wrzesień na zbiory w przyszłym roku, lub marzec–kwiecień. Korona musi być nad ziemią." },
      spray:       { cs:"Preventivně před kvetením postříkejte fungicidem proti šedé plísni (Botrytis). Slimáky lapte pomocí piva.", en:"Spray preventively with fungicide against grey mould (Botrytis) before flowering. Trap slugs with beer.", de:"Vor der Blüte vorbeugend mit Fungizid gegen Grauschimmel (Botrytis) spritzen. Schnecken mit Bier fangen.", pl:"Profilaktycznie przed kwitnieniem opryskiwać fungicydem przeciw szarej pleśni (Botrytis). Łapać ślimaki piwem." },
      fertilize:   { cs:"Na jaře přihnojte dusíkatým hnojivem. Po sklizni fosforem a draslíkem pro přípravu na příští rok.", en:"Fertilize with nitrogen in spring. After harvest with phosphorus and potassium to prepare for next year.", de:"Im Frühjahr mit Stickstoffdünger nachdüngen. Nach der Ernte mit Phosphor und Kalium für nächstes Jahr.", pl:"Wiosną nawieźć nawozem azotowym. Po zbiorach fosforem i potasem dla przygotowania na następny rok." },
      watering:    { cs:"Zalévejte každé 2 dny při suchém počasí, zejména při dozrávání plodů. Vodu cílejte ke kořenům, ne na plody.", en:"Water every 2 days in dry weather, especially during fruit ripening. Target water to roots, not fruits.", de:"Bei trockenem Wetter alle 2 Tage gießen, besonders beim Fruchtansatz. Wasser zu den Wurzeln, nicht auf Früchte.", pl:"Podlewać co 2 dni przy suchej pogodzie, szczególnie podczas dojrzewania owoców. Kierować wodę do korzeni, nie na owoce." },
      care:        { cs:"Pod plody rozložte slámu nebo speciální rohože. Po sklizni seřízněte listy (ne korunky!), odstraňte výhonky (šlahouny).", en:"Spread straw or special mats under fruits. After harvest cut leaves (not crowns!), remove runners.", de:"Stroh oder Spezialmatten unter Früchte legen. Nach Ernte Blätter schneiden (nicht Krone!), Ausläufer entfernen.", pl:"Pod owoce rozłożyć słomę lub specjalne maty. Po zbiorach przyciąć liście (nie korony!), usunąć rozłogi." },
      harvest:     { cs:"Sklízejte v červnu–červenci. Trhejte celé plody i s kalichy. Plody jsou zralé, když jsou sytě červené.", en:"Harvest June–July. Pick whole fruits with sepals. Fruits are ripe when deep red.", de:"Ernte Juni–Juli. Ganze Früchte mit Kelchblättern pflücken. Früchte sind reif, wenn sie tief rot sind.", pl:"Zbiory czerwiec–lipiec. Zbierać całe owoce z kielichami. Owoce dojrzałe gdy są ciemnoczerwone." },
      afterHarvest:{ cs:"Seřízněte staré listy do 10 cm. Záhon prohnojte. Jahodníky obnovujte každé 3–4 roky novými sazenicemi.", en:"Cut old leaves to 10 cm. Fertilize bed. Renew strawberry beds every 3–4 years with new plants.", de:"Alte Blätter auf 10 cm schneiden. Beet nachdüngen. Erdbeerbeete alle 3–4 Jahre mit neuen Pflanzen erneuern.", pl:"Przyciąć stare liście do 10 cm. Nawieźć grządkę. Odnawiać plantację truskawek co 3–4 lata nowymi sadzonkami." },
    },
  },
  {
    id: "apple", emoji: "🍎",
    names: { cs: "Jabloň", en: "Apple tree", de: "Apfelbaum", pl: "Jabłoń" },
    sowMonths: [3,10], harvestMonths: [8,9,10], waterDays: 7, careLevel: "medium",
    details: {
      soilPrep:    { cs:"Hluboká, výživná půda s pH 6–7. Vykopejte jámu 60×60 cm, promíchejte s kompostem a kostní moučkou.", en:"Deep, nutritious soil with pH 6–7. Dig pit 60×60 cm, mix with compost and bone meal.", de:"Tiefer, nährstoffreicher Boden mit pH 6–7. Grube 60×60 cm ausheben, mit Kompost und Knochenmehl mischen.", pl:"Głęboka, żyzna gleba o pH 6–7. Wykopać dołek 60×60 cm, wymieszać z kompostem i mączką kostną." },
      whenToPlant: { cs:"Sázejte na podzim (říjen) nebo brzy na jaře (březen) před rašením. Jabloně přesazujte jen v klidu.", en:"Plant in autumn (October) or early spring (March) before budding. Transplant only during dormancy.", de:"Im Herbst (Oktober) oder früh im Frühjahr (März) vor dem Austreiben pflanzen. Nur in der Ruhezeit umpflanzen.", pl:"Sadzić jesienią (październik) lub wczesną wiosną (marzec) przed pączkowaniem. Przesadzać tylko w spoczynku." },
      spray:       { cs:"Stříkejte na jaře před kvetením a po odkvětu fungicidy a insekticidy. Hlavní škůdci: obaleč jablečný, strupovitost, padlí.", en:"Spray in spring before and after flowering with fungicides and insecticides. Main pests: codling moth, scab, mildew.", de:"Im Frühjahr vor und nach der Blüte mit Fungiziden und Insektiziden spritzen. Hauptschädlinge: Apfelwickler, Schorf, Mehltau.", pl:"Opryskiwać wiosną przed i po kwitnieniu fungicydami i insektycydami. Główne szkodniki: owocówka jabłkóweczka, parch, mączniak." },
      fertilize:   { cs:"Na jaře dusíkaté hnojivo. V červnu síran draselný. Starší stromy hnojte každé 2 roky.", en:"Nitrogen fertilizer in spring. Potassium sulfate in June. Fertilize older trees every 2 years.", de:"Im Frühjahr Stickstoffdünger. Im Juni Kaliumsulfat. Ältere Bäume alle 2 Jahre düngen.", pl:"Wiosną nawóz azotowy. W czerwcu siarczan potasu. Starsze drzewa nawozić co 2 lata." },
      watering:    { cs:"Zalévejte 1× týdně vydatně (20 l), zejména v suchu a při nasazování plodů. Mulčujte kolem kmene.", en:"Water once a week generously (20 L), especially in drought and when fruits set. Mulch around trunk.", de:"Einmal pro Woche reichlich gießen (20 L), besonders bei Trockenheit und Fruchtansatz. Rund um den Stamm mulchen.", pl:"Podlewać raz w tygodniu obficie (20 l), szczególnie podczas suszy i przy zawiązywaniu owoców. Mulczować wokół pnia." },
      care:        { cs:"Zimní řez v únoru–březnu pro tvar a prosvětlení koruny. Letní řez v červenci pro regulaci růstu.", en:"Winter pruning February–March for shape and crown thinning. Summer pruning in July for growth regulation.", de:"Winterschnitt Februar–März für Form und Kronendurchlichtung. Sommerschnitt im Juli zur Wachstumsregulierung.", pl:"Zimowe cięcie luty–marzec dla kształtu i prześwietlenia korony. Letnie cięcie w lipcu dla regulacji wzrostu." },
      harvest:     { cs:"Sklízejte srpen–říjen dle odrůdy. Plod je zralý, když se lehce otočí a oddělí od větvičky.", en:"Harvest August–October depending on variety. Fruit is ripe when it gently twists and separates from the branch.", de:"Ernte August–Oktober je nach Sorte. Frucht ist reif, wenn sie sich leicht dreht und vom Zweig löst.", pl:"Zbiory sierpień–październik zależnie od odmiany. Owoc dojrzały gdy łatwo się obraca i oddziela od gałązki." },
      afterHarvest:{ cs:"Posbírejte a zlikvidujte padané plody (šíří choroby). Proveďte podzimní řez. Ošetřete kmen vápnem.", en:"Collect and dispose of fallen fruits (spread diseases). Do autumn pruning. Treat trunk with lime.", de:"Fallfrüchte sammeln und entsorgen (verbreiten Krankheiten). Herbstschnitt durchführen. Stamm mit Kalk behandeln.", pl:"Zebrać i zutylizować opadłe owoce (szerzą choroby). Wykonać jesienne cięcie. Zabezpieczyć pień wapnem." },
    },
  },
  {
    id: "garlic", emoji: "🧄",
    names: { cs: "Česnek", en: "Garlic", de: "Knoblauch", pl: "Czosnek" },
    sowMonths: [9,10], harvestMonths: [6,7], waterDays: 7, careLevel: "easy",
    details: {
      soilPrep:    { cs:"Lehká, propustná půda s pH 6–7. Záhon dobře odvodněte, česnek nesnáší stojící vodu.", en:"Light, well-drained soil with pH 6–7. Drain bed well, garlic doesn't tolerate standing water.", de:"Leichter, durchlässiger Boden mit pH 6–7. Beet gut drainieren, Knoblauch verträgt keine Staunässe.", pl:"Lekka, przepuszczalna gleba o pH 6–7. Dobrze odwodnić grządkę, czosnek nie toleruje stojącej wody." },
      whenToPlant: { cs:"Sázejte na podzim (říjen) pro jarní klíčení a letní sklizeň. Hloubka 5 cm, špička nahoru.", en:"Plant in autumn (October) for spring sprouting and summer harvest. Depth 5 cm, tip pointing up.", de:"Im Herbst (Oktober) für Frühjahrskeimung und Sommerernte pflanzen. Tiefe 5 cm, Spitze nach oben.", pl:"Sadzić jesienią (październik) na wiosenne kiełkowanie i letnie zbiory. Głębokość 5 cm, wierzchołkiem do góry." },
      spray:       { cs:"Česnek je přirozeně odolný. Při výskytu rzivosti postříkejte fungicidem. Hmyzí škůdci jsou vzácní.", en:"Garlic is naturally resistant. Spray with fungicide if rust appears. Insect pests are rare.", de:"Knoblauch ist natürlich widerstandsfähig. Bei Rost mit Fungizid spritzen. Insektenschädlinge sind selten.", pl:"Czosnek jest naturalnie odporny. Przy wystąpieniu rdzy opryskiwać fungicydem. Szkodniki owadzkie są rzadkie." },
      fertilize:   { cs:"Při výsadbě přidejte draselno-fosforečné hnojivo. Na jaře lehce přihnojte dusíkem.", en:"Add potassium-phosphorus fertilizer at planting. Lightly fertilize with nitrogen in spring.", de:"Bei der Pflanzung Kalium-Phosphor-Dünger zugeben. Im Frühjahr leicht mit Stickstoff nachdüngen.", pl:"Przy sadzeniu dodać nawóz potasowo-fosforowy. Wiosną lekko nawieźć azotem." },
      watering:    { cs:"Zalévejte jen za sucha (každých 7–10 dní). Přemokření způsobuje hnilobu. Na podzim a jaře přirozené srážky stačí.", en:"Water only in dry spells (every 7–10 days). Waterlogging causes rot. Autumn and spring natural rainfall sufficient.", de:"Nur bei Trockenheit gießen (alle 7–10 Tage). Staunässe verursacht Fäule. Herbst- und Frühjahrsregen reichen aus.", pl:"Podlewać tylko podczas suszy (co 7–10 dni). Zalanie powoduje gnicie. Jesienne i wiosenne deszcze wystarczają." },
      care:        { cs:"Plečkujte pravidelně. V červnu odstraňte květní stvoly (šlukoviny) pro větší hlízy.", en:"Hoe regularly. In June remove flower stalks (scapes) for larger bulbs.", de:"Regelmäßig hacken. Im Juni Blütenschaft (Scape) entfernen für größere Knollen.", pl:"Regularnie plewić. W czerwcu usunąć łodygi kwiatowe (sztuczki) dla większych cebulek." },
      harvest:     { cs:"Sklízejte v červnu–červenci, když zežloutne 2/3 listů. Vyndejte celou hlízu vidlemi.", en:"Harvest June–July when 2/3 of leaves turn yellow. Lift entire bulb with a fork.", de:"Ernte Juni–Juli, wenn 2/3 der Blätter gelb werden. Ganze Knolle mit Gabel herausheben.", pl:"Zbiory czerwiec–lipiec, gdy 2/3 liści żółknie. Wyjąć całą cebulkę widłami." },
      afterHarvest:{ cs:"Česnek 2 týdny sušte na vzduchu. Uchovávejte v síťce v suchu. Záhon přihnojte a nechte odpočinout.", en:"Dry garlic for 2 weeks in air. Store in net bag in dry place. Fertilize bed and let rest.", de:"Knoblauch 2 Wochen an der Luft trocknen. In Netzbeutel an trockenem Ort lagern. Beet nachdüngen und ruhen lassen.", pl:"Suszyć czosnek 2 tygodnie na powietrzu. Przechowywać w siatce w suchym miejscu. Nawieźć grządkę i dać odpocząć." },
    },
  },
  {
    id: "onion", emoji: "🧅",
    names: { cs: "Cibule", en: "Onion", de: "Zwiebel", pl: "Cebula" },
    sowMonths: [3,4], harvestMonths: [7,8], waterDays: 5, careLevel: "easy",
    details: {
      soilPrep:    { cs:"Propustná půda s pH 6–7, zbavená plevelů. Přidejte kompost, ale ne čerstvý hnůj.", en:"Well-drained soil with pH 6–7, weed-free. Add compost but not fresh manure.", de:"Durchlässiger Boden mit pH 6–7, unkrautfrei. Kompost zugeben, aber keinen frischen Mist.", pl:"Przepuszczalna gleba o pH 6–7, wolna od chwastów. Dodać kompost, ale nie świeży obornik." },
      whenToPlant: { cs:"Sázejte sazečky v březnu–dubnu. Hloubka 2–3 cm. Přímý výsev semeny od února pod folií.", en:"Plant sets March–April. Depth 2–3 cm. Direct seed sowing from February under cover.", de:"Steckzwiebeln März–April pflanzen. Tiefe 2–3 cm. Direktsaat ab Februar unter Folie.", pl:"Sadzić cebulki siewne marzec–kwiecień. Głębokość 2–3 cm. Wysiew nasion bezpośrednio od lutego pod folią." },
      spray:       { cs:"Peronospora cibulová je hlavní choroba – postříkejte fungicidem při prvních příznacích. Cibulová muška – insekticid.", en:"Onion downy mildew is main disease – spray fungicide at first symptoms. Onion fly – insecticide.", de:"Falscher Mehltau der Zwiebel ist Hauptkrankheit – bei ersten Symptomen Fungizid spritzen. Zwiebelfliege – Insektizid.", pl:"Mączniak rzekomy cebuli to główna choroba – opryskiwać fungicydem przy pierwszych objawach. Śmietka cebulanka – insektycyd." },
      fertilize:   { cs:"Při výsadbě dusíkaté hnojivo. V červnu přidejte draslík pro tvorbu hlíz. Přehnojení dusíkem škodí.", en:"Nitrogen fertilizer at planting. Add potassium in June for bulb formation. Over-fertilizing with nitrogen is harmful.", de:"Stickstoffdünger bei der Pflanzung. Im Juni Kalium für Knollenbildung zugeben. Überdüngung mit Stickstoff schadet.", pl:"Nawóz azotowy przy sadzeniu. W czerwcu dodać potas dla tworzenia cebulek. Przenawożenie azotem szkodzi." },
      watering:    { cs:"Zalévejte každých 5–7 dní. V červnu zálivku omezte – cibule se pak lépe uchovává.", en:"Water every 5–7 days. Reduce watering in June – onions then store better.", de:"Alle 5–7 Tage gießen. Im Juni weniger gießen – Zwiebeln lagern dann besser.", pl:"Podlewać co 5–7 dni. W czerwcu ograniczyć podlewanie – cebula wtedy lepiej się przechowuje." },
      care:        { cs:"Pravidelně plečkujte – cibule nemá ráda konkurenci plevelů. Hlízy nesmí být zakryté zeminou.", en:"Hoe regularly – onions don't tolerate weed competition. Bulbs must not be covered with soil.", de:"Regelmäßig hacken – Zwiebeln vertragen keine Unkrautkonkurrenz. Knollen dürfen nicht mit Erde bedeckt sein.", pl:"Regularnie plewić – cebula nie toleruje konkurencji chwastów. Cebulki nie mogą być przykryte ziemią." },
      harvest:     { cs:"Sklízejte v červenci–srpnu, když poléhají nati. Vyndejte vidlemi a 2 týdny sušte na slunci.", en:"Harvest July–August when tops fall over. Lift with fork and dry 2 weeks in sun.", de:"Ernte Juli–August wenn die Blätter umfallen. Mit Gabel herausnehmen und 2 Wochen an der Sonne trocknen.", pl:"Zbiory lipiec–sierpień, gdy nać przewróci się. Wyjąć widłami i suszyć 2 tygodnie na słońcu." },
      afterHarvest:{ cs:"Uchovávejte v suchu a chladu. Záhon prohnojte kompostem. Cibuli střídejte s mrkví nebo salátem.", en:"Store in dry, cool place. Fertilize bed with compost. Rotate onions with carrots or lettuce.", de:"Trocken und kühl lagern. Beet mit Kompost nachdüngen. Zwiebeln mit Möhren oder Salat abwechseln.", pl:"Przechowywać w suchym i chłodnym miejscu. Nawieźć grządkę kompostem. Naprzemiennie uprawiać cebulę z marchewką lub sałatą." },
    },
  },
  {
    id: "sunflower", emoji: "🌻",
    names: { cs: "Slunečnice", en: "Sunflower", de: "Sonnenblume", pl: "Słonecznik" },
    sowMonths: [4,5], harvestMonths: [8,9], waterDays: 3, careLevel: "easy",
    details: {
      soilPrep:    { cs:"Propustná půda, slunné stanoviště. Slunečnice jsou nenáročné, zvládnou i chudší půdu.", en:"Well-drained soil, sunny location. Sunflowers are undemanding, can manage even poorer soil.", de:"Durchlässiger Boden, sonniger Standort. Sonnenblumen sind anspruchslos, kommen auch mit ärmeren Böden zurecht.", pl:"Przepuszczalna gleba, słoneczne stanowisko. Słoneczniki są mało wymagające, radzą sobie nawet na uboższej glebie." },
      whenToPlant: { cs:"Sějte od dubna přímo na místo nebo předpěstujte od března. Vzdálenost 40–50 cm.", en:"Sow from April directly in place or start indoors from March. Spacing 40–50 cm.", de:"Ab April direkt an Ort und Stelle säen oder ab März vorziehen. Abstand 40–50 cm.", pl:"Siać od kwietnia bezpośrednio na miejsce lub hodować od marca. Rozstawa 40–50 cm." },
      spray:       { cs:"Hmyzí škůdci jsou vzácní. Při plísni (zejména v mokru) ošetřete fungicidem. Ptáci mohou zobat semena.", en:"Insect pests are rare. Treat with fungicide if mildew appears (especially in wet weather). Birds may eat seeds.", de:"Insektenschädlinge sind selten. Bei Mehltau (besonders bei Nässe) Fungizid anwenden. Vögel können Samen fressen.", pl:"Szkodniki owadzkie rzadkie. Przy mączniaku (szczególnie w mokrą pogodę) użyć fungicydu. Ptaki mogą zjadać nasiona." },
      fertilize:   { cs:"Přihnojte jednou na začátku růstu. Přehnojení způsobuje bujný růst listů na úkor květu.", en:"Fertilize once at the start of growth. Over-fertilizing causes lush leaf growth at expense of flower.", de:"Einmal zu Beginn des Wachstums düngen. Überdüngung verursacht üppiges Blattwachstum auf Kosten der Blüte.", pl:"Nawieźć raz na początku wzrostu. Przenawożenie powoduje bujny wzrost liści kosztem kwiatu." },
      watering:    { cs:"Zalévejte každé 3 dny při suchu. Slunečnice jsou relativně sucho-odolné po zakořenění.", en:"Water every 3 days in dry weather. Sunflowers are relatively drought-tolerant after rooting.", de:"Bei Trockenheit alle 3 Tage gießen. Sonnenblumen sind nach dem Anwurzeln relativ trockenheitsresistent.", pl:"Podlewać co 3 dni przy suszy. Słoneczniki są stosunkowo odporne na suszę po ukorzenieniu." },
      care:        { cs:"Vysoké odrůdy vyvazujte ke kůlu. Slunečnice se otáčejí za sluncem (heliotropismus).", en:"Tie tall varieties to a stake. Sunflowers turn towards the sun (heliotropism).", de:"Hohe Sorten an Pfahl binden. Sonnenblumen drehen sich der Sonne zu (Heliotropismus).", pl:"Wysokie odmiany przywiązywać do palika. Słoneczniki zwracają się ku słońcu (heliotropizm)." },
      harvest:     { cs:"Sklízejte v srpnu–září, když záhlavá list zežloutne a semena jsou pevná. Uřízněte s 30 cm stonku.", en:"Harvest August–September when back leaf turns yellow and seeds are firm. Cut with 30 cm of stem.", de:"Ernte August–September wenn das Hüllblatt gelb wird und die Samen fest sind. Mit 30 cm Stiel schneiden.", pl:"Zbiory sierpień–wrzesień, gdy liść okrywający żółknie a nasiona są twarde. Ciąć z 30 cm łodygi." },
      afterHarvest:{ cs:"Stonky jsou tvrdé – nasekejte je a zakompostujte nebo použijte jako mulč. Semena sušte pro ptáky nebo příští výsev.", en:"Stems are tough – chop and compost or use as mulch. Dry seeds for birds or next sowing.", de:"Stängel sind hart – hacken und kompostieren oder als Mulch verwenden. Samen für Vögel oder nächste Aussaat trocknen.", pl:"Łodygi są twarde – posiekać i skompostować lub użyć jako mulcz. Nasiona suszyć dla ptaków lub na następny wysiew." },
    },
  },
  {
    id: "pumpkin", emoji: "🎃",
    names: { cs: "Dýně", en: "Pumpkin", de: "Kürbis", pl: "Dynia" },
    sowMonths: [4,5], harvestMonths: [9,10], waterDays: 3, careLevel: "easy",
    details: {
      soilPrep:    { cs:"Výživná, vlhká půda s hodně kompostem. Dýně lze sázet přímo na kompostový hromadu!", en:"Nutritious, moist soil with lots of compost. Pumpkins can be planted directly on a compost heap!", de:"Nährstoffreicher, feuchter Boden mit viel Kompost. Kürbisse können direkt auf den Komposthaufen gepflanzt werden!", pl:"Żyzna, wilgotna gleba z dużą ilością kompostu. Dynie można sadzić bezpośrednio na pryzmę kompostową!" },
      whenToPlant: { cs:"Sázejte po 15. května. Jedna rostlina potřebuje 2–4 m². Dýně rychle roste a pokryje vše.", en:"Plant after May 15. One plant needs 2–4 m². Pumpkin grows fast and covers everything.", de:"Nach dem 15. Mai pflanzen. Eine Pflanze braucht 2–4 m². Kürbis wächst schnell und bedeckt alles.", pl:"Sadzić po 15 maja. Jedna roślina potrzebuje 2–4 m². Dynia rośnie szybko i pokrywa wszystko." },
      spray:       { cs:"Moučnatá rosa na konci léta – postříkejte fungicidem. Slimáci útočí na mladé rostliny.", en:"Powdery mildew at end of summer – spray fungicide. Slugs attack young plants.", de:"Echter Mehltau am Ende des Sommers – Fungizid spritzen. Schnecken greifen junge Pflanzen an.", pl:"Mączniak prawdziwy pod koniec lata – opryskiwać fungicydem. Ślimaki atakują młode rośliny." },
      fertilize:   { cs:"Přihnojujte každý měsíc bohatým dusíkatým hnojivem. Dýně je nenasytná – čím více živin, tím větší plod.", en:"Fertilize monthly with rich nitrogen fertilizer. Pumpkin is a heavy feeder – more nutrients mean bigger fruit.", de:"Monatlich mit reichhaltigem Stickstoffdünger nachdüngen. Kürbis ist ein Starkzehrer – mehr Nährstoffe bedeuten größere Früchte.", pl:"Nawozić co miesiąc bogatym nawozem azotowym. Dynia jest intensywnym poborcą – więcej składników oznacza większy owoc." },
      watering:    { cs:"Zalévejte vydatně každé 3 dny. Na každou rostlinu spotřebujte 10–15 litrů. Mulčujte pro udržení vlhkosti.", en:"Water generously every 3 days. Use 10–15 liters per plant. Mulch to retain moisture.", de:"Alle 3 Tage reichlich gießen. 10–15 Liter pro Pflanze. Mulchen zur Feuchtigkeitsspeicherung.", pl:"Podlewać obficie co 3 dni. Zużywać 10–15 litrów na roślinę. Mulczować dla utrzymania wilgoci." },
      care:        { cs:"Přišpuntujte boční výhony po 2–3 plodech. Pod plody vložte prkénko pro ochranu před hnilobou.", en:"Pinch side shoots after 2–3 fruits. Place a board under fruits to protect against rot.", de:"Seitentriebe nach 2–3 Früchten entspitzen. Unter die Früchte ein Brett legen zum Schutz vor Fäule.", pl:"Szczypać pędy boczne po 2–3 owocach. Pod owoce włożyć deskę dla ochrony przed gniciem." },
      harvest:     { cs:"Sklízejte v září–říjnu, když stonek začíná korkovět. Klepněte – zralý plod zní dutě.", en:"Harvest September–October when stem begins to cork. Knock – ripe fruit sounds hollow.", de:"Ernte September–Oktober wenn der Stiel zu verkorken beginnt. Klopfen – reife Frucht klingt hohl.", pl:"Zbiory wrzesień–październik, gdy łodyga zaczyna korkowacieć. Puknąć – dojrzały owoc brzmi pusto." },
      afterHarvest:{ cs:"Dýně vydrží uskladněná měsíce v chladu a suchu. Rostliny zakompostujte. Záhon prohnojte.", en:"Pumpkins keep for months in cool, dry storage. Compost plants. Fertilize bed.", de:"Kürbisse halten sich monatelang in kühler, trockener Lagerung. Pflanzen kompostieren. Beet nachdüngen.", pl:"Dynie przechowują się miesiącami w chłodnym, suchym miejscu. Skompostować rośliny. Nawieźć grządkę." },
    },
  },
  {
    id: "raspberry", emoji: "🫐",
    names: { cs: "Malina", en: "Raspberry", de: "Himbeere", pl: "Malina" },
    sowMonths: [3,10], harvestMonths: [7,8], waterDays: 4, careLevel: "medium",
    details: {
      soilPrep:    { cs:"Kyselá půda (pH 5,5–6,5), bohatá na humus. Přidejte rašelinu. Záhon oddrénujte – maliny nesnáší mokro.", en:"Acidic soil (pH 5.5–6.5), rich in humus. Add peat. Drain bed well – raspberries don't tolerate wet conditions.", de:"Saurer Boden (pH 5,5–6,5), humusreich. Torf zugeben. Beet gut drainieren – Himbeeren mögen keine Nässe.", pl:"Kwaśna gleba (pH 5,5–6,5), bogata w próchnicę. Dodać torf. Dobrze odwodnić grządkę – maliny nie tolerują mokra." },
      whenToPlant: { cs:"Sázejte na podzim (říjen) nebo brzy na jaře (březen). Připravte drátěnou oporu.", en:"Plant in autumn (October) or early spring (March). Prepare wire support.", de:"Im Herbst (Oktober) oder früh im Frühjahr (März) pflanzen. Drahtunterstützung vorbereiten.", pl:"Sadzić jesienią (październik) lub wczesną wiosną (marzec). Przygotować drucianą podporę." },
      spray:       { cs:"Maliny napadá rzivost a virové choroby. Postříkejte fungicidem na jaře. Maliník maliníkový – insekticid.", en:"Raspberries susceptible to rust and viral diseases. Spray fungicide in spring. Raspberry beetle – insecticide.", de:"Himbeeren anfällig für Rost und Viruskrankheiten. Im Frühjahr Fungizid spritzen. Himbeerkäfer – Insektizid.", pl:"Maliny podatne na rdzę i choroby wirusowe. Opryskiwać fungicydem wiosną. Maliniarz – insektycyd." },
      fertilize:   { cs:"Na jaře dusíkaté hnojivo pro bujný růst. Po sklizni draselné pro přípravu na zimu.", en:"Nitrogen fertilizer in spring for lush growth. Potassium after harvest for winter preparation.", de:"Im Frühjahr Stickstoffdünger für üppiges Wachstum. Nach der Ernte Kalium für die Wintervorbereitung.", pl:"Wiosną nawóz azotowy dla bujnego wzrostu. Po zbiorach potas dla przygotowania na zimę." },
      watering:    { cs:"Zalévejte každé 4 dny, zvláště v suchu. Kapková závlaha je ideální. Mulčujte kůrou.", en:"Water every 4 days, especially in dry weather. Drip irrigation is ideal. Mulch with bark.", de:"Alle 4 Tage gießen, besonders bei Trockenheit. Tropfbewässerung ist ideal. Mit Rinde mulchen.", pl:"Podlewać co 4 dni, szczególnie podczas suszy. Idealne jest nawadnianie kroplowe. Mulczować korą." },
      care:        { cs:"Po sklizni seřízněte výhony, které plodily, na zem. Nové výhony přivažte k opoře.", en:"After harvest cut down shoots that fruited to the ground. Tie new shoots to support.", de:"Nach der Ernte geerntete Triebe bis zum Boden abschneiden. Neue Triebe an Stütze binden.", pl:"Po zbiorach przyciąć do ziemi pędy, które owocowały. Nowe pędy przywiązać do podpory." },
      harvest:     { cs:"Sklízejte denně v červenci–srpnu. Zralé plody jsou sytě červené a lehce se oddělují.", en:"Harvest daily July–August. Ripe fruits are deep red and separate easily.", de:"Juli–August täglich ernten. Reife Früchte sind tief rot und lösen sich leicht.", pl:"Zbierać codziennie lipiec–sierpień. Dojrzałe owoce są ciemnoczerwone i łatwo się odrywają." },
      afterHarvest:{ cs:"Zalijte a přihnojte. Odstraňte plodivé výhony. Maliny na stejném místě vydrží 10–15 let.", en:"Water and fertilize. Remove fruited shoots. Raspberries in the same spot last 10–15 years.", de:"Gießen und nachdüngen. Fruchtende Triebe entfernen. Himbeeren am gleichen Platz halten 10–15 Jahre.", pl:"Podlać i nawieźć. Usunąć pędy, które owocowały. Maliny na tym samym miejscu rosną 10–15 lat." },
    },
  },
  {
    id: "basil", emoji: "🌿",
    names: { cs: "Bazalka", en: "Basil", de: "Basilikum", pl: "Bazylia" },
    sowMonths: [4,5,6], harvestMonths: [6,7,8,9], waterDays: 2, careLevel: "easy",
    details: {
      soilPrep:    { cs:"Teplá, lehká půda na slunném místě. Bazalka nesnáší průvan a chlad. Výborná v nádobách.", en:"Warm, light soil in sunny spot. Basil dislikes draughts and cold. Excellent in containers.", de:"Warmer, leichter Boden an sonnigem Platz. Basilikum mag keinen Zug und keine Kälte. Ausgezeichnet in Töpfen.", pl:"Ciepła, lekka gleba w słonecznym miejscu. Bazylia nie lubi przeciągów i zimna. Doskonała w doniczkach." },
      whenToPlant: { cs:"Sázejte ven až po 20. května. Bazalka je citlivá na teploty pod 10 °C.", en:"Plant outdoors only after May 20. Basil is sensitive to temperatures below 10°C.", de:"Erst nach dem 20. Mai ins Freie setzen. Basilikum ist empfindlich gegenüber Temperaturen unter 10°C.", pl:"Sadzić na zewnątrz dopiero po 20 maja. Bazylia jest wrażliwa na temperatury poniżej 10°C." },
      spray:       { cs:"Mšice a svilušky. Ošetřete neemovým olejem. Bazalka u rajčat odpuzuje škůdce přirozeně!", en:"Aphids and spider mites. Treat with neem oil. Basil near tomatoes naturally repels pests!", de:"Blattläuse und Spinnmilben. Mit Neemöl behandeln. Basilikum bei Tomaten vertreibt Schädlinge natürlich!", pl:"Mszyce i przędziorki. Leczyć olejem neem. Bazylia przy pomidorach naturalnie odpędza szkodniki!" },
      fertilize:   { cs:"Bazalka potřebuje málo živin. Jednou za 3 týdny tekutým hnojivem. Přehnojení snižuje aroma.", en:"Basil needs few nutrients. Once every 3 weeks with liquid fertilizer. Over-fertilizing reduces aroma.", de:"Basilikum braucht wenig Nährstoffe. Einmal alle 3 Wochen mit flüssigem Dünger. Überdüngung reduziert das Aroma.", pl:"Bazylia potrzebuje mało składników. Raz na 3 tygodnie nawozem płynnym. Przenawożenie zmniejsza aromat." },
      watering:    { cs:"Zalévejte každé 2 dny, vždy dopoledne. Mokré listy v noci způsobují hnilobu. Nenechávejte schnout.", en:"Water every 2 days, always in the morning. Wet leaves at night cause rot. Don't let it dry out.", de:"Jeden 2. Tag gießen, immer vormittags. Nasse Blätter nachts verursachen Fäule. Nicht austrocknen lassen.", pl:"Podlewać co 2 dni, zawsze rano. Mokre liście w nocy powodują gnicie. Nie dopuszczać do wyschnięcia." },
      care:        { cs:"Pravidelně odštipujte vrcholky pro hustší růst. Hned odstraňujte květy – po zakvetení listy zhořknou.", en:"Regularly pinch tops for bushier growth. Remove flowers immediately – after flowering leaves become bitter.", de:"Regelmäßig Spitzen abkneifen für buschigeren Wuchs. Blüten sofort entfernen – nach der Blüte werden Blätter bitter.", pl:"Regularnie szczypać wierzchołki dla bardziej krzaczastego wzrostu. Natychmiast usuwać kwiaty – po zakwitnięciu liście gorzknieją." },
      harvest:     { cs:"Sklízejte průběžně od června. Odštipujte celé větvičky, ne jen listy. Sklizeň stimuluje nový růst.", en:"Harvest continuously from June. Pinch whole branches, not just leaves. Harvesting stimulates new growth.", de:"Ab Juni kontinuierlich ernten. Ganze Zweige abkneifen, nicht nur Blätter. Ernte stimuliert neues Wachstum.", pl:"Zbierać ciągle od czerwca. Szczypać całe gałązki, nie tylko liście. Zbiór stymuluje nowy wzrost." },
      afterHarvest:{ cs:"Bazalka je jednoletá. Na zimu vytrhněte a vyhoďte. Semena si uschovejte pro příští rok.", en:"Basil is annual. Pull out and discard in winter. Save seeds for next year.", de:"Basilikum ist einjährig. Im Winter herausziehen und entsorgen. Samen für nächstes Jahr aufbewahren.", pl:"Bazylia jest roczna. Na zimę wyrwać i wyrzucić. Zachować nasiona na następny rok." },
    },
  },
  {
    id: "rose", emoji: "🌹",
    names: { cs: "Růže", en: "Rose", de: "Rose", pl: "Róża" },
    sowMonths: [3,4,9], harvestMonths: [6,7,8], waterDays: 3, careLevel: "hard",
    details: {
      soilPrep:    { cs:"Hluboká, výživná, mírně kyselá půda (pH 6–6,5). Vykopejte jámu 50×50 cm, přidejte kompost a kostní moučku.", en:"Deep, nutritious, slightly acidic soil (pH 6–6.5). Dig pit 50×50 cm, add compost and bone meal.", de:"Tiefer, nährstoffreicher, leicht saurer Boden (pH 6–6,5). Grube 50×50 cm ausheben, Kompost und Knochenmehl zugeben.", pl:"Głęboka, żyzna, lekko kwaśna gleba (pH 6–6,5). Wykopać dołek 50×50 cm, dodać kompost i mączkę kostną." },
      whenToPlant: { cs:"Sázejte na jaře (březen–duben) nebo na podzim (září–říjen). Kontejnerové růže po celé léto.", en:"Plant in spring (March–April) or autumn (September–October). Container roses throughout summer.", de:"Frühjahr (März–April) oder Herbst (September–Oktober) pflanzen. Containerrosen den ganzen Sommer.", pl:"Sadzić wiosną (marzec–kwiecień) lub jesienią (wrzesień–październik). Róże w pojemnikach przez całe lato." },
      spray:       { cs:"Preventivně stříkejte každé 2 týdny proti padlí, rzivosti a černé skvrnitosti. Používejte speciální přípravky pro růže.", en:"Spray preventively every 2 weeks against mildew, rust and black spot. Use special rose products.", de:"Alle 2 Wochen vorbeugend gegen Mehltau, Rost und Schwarzfleckenkrankheit spritzen. Spezielle Rosenmittel verwenden.", pl:"Profilaktycznie opryskiwać co 2 tygodnie przeciw mączniakowi, rdzy i czarnej plamistości. Używać specjalnych preparatów do róż." },
      fertilize:   { cs:"Na jaře speciální hnojivo pro růže. Po prvním kvetení opakujte. V srpnu přestaňte hnojit.", en:"In spring use special rose fertilizer. Repeat after first flowering. Stop fertilizing in August.", de:"Im Frühjahr Spezialrösendünger verwenden. Nach der ersten Blüte wiederholen. Im August aufhören zu düngen.", pl:"Wiosną używać specjalnego nawozu dla róż. Powtórzyć po pierwszym kwitnieniu. W sierpniu zaprzestać nawożenia." },
      watering:    { cs:"Zalévejte každé 3 dny u kořene, nikdy na listy. Mokré listy vedou k houbovým chorobám.", en:"Water every 3 days at the base, never on leaves. Wet leaves lead to fungal diseases.", de:"Alle 3 Tage an der Wurzel gießen, nie auf die Blätter. Nasse Blätter führen zu Pilzkrankheiten.", pl:"Podlewać co 3 dni przy korzeniu, nigdy na liście. Mokre liście prowadzą do chorób grzybowych." },
      care:        { cs:"Jarní řez v březnu–dubnu na zdravé poupě. Odstraňujte odkvetlé květy. Zimní ochrana choulostivých odrůd.", en:"Spring pruning March–April to healthy bud. Remove spent flowers. Winter protection for tender varieties.", de:"Frühjahrsschnitt März–April bis zur gesunden Knospe. Verblühte Blüten entfernen. Winterschutz für empfindliche Sorten.", pl:"Wiosenne cięcie marzec–kwiecień do zdrowego pąka. Usuwać przekwitnięte kwiaty. Zimowa ochrona wrażliwych odmian." },
      harvest:     { cs:"Sklízejte řezané květy ráno, těsně před plným rozkvětem. Řezejte nad pětilistem. Do vázy s vlažnou vodou.", en:"Cut flowers in the morning, just before full bloom. Cut above a five-leaf set. Place in lukewarm water.", de:"Blumen morgens schneiden, kurz vor der vollen Blüte. Über einem fünfblättrigen Blatt schneiden. In lauwarmes Wasser stellen.", pl:"Ciąć kwiaty rano, tuż przed pełnym rozkwitem. Ciąć nad pięciolistkiem. Wstawić do letniej wody." },
      afterHarvest:{ cs:"Přiřízněte na podzim. Volně nasypte hrstku kompostu kolem kořenů. Choulostivé odrůdy přikryjte chvojím.", en:"Prune lightly in autumn. Loosely apply a handful of compost around roots. Cover tender varieties with spruce branches.", de:"Im Herbst leicht schneiden. Locker eine Handvoll Kompost um die Wurzeln streuen. Empfindliche Sorten mit Tannenreisig abdecken.", pl:"Lekko przyciąć jesienią. Luźno nasypać garść kompostu wokół korzeni. Wrażliwe odmiany przykryć gałązkami świerkowymi." },
    },
  },
];

// ─── Typy pro kalendář ───────────────────────────────────────────────────────

export type CalendarTaskType = "water" | "fertilize" | "harvest" | "sow" | "prune";

export interface CalendarTask {
  type: CalendarTaskType;
  plantEmoji: string;
  plantName: string;
  date: Date;
  description: string;
}

/** Vygeneruje úkoly pro aktuální týden */
export function generateWeekTasks(
  plantIds: string[],
  lang: string
): CalendarTask[] {
  const tasks: CalendarTask[] = [];
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  monday.setHours(0,0,0,0);
  const month = today.getMonth() + 1;

  const taskDescs: Record<string, Record<CalendarTaskType, Record<string,string>>> = {
    water: { water: { cs:"Zavlažit {plant} – zkontroluj vlhkost půdy", en:"Water {plant} – check soil moisture", de:"{plant} gießen – Bodenfeuchtigkeit prüfen", pl:"Podlej {plant} – sprawdź wilgotność gleby" }, fertilize: { cs:"",en:"",de:"",pl:"" }, harvest:{cs:"",en:"",de:"",pl:""}, sow:{cs:"",en:"",de:"",pl:""}, prune:{cs:"",en:"",de:"",pl:""} },
  };
  void taskDescs;

  const descriptions: Record<CalendarTaskType, Record<string,string>> = {
    water:     { cs:"Zavlažit – zkontrolovat vlhkost půdy",  en:"Water – check soil moisture",    de:"Gießen – Bodenfeuchtigkeit prüfen",    pl:"Podlać – sprawdzić wilgotność gleby" },
    fertilize: { cs:"Přihnojit tekutým hnojivem",             en:"Apply liquid fertilizer",         de:"Mit Flüssigdünger nachdüngen",         pl:"Nawieźć nawozem płynnym" },
    harvest:   { cs:"Zkontrolovat zralost, případně sklidit", en:"Check ripeness, harvest if ready", de:"Reife prüfen, ggf. ernten",             pl:"Sprawdzić dojrzałość, zebrać jeśli gotowe" },
    sow:       { cs:"Optimální čas pro výsev / přesazení",    en:"Optimal time for sowing/planting", de:"Optimale Zeit für Aussaat/Umpflanzung", pl:"Optymalny czas na wysiew / sadzenie" },
    prune:     { cs:"Provést řez a tvarování",                en:"Prune and shape the plant",        de:"Schnitt und Formgebung durchführen",   pl:"Wykonać cięcie i formowanie" },
  };

  for (const pid of plantIds) {
    const plant = PLANT_CATALOG.find((p) => p.id === pid);
    if (!plant) continue;
    const name = plant.names[lang] ?? plant.names["cs"];

    // Zálivka – vždy, den dle frekvence
    const waterDay = new Date(monday);
    waterDay.setDate(monday.getDate() + (plant.waterDays % 7));
    tasks.push({
      type: "water",
      plantEmoji: plant.emoji,
      plantName: name,
      date: new Date(waterDay),
      description: descriptions.water[lang] ?? descriptions.water["cs"],
    });

    // Hnojení – v aktivní sezoně v úterý
    if (month >= 4 && month <= 8) {
      const fertDay = new Date(monday);
      fertDay.setDate(monday.getDate() + 1);
      tasks.push({
        type: "fertilize",
        plantEmoji: plant.emoji,
        plantName: name,
        date: fertDay,
        description: descriptions.fertilize[lang] ?? descriptions.fertilize["cs"],
      });
    }

    // Setí
    if (plant.sowMonths.includes(month)) {
      const sowDay = new Date(monday);
      sowDay.setDate(monday.getDate() + 3);
      tasks.push({
        type: "sow",
        plantEmoji: plant.emoji,
        plantName: name,
        date: sowDay,
        description: descriptions.sow[lang] ?? descriptions.sow["cs"],
      });
    }

    // Sklizeň
    if (plant.harvestMonths.includes(month)) {
      const harvestDay = new Date(monday);
      harvestDay.setDate(monday.getDate() + 5);
      tasks.push({
        type: "harvest",
        plantEmoji: plant.emoji,
        plantName: name,
        date: harvestDay,
        description: descriptions.harvest[lang] ?? descriptions.harvest["cs"],
      });
    }
  }

  return tasks
    .filter(t => {
      const d = t.date;
      const end = new Date(monday);
      end.setDate(monday.getDate() + 6);
      return d >= monday && d <= end;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
